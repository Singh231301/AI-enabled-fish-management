import { Inventory, InventoryTransaction, EquipmentMaintenance } from '@prisma/client';
import { InventoryRepository } from '../repositories/inventory.repository';
import { InventoryTransactionRepository } from '../repositories/inventory-transaction.repository';
import { EquipmentMaintenanceRepository } from '../repositories/equipment-maintenance.repository';
import { PondRepository } from '../repositories/pond.repository';
import { ActivityLogRepository } from '../repositories/activity-log.repository';
import { NotificationService } from './notifications.service';
import { ExpenseRepository } from '../repositories/expense.repository';
import { AppError } from '../utils/app-error';
import { differenceInDays, addDays } from 'date-fns';
import {
  CreateInventoryItemDTO,
  UpdateInventoryItemDTO,
  RecordPurchaseDTO,
  RecordUsageDTO,
  AdjustStockDTO,
  CreateMaintenanceDTO,
  CompleteMaintenanceDTO,
  InventoryQuery,
  TransactionQuery
} from '../validators/inventory.validator';
import {
  StockLevelStatus,
  InventoryStats,
  InventoryOverview,
  MaintenanceWithItem,
  TransactionWithItem,
  EnrichedInventoryItem,
  InventoryCategory,
  TransactionSource
} from '../types/inventory.types';

export class InventoryService {
  constructor(
    private inventoryRepo: InventoryRepository,
    private transactionRepo: InventoryTransactionRepository,
    private maintenanceRepo: EquipmentMaintenanceRepository,
    private pondRepo: PondRepository,
    private activityRepo: ActivityLogRepository,
    private notificationService: NotificationService,
    private expenseRepo: ExpenseRepository
  ) {}

  private calculateStockLevel(item: Inventory): StockLevelStatus {
    const ratio = item.reorderThreshold > 0
      ? item.currentQuantity / item.reorderThreshold
      : item.currentQuantity > 0 ? 1 : 0;
    
    if (item.currentQuantity === 0) return 'OUT_OF_STOCK';
    if (ratio < 0.5) return 'CRITICAL';
    if (ratio <= 1) return 'LOW';
    if (ratio <= 2) return 'ADEQUATE';
    return 'WELL_STOCKED';
  }

  private estimateDaysRemaining(currentQuantity: number, avgUsagePerDay: number): number | null {
    if (avgUsagePerDay <= 0) return null;
    return Math.floor(currentQuantity / avgUsagePerDay);
  }

  async createInventoryItem(dto: CreateInventoryItemDTO, userId: string): Promise<Inventory> {
    const pond = await this.pondRepo.findByIdAndUserId(dto.pondId, userId);
    if (!pond) throw new AppError("Pond not found", 404);

    const existing = await this.inventoryRepo.findByNameMatch(dto.pondId, dto.itemName);
    
    const item = await this.inventoryRepo.create({
      itemName: dto.itemName,
      category: dto.category as any,
      description: dto.description ?? null,
      currentQuantity: dto.currentQuantity,
      unit: dto.unit,
      reorderThreshold: dto.reorderThreshold,
      unitCost: dto.unitCost ?? null,
      supplier: dto.supplier ?? null,
      location: dto.location ?? null,
      pond: { connect: { id: dto.pondId } },
      user: { connect: { id: userId } }
    });

    if (dto.currentQuantity > 0) {
      await this.transactionRepo.create({
        transactionType: 'PURCHASE',
        quantity: dto.currentQuantity,
        unitCost: dto.unitCost ?? null,
        totalCost: dto.unitCost ? dto.unitCost * dto.currentQuantity : null,
        transactionDate: new Date(),
        referenceNote: "Opening stock",
        sourceType: 'MANUAL',
        balanceAfter: dto.currentQuantity,
        user: { connect: { id: userId } },
        inventory: { connect: { id: item.id } }
      });
      await this.inventoryRepo.incrementStats(item.id, 'totalPurchasedKg', dto.currentQuantity);
    }

    if (dto.currentQuantity <= dto.reorderThreshold) {
      await this.notificationService.checkAndCreate({
        userId,
        pondId: dto.pondId,
        title: `Low Stock: ${dto.itemName}`,
        message: `${dto.itemName} starts at ${dto.currentQuantity}${dto.unit}, which is at or below the reorder threshold of ${dto.reorderThreshold}${dto.unit}.`,
        type: 'LOW_STOCK',
        priority: 'MEDIUM',
        actionUrl: '/inventory'
      });
    }

    await this.activityRepo.create({
      action: 'CREATE',
      module: 'INVENTORY',
      recordId: item.id,
      details: { name: item.itemName },
      user: { connect: { id: userId } }
    } as any);

    return item;
  }

  async getInventoryItems(pondId: string, userId: string, query: InventoryQuery): Promise<{ items: EnrichedInventoryItem[]; total: number; stockSummary: any }> {
    const pond = await this.pondRepo.findByIdAndUserId(pondId, userId);
    if (!pond) throw new AppError("Pond not found", 404);

    const [result, stockSummary] = await Promise.all([
      this.inventoryRepo.findByPondId(pondId, {
        category: query.category,
        lowStockOnly: query.lowStockOnly,
        isActive: query.isActive,
        skip: (query.page - 1) * query.limit,
        take: query.limit
      }),
      this.inventoryRepo.getStockSummary(pondId)
    ]);

    const items: EnrichedInventoryItem[] = await Promise.all(result.items.map(async (item) => {
      const avgUsage = await this.transactionRepo.getAverageUsagePerDay(item.id, 30);
      return {
        ...item,
        category: item.category as InventoryCategory,
        stockStatus: this.calculateStockLevel(item),
        avgDailyUsageKg: avgUsage,
        daysRemaining: this.estimateDaysRemaining(item.currentQuantity, avgUsage)
      };
    }));

    return { items, total: result.total, stockSummary };
  }

  async getInventoryItemById(id: string, pondId: string, userId: string): Promise<EnrichedInventoryItem> {
    const pond = await this.pondRepo.findByIdAndUserId(pondId, userId);
    if (!pond) throw new AppError("Pond not found", 404);

    const item = await this.inventoryRepo.findByIdAndPondId(id, pondId);
    if (!item) throw new AppError("Item not found", 404);

    const avgUsage = await this.transactionRepo.getAverageUsagePerDay(item.id, 30);
    return {
      ...item,
      category: item.category as InventoryCategory,
      stockStatus: this.calculateStockLevel(item),
      avgDailyUsageKg: avgUsage,
      daysRemaining: this.estimateDaysRemaining(item.currentQuantity, avgUsage)
    };
  }

  async updateInventoryItem(id: string, pondId: string, userId: string, dto: UpdateInventoryItemDTO): Promise<Inventory> {
    const pond = await this.pondRepo.findByIdAndUserId(pondId, userId);
    if (!pond) throw new AppError("Pond not found", 404);

    const existing = await this.inventoryRepo.findByIdAndPondId(id, pondId);
    if (!existing) throw new AppError("Item not found", 404);

    const updated = await this.inventoryRepo.update(id, dto);

    if (dto.reorderThreshold !== undefined && updated.currentQuantity <= dto.reorderThreshold) {
      await this.notificationService.checkAndCreate({
        userId,
        pondId,
        title: `Low Stock: ${updated.itemName}`,
        message: `${updated.itemName} is low: ${updated.currentQuantity}${updated.unit} remaining (threshold: ${dto.reorderThreshold}${updated.unit}).`,
        type: 'LOW_STOCK',
        priority: updated.currentQuantity === 0 ? 'HIGH' : 'MEDIUM',
        actionUrl: '/inventory'
      });
    }

    return updated;
  }

  async deactivateInventoryItem(id: string, pondId: string, userId: string): Promise<void> {
    const pond = await this.pondRepo.findByIdAndUserId(pondId, userId);
    if (!pond) throw new AppError("Pond not found", 404);

    const existing = await this.inventoryRepo.findByIdAndPondId(id, pondId);
    if (!existing) throw new AppError("Item not found", 404);

    await this.inventoryRepo.softDelete(id);
  }

  async recordPurchase(dto: RecordPurchaseDTO, userId: string): Promise<{ inventory: Inventory; transaction: InventoryTransaction }> {
    const pond = await this.pondRepo.findByIdAndUserId(dto.pondId, userId);
    if (!pond) throw new AppError("Pond not found", 404);

    const item = await this.inventoryRepo.findByIdAndPondId(dto.inventoryId, dto.pondId);
    if (!item) throw new AppError("Inventory item not found", 404);

    const newQuantity = item.currentQuantity + dto.quantity;
    const totalCost = dto.totalCost ?? (dto.unitCost ? dto.unitCost * dto.quantity : null);

    const transaction = await this.transactionRepo.create({
      inventory: { connect: { id: dto.inventoryId } },
      transactionType: 'PURCHASE',
      quantity: dto.quantity,
      unitCost: dto.unitCost ?? item.unitCost,
      totalCost,
      transactionDate: new Date(dto.purchaseDate),
      referenceNote: dto.notes ?? null,
      sourceType: 'MANUAL',
      sourceId: null,
      supplier: dto.supplier ?? item.supplier,
      invoiceNumber: dto.invoiceNumber ?? null,
      balanceAfter: newQuantity,
      user: { connect: { id: userId } }
    });

    await this.inventoryRepo.update(dto.inventoryId, {
      currentQuantity: newQuantity,
      lastTransactionDate: new Date(dto.purchaseDate),
      lastRestockedDate: new Date(dto.purchaseDate),
      ...(dto.supplier ? { supplier: dto.supplier } : {}),
      ...(dto.unitCost ? { unitCost: dto.unitCost } : {}),
      totalPurchasedKg: { increment: dto.quantity }
    } as any);

    if (dto.createExpenseRecord && totalCost && totalCost > 0) {
      const category = item.category === 'FEED' ? 'FEED' : item.category === 'CHEMICAL' ? 'CHEMICALS_LIME' : 'EQUIPMENT';
      await this.expenseRepo.create({
        expenseDate: new Date(dto.purchaseDate),
        category: category as any,
        itemName: `${item.itemName} purchase`,
        quantity: dto.quantity,
        unit: item.unit,
        unitPrice: dto.unitCost ?? item.unitCost ?? null,
        totalAmount: totalCost,
        vendorName: dto.supplier ?? null,
        receiptNumber: dto.invoiceNumber ?? null,
        isAutoGenerated: true,
        sourceModule: 'inventory',
        sourceRecordId: transaction.id,
        pond: { connect: { id: dto.pondId } },
        user: { connect: { id: userId } }
      } as any);
    }

    await this.activityRepo.create({
      action: 'CREATE',
      module: 'INVENTORY',
      recordId: transaction.id,
      details: { name: `Purchased ${dto.quantity}${item.unit} of ${item.itemName}` },
      user: { connect: { id: userId } }
    } as any);

    const updatedInventory = await this.inventoryRepo.findById(dto.inventoryId);
    return { inventory: updatedInventory!, transaction };
  }

  async recordUsage(dto: RecordUsageDTO, userId: string): Promise<{ inventory: Inventory; transaction: InventoryTransaction }> {
    const pond = await this.pondRepo.findByIdAndUserId(dto.pondId, userId);
    if (!pond) throw new AppError("Pond not found", 404);

    const item = await this.inventoryRepo.findByIdAndPondId(dto.inventoryId, dto.pondId);
    if (!item) throw new AppError("Inventory item not found", 404);

    if (item.currentQuantity < dto.quantity) {
      throw new AppError(`Insufficient stock. Available: ${item.currentQuantity}${item.unit}. Requested: ${dto.quantity}${item.unit}.`, 400);
    }

    const newQuantity = item.currentQuantity - dto.quantity;

    const transaction = await this.transactionRepo.create({
      inventory: { connect: { id: dto.inventoryId } },
      transactionType: 'USAGE',
      quantity: dto.quantity,
      transactionDate: new Date(dto.usageDate),
      sourceType: dto.sourceType as any,
      sourceId: dto.sourceId ?? null,
      balanceAfter: newQuantity,
      referenceNote: dto.notes ?? null,
      user: { connect: { id: userId } }
    });

    await this.inventoryRepo.update(dto.inventoryId, {
      currentQuantity: newQuantity,
      lastTransactionDate: new Date(dto.usageDate),
      totalUsedKg: { increment: dto.quantity }
    } as any);

    if (newQuantity <= item.reorderThreshold) {
      const alertPriority = newQuantity === 0 ? 'HIGH' : 'MEDIUM';
      const alertTitle = newQuantity === 0 ? `Out of Stock: ${item.itemName}` : `Low Stock: ${item.itemName}`;
      const alertMsg = newQuantity === 0 ? `${item.itemName} is now out of stock. Purchase immediately.` : `${item.itemName} is low: ${newQuantity}${item.unit} remaining (threshold: ${item.reorderThreshold}${item.unit}).`;
      
      await this.notificationService.checkAndCreate({
        userId,
        pondId: dto.pondId,
        title: alertTitle,
        message: alertMsg,
        type: 'LOW_STOCK',
        priority: alertPriority,
        actionUrl: '/inventory'
      });
    }

    const updatedInventory = await this.inventoryRepo.findById(dto.inventoryId);
    return { inventory: updatedInventory!, transaction };
  }

  async autoDeductFeedUsage(pondId: string, userId: string, feedingLogId: string, feedBrand: string | null, quantityGrams: number, feedDate: Date): Promise<void> {
    if (!feedBrand) return;

    const existing = await this.transactionRepo.findBySourceId(feedingLogId);
    if (existing.length > 0) return;

    const feedItem = await this.inventoryRepo.findByNameMatch(pondId, feedBrand);
    if (!feedItem) return;

    const quantityKg = quantityGrams / 1000;
    if (feedItem.currentQuantity < quantityKg) return;

    await this.recordUsage({
      inventoryId: feedItem.id,
      pondId,
      quantity: quantityKg,
      usageDate: feedDate.toISOString(),
      sourceType: 'FEEDING_LOG',
      sourceId: feedingLogId,
      notes: `Auto-deducted from feeding log`
    }, userId);
  }

  async autoDeductChemicalUsage(pondId: string, userId: string, treatmentId: string, chemicalName: string, quantityKg: number, treatmentDate: Date): Promise<void> {
    if (!chemicalName) return;

    const existing = await this.transactionRepo.findBySourceId(treatmentId);
    if (existing.length > 0) return;

    const chemicalItem = await this.inventoryRepo.findChemicalByNameMatch(pondId, chemicalName);
    if (!chemicalItem) return;

    if (chemicalItem.currentQuantity < quantityKg) return;

    await this.recordUsage({
      inventoryId: chemicalItem.id,
      pondId,
      quantity: quantityKg,
      usageDate: treatmentDate.toISOString(),
      sourceType: 'WATER_TREATMENT',
      sourceId: treatmentId,
      notes: `Auto-deducted from water treatment log`
    }, userId);
  }

  async adjustStock(dto: AdjustStockDTO, userId: string): Promise<Inventory> {
    const pond = await this.pondRepo.findByIdAndUserId(dto.pondId, userId);
    if (!pond) throw new AppError("Pond not found", 404);

    const item = await this.inventoryRepo.findByIdAndPondId(dto.inventoryId, dto.pondId);
    if (!item) throw new AppError("Inventory item not found", 404);

    const oldQuantity = item.currentQuantity;
    const diff = dto.newQuantity - oldQuantity;
    const transactionType = diff >= 0 ? 'PURCHASE' : 'USAGE';

    await this.transactionRepo.create({
      inventory: { connect: { id: dto.inventoryId } },
      transactionType: 'ADJUSTMENT',
      quantity: Math.abs(diff),
      transactionDate: new Date(),
      sourceType: 'ADJUSTMENT',
      referenceNote: dto.reason,
      balanceAfter: dto.newQuantity,
      user: { connect: { id: userId } }
    });

    return this.inventoryRepo.updateQuantity(dto.inventoryId, dto.newQuantity, new Date());
  }

  async getInventoryStats(pondId: string, userId: string): Promise<InventoryStats> {
    const pond = await this.pondRepo.findByIdAndUserId(pondId, userId);
    if (!pond) throw new AppError("Pond not found", 404);

    const [
      allItems,
      stockSummary,
      lowStockItems,
      recentTransactions,
      upcomingMaintenance,
      feedInventory
    ] = await Promise.all([
      this.inventoryRepo.findByPondId(pondId, { isActive: true, skip: 0, take: 1000 }),
      this.inventoryRepo.getStockSummary(pondId),
      this.inventoryRepo.findLowStockItems(pondId),
      this.transactionRepo.findByPondId(pondId, { skip: 0, take: 10 }),
      this.maintenanceRepo.findUpcoming(pondId, 7),
      this.inventoryRepo.getFeedInventory(pondId)
    ]);

    const enrichedLowStock: EnrichedInventoryItem[] = await Promise.all(
      lowStockItems.map(async item => {
        const avgUsage = await this.transactionRepo.getAverageUsagePerDay(item.id, 30);
        return {
          ...item,
          category: item.category as InventoryCategory,
          avgDailyUsageKg: avgUsage,
          estimatedDaysRemaining: this.estimateDaysRemaining(item.currentQuantity, avgUsage),
          stockStatus: this.calculateStockLevel(item),
          daysRemaining: this.estimateDaysRemaining(item.currentQuantity, avgUsage)
        };
      })
    );

    const feedItems = allItems.items.filter(i => i.category === 'FEED');
    const feedAnalysis: EnrichedInventoryItem[] = await Promise.all(
      feedItems.map(async feed => {
        const avgDaily = await this.transactionRepo.getAverageUsagePerDay(feed.id, 30);
        return {
          ...feed,
          category: feed.category as InventoryCategory,
          avgDailyUsageKg: avgDaily,
          daysRemaining: this.estimateDaysRemaining(feed.currentQuantity, avgDaily),
          stockStatus: this.calculateStockLevel(feed)
        };
      })
    );

    let totalInventoryValue = 0;
    for (const item of allItems.items) {
      if (item.unitCost && item.currentQuantity) {
        totalInventoryValue += item.unitCost * item.currentQuantity;
      }
    }

    return {
      stockSummary,
      lowStockItems: enrichedLowStock,
      feedInventory: {
        items: feedAnalysis,
        totalStockKg: feedInventory.totalStockKg,
        lowStockItems: enrichedLowStock.filter(i => i.category === 'FEED'),
        estimatedDaysRemaining: feedAnalysis.length > 0 ? this.estimateDaysRemaining(feedInventory.totalStockKg, feedAnalysis.reduce((sum, item) => sum + item.avgDailyUsageKg, 0)) : null
      },
      upcomingMaintenance: upcomingMaintenance as MaintenanceWithItem[],
      recentTransactions: recentTransactions.records as TransactionWithItem[],
      totalInventoryValue
    };
  }

  async getInventoryOverview(pondId: string, userId: string): Promise<InventoryOverview> {
    const stats = await this.getInventoryStats(pondId, userId);
    const allItemsReq = await this.getInventoryItems(pondId, userId, { isActive: true, pondId, page: 1, limit: 1000 });
    const transReq = await this.getTransactions(pondId, userId, { pondId, page: 1, limit: 20 });
    return {
      stats,
      allItems: allItemsReq.items,
      recentTransactions: transReq.records
    };
  }

  async scheduleMaintenance(dto: CreateMaintenanceDTO, userId: string): Promise<EquipmentMaintenance> {
    const item = await this.inventoryRepo.findById(dto.inventoryId);
    if (!item) throw new AppError("Item not found", 404);
    
    if (!['EQUIPMENT', 'TOOL'].includes(item.category)) {
      throw new AppError("Maintenance can only be scheduled for equipment and tools", 400);
    }

    const maintenance = await this.maintenanceRepo.create({
      inventory: { connect: { id: dto.inventoryId } },
      scheduledDate: new Date(dto.scheduledDate),
      maintenanceType: dto.maintenanceType,
      description: dto.description ?? null,
      cost: dto.cost ?? null,
      status: 'PENDING',
      notes: dto.notes ?? null,
      nextScheduledDate: dto.nextScheduledDate ? new Date(dto.nextScheduledDate) : null,
      user: { connect: { id: userId } }
    });

    const daysUntil = differenceInDays(new Date(dto.scheduledDate), new Date());
    if (daysUntil <= 7) {
      await this.notificationService.checkAndCreate({
        userId,
        pondId: item.pondId,
        title: `Equipment Maintenance: ${item.itemName}`,
        message: `${dto.maintenanceType} scheduled for ${item.itemName} in ${daysUntil} day(s).`,
        type: 'TASK_DUE',
        priority: daysUntil <= 0 ? 'HIGH' : 'MEDIUM',
        actionUrl: '/inventory'
      });
    }

    return maintenance;
  }

  async completeMaintenance(maintenanceId: string, userId: string, dto: CompleteMaintenanceDTO): Promise<EquipmentMaintenance> {
    const maintenance = await this.maintenanceRepo.findById(maintenanceId);
    if (!maintenance) throw new AppError("Maintenance record not found", 404);
    if (maintenance.status === 'COMPLETED') throw new AppError("Already completed", 400);

    const completed = await this.maintenanceRepo.update(maintenanceId, {
      status: 'COMPLETED',
      completedDate: new Date(dto.completedDate),
      cost: dto.cost ?? null,
      notes: dto.notes ?? null,
      nextScheduledDate: dto.nextScheduledDate ? new Date(dto.nextScheduledDate) : null
    });

    if (dto.nextScheduledDate) {
      await this.scheduleMaintenance({
        inventoryId: completed.inventoryId,
        scheduledDate: dto.nextScheduledDate,
        maintenanceType: completed.maintenanceType,
        description: completed.description ?? undefined
      }, userId);
    }

    if (dto.cost && dto.cost > 0) {
      const item = await this.inventoryRepo.findById(completed.inventoryId);
      if (item) {
        await this.expenseRepo.create({
          expenseDate: new Date(dto.completedDate),
          category: 'EQUIPMENT',
          itemName: `Maintenance: ${item.itemName} - ${completed.maintenanceType}`,
          totalAmount: dto.cost,
          isAutoGenerated: true,
          sourceModule: 'inventory',
          sourceRecordId: completed.id,
          pond: { connect: { id: item.pondId } },
          user: { connect: { id: userId } }
        } as any);
      }
    }

    return completed;
  }

  async getMaintenanceSchedule(pondId: string, userId: string): Promise<MaintenanceWithItem[]> {
    const pond = await this.pondRepo.findByIdAndUserId(pondId, userId);
    if (!pond) throw new AppError("Pond not found", 404);
    return this.maintenanceRepo.findPendingByPondId(pondId) as unknown as Promise<MaintenanceWithItem[]>;
  }

  async getTransactions(pondId: string, userId: string, query: TransactionQuery): Promise<{ records: TransactionWithItem[]; total: number; pagination: any }> {
    const pond = await this.pondRepo.findByIdAndUserId(pondId, userId);
    if (!pond) throw new AppError("Pond not found", 404);

    const res = await this.transactionRepo.findByPondId(pondId, {
      transactionType: query.transactionType,
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
      skip: (query.page - 1) * query.limit,
      take: query.limit
    });

    return {
      records: res.records as TransactionWithItem[],
      total: res.total,
      pagination: {
        total: res.total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(res.total / query.limit)
      }
    };
  }
}
