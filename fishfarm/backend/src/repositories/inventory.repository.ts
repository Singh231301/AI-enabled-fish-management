import { PrismaClient, Inventory, Prisma } from '@prisma/client';
import { BaseRepository } from './base.repository';
import { StockSummary, EnrichedInventoryItem, FeedInventoryStatus } from '../types/inventory.types';

export class InventoryRepository extends BaseRepository<Inventory> {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  async findById(id: string): Promise<Inventory | null> {
    return this.prisma.inventory.findUnique({
      where: { id },
      include: {
        transactions: {
          orderBy: { transactionDate: 'desc' },
          take: 5
        },
        maintenanceSchedules: {
          where: { status: { in: ['PENDING', 'OVERDUE'] } },
          orderBy: { scheduledDate: 'asc' },
          take: 3
        }
      }
    });
  }

  async findByIdAndPondId(id: string, pondId: string): Promise<Inventory | null> {
    return this.prisma.inventory.findFirst({ where: { id, pondId, isActive: true } });
  }

  async findByPondId(
    pondId: string,
    filters: {
      category?: string;
      lowStockOnly?: boolean;
      isActive?: boolean;
      skip: number;
      take: number;
    }
  ): Promise<{ items: any[]; total: number }> {
    const where: Prisma.InventoryWhereInput = {
      pondId,
      isActive: filters.isActive ?? true,
      ...(filters.category ? { category: filters.category as any } : {})
    };

    const allItems = await this.prisma.inventory.findMany({
      where,
      include: { _count: { select: { transactions: true } } },
      orderBy: { itemName: 'asc' }
    });

    const filtered = filters.lowStockOnly
      ? allItems.filter(i => i.currentQuantity <= i.reorderThreshold)
      : allItems;

    const total = filtered.length;
    const items = filtered.slice(filters.skip, filters.skip + filters.take);
    return { items, total };
  }

  async findByPondIdAndCategory(pondId: string, category: string): Promise<Inventory[]> {
    return this.prisma.inventory.findMany({
      where: { pondId, category: category as any, isActive: true },
      orderBy: { itemName: 'asc' }
    });
  }

  async findLowStockItems(pondId: string): Promise<Inventory[]> {
    const allActive = await this.prisma.inventory.findMany({
      where: { pondId, isActive: true }
    });
    return allActive
      .filter(item => item.currentQuantity <= item.reorderThreshold)
      .sort((a, b) => {
        const ratioA = a.reorderThreshold > 0 ? a.currentQuantity / a.reorderThreshold : 0;
        const ratioB = b.reorderThreshold > 0 ? b.currentQuantity / b.reorderThreshold : 0;
        return ratioA - ratioB;
      });
  }

  async findByNameMatch(pondId: string, name: string): Promise<Inventory | null> {
    return this.prisma.inventory.findFirst({
      where: {
        pondId,
        isActive: true,
        category: 'FEED',
        itemName: { contains: name, mode: 'insensitive' }
      }
    });
  }
  
  async findChemicalByNameMatch(pondId: string, name: string): Promise<Inventory | null> {
    return this.prisma.inventory.findFirst({
      where: {
        pondId,
        isActive: true,
        category: 'CHEMICAL',
        itemName: { contains: name, mode: 'insensitive' }
      }
    });
  }

  async updateQuantity(id: string, newQuantity: number, lastTransactionDate: Date): Promise<Inventory> {
    return this.prisma.inventory.update({
      where: { id },
      data: {
        currentQuantity: newQuantity,
        lastTransactionDate,
        updatedAt: new Date()
      }
    });
  }

  async incrementStats(id: string, field: 'totalPurchasedKg' | 'totalUsedKg', amount: number): Promise<void> {
    await this.prisma.inventory.update({
      where: { id },
      data: {
        [field]: { increment: amount }
      }
    });
  }

  async create(data: Prisma.InventoryCreateInput): Promise<Inventory> {
    return this.prisma.inventory.create({ data });
  }

  async update(id: string, data: Prisma.InventoryUpdateInput): Promise<Inventory> {
    return this.prisma.inventory.update({ where: { id }, data });
  }

  async softDelete(id: string): Promise<Inventory> {
    return this.prisma.inventory.update({
      where: { id },
      data: { isActive: false, updatedAt: new Date() }
    });
  }

  async getStockSummary(pondId: string): Promise<StockSummary> {
    const allActive = await this.prisma.inventory.findMany({
      where: { pondId, isActive: true }
    });

    let feedItems = 0, chemicalItems = 0, equipmentItems = 0, toolItems = 0, otherItems = 0;
    let lowStockCount = 0, outOfStockCount = 0, criticalStockCount = 0;
    let totalInventoryValue = 0, feedStockKg = 0;

    for (const item of allActive) {
      if (item.category === 'FEED') {
        feedItems++;
        if (item.unit === 'kg') feedStockKg += item.currentQuantity;
        else if (item.unit === 'g') feedStockKg += item.currentQuantity / 1000;
      }
      else if (item.category === 'CHEMICAL') chemicalItems++;
      else if (item.category === 'EQUIPMENT') equipmentItems++;
      else if (item.category === 'TOOL') toolItems++;
      else otherItems++;

      if (item.currentQuantity === 0) outOfStockCount++;
      else {
        if (item.currentQuantity <= item.reorderThreshold) {
          lowStockCount++;
          if (item.reorderThreshold > 0 && item.currentQuantity < item.reorderThreshold / 2) {
            criticalStockCount++;
          }
        }
      }

      if (item.unitCost && item.currentQuantity > 0) {
        totalInventoryValue += item.unitCost * item.currentQuantity;
      }
    }

    return {
      totalItems: allActive.length,
      feedItems,
      chemicalItems,
      equipmentItems,
      toolItems,
      otherItems,
      lowStockCount: lowStockCount + outOfStockCount,
      outOfStockCount,
      criticalStockCount,
      totalInventoryValue,
      feedStockKg
    };
  }

  async getFeedInventory(pondId: string): Promise<{ items: Inventory[]; totalStockKg: number }> {
    const items = await this.prisma.inventory.findMany({
      where: { pondId, category: 'FEED', isActive: true },
      orderBy: { itemName: 'asc' }
    });

    let totalStockKg = 0;
    for (const item of items) {
      if (item.unit === 'kg') totalStockKg += item.currentQuantity;
      else if (item.unit === 'g') totalStockKg += item.currentQuantity / 1000;
    }

    return { items, totalStockKg };
  }
}
