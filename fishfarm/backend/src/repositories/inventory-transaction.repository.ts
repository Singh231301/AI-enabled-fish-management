import { PrismaClient, InventoryTransaction, Prisma } from '@prisma/client';
import { BaseRepository } from './base.repository';
import { DailyUsage, TransactionWithItem } from '../types/inventory.types';

export class InventoryTransactionRepository extends BaseRepository<InventoryTransaction> {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  async findById(id: string): Promise<InventoryTransaction | null> {
    return this.prisma.inventoryTransaction.findUnique({
      where: { id },
      include: { inventory: { select: { itemName: true, unit: true, category: true } } }
    });
  }

  async findByInventoryId(
    inventoryId: string,
    filters: {
      transactionType?: string;
      startDate?: Date;
      endDate?: Date;
      skip: number;
      take: number;
    }
  ): Promise<{ records: InventoryTransaction[]; total: number }> {
    const where: Prisma.InventoryTransactionWhereInput = {
      inventoryId,
      ...(filters.transactionType ? { transactionType: filters.transactionType as any } : {}),
      ...(filters.startDate || filters.endDate ? {
        transactionDate: {
          ...(filters.startDate ? { gte: filters.startDate } : {}),
          ...(filters.endDate ? { lte: filters.endDate } : {})
        }
      } : {})
    };

    const [records, total] = await Promise.all([
      this.prisma.inventoryTransaction.findMany({
        where,
        include: { inventory: { select: { itemName: true, unit: true, category: true } } },
        orderBy: { transactionDate: 'desc' },
        skip: filters.skip,
        take: filters.take
      }),
      this.prisma.inventoryTransaction.count({ where })
    ]);

    return { records, total };
  }

  async findByPondId(
    pondId: string,
    filters: {
      transactionType?: string;
      startDate?: Date;
      endDate?: Date;
      skip: number;
      take: number;
    }
  ): Promise<{ records: any[]; total: number }> {
    const where: Prisma.InventoryTransactionWhereInput = {
      inventory: { pondId },
      ...(filters.transactionType ? { transactionType: filters.transactionType as any } : {}),
      ...(filters.startDate || filters.endDate ? {
        transactionDate: {
          ...(filters.startDate ? { gte: filters.startDate } : {}),
          ...(filters.endDate ? { lte: filters.endDate } : {})
        }
      } : {})
    };

    const [records, total] = await Promise.all([
      this.prisma.inventoryTransaction.findMany({
        where,
        include: {
          inventory: {
            select: { itemName: true, unit: true, category: true }
          }
        },
        orderBy: { transactionDate: 'desc' },
        skip: filters.skip,
        take: filters.take
      }),
      this.prisma.inventoryTransaction.count({ where })
    ]);

    return { records, total };
  }

  async findBySourceId(sourceId: string): Promise<InventoryTransaction[]> {
    return this.prisma.inventoryTransaction.findMany({
      where: { sourceId }
    });
  }

  async getTotalPurchased(inventoryId: string, startDate?: Date): Promise<number> {
    const res = await this.prisma.inventoryTransaction.aggregate({
      where: {
        inventoryId,
        transactionType: 'PURCHASE',
        ...(startDate ? { transactionDate: { gte: startDate } } : {})
      },
      _sum: { quantity: true }
    });
    return res._sum.quantity ?? 0;
  }

  async getTotalUsed(inventoryId: string, startDate?: Date): Promise<number> {
    const res = await this.prisma.inventoryTransaction.aggregate({
      where: {
        inventoryId,
        transactionType: { in: ['USAGE', 'WASTAGE'] },
        ...(startDate ? { transactionDate: { gte: startDate } } : {})
      },
      _sum: { quantity: true }
    });
    return res._sum.quantity ?? 0;
  }

  async getDailyUsage(inventoryId: string, days: number): Promise<DailyUsage[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const records = await this.prisma.inventoryTransaction.findMany({
      where: {
        inventoryId,
        transactionType: { in: ['USAGE', 'WASTAGE'] },
        transactionDate: { gte: startDate }
      },
      select: { transactionDate: true, quantity: true }
    });

    const usageMap = new Map<string, number>();
    for (const record of records) {
      const dateStr = record.transactionDate.toISOString().split('T')[0];
      usageMap.set(dateStr, (usageMap.get(dateStr) ?? 0) + record.quantity);
    }

    const result: DailyUsage[] = [];
    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      result.push({
        date: dateStr,
        quantity: usageMap.get(dateStr) ?? 0
      });
    }

    return result.reverse();
  }

  async getAverageUsagePerDay(inventoryId: string, days: number): Promise<number> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const totalUsed = await this.getTotalUsed(inventoryId, startDate);
    return totalUsed / days;
  }

  async getMonthlyCost(inventoryId: string): Promise<number> {
    const startDate = new Date();
    startDate.setDate(1); // Start of month
    startDate.setHours(0, 0, 0, 0);

    const res = await this.prisma.inventoryTransaction.aggregate({
      where: {
        inventoryId,
        transactionType: 'PURCHASE',
        transactionDate: { gte: startDate }
      },
      _sum: { totalCost: true }
    });

    return res._sum.totalCost ?? 0;
  }

  async create(data: Prisma.InventoryTransactionCreateInput): Promise<InventoryTransaction> {
    return this.prisma.inventoryTransaction.create({ data });
  }

  async createMany(data: Prisma.InventoryTransactionCreateManyInput[]): Promise<{ count: number }> {
    return this.prisma.inventoryTransaction.createMany({ data });
  }

  async delete(id: string): Promise<InventoryTransaction> {
    return this.prisma.inventoryTransaction.delete({ where: { id } });
  }
}
