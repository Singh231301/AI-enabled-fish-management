import { Inventory, InventoryTransaction, EquipmentMaintenance } from '@prisma/client';

export type InventoryCategory = 'FEED' | 'CHEMICAL' | 'EQUIPMENT' | 'TOOL' | 'OTHER';

export type TransactionType = 'PURCHASE' | 'USAGE' | 'ADJUSTMENT' | 'WASTAGE';

export type TransactionSource = 'MANUAL' | 'FEEDING_LOG' | 'WATER_TREATMENT' | 'EXPENSE_IMPORT' | 'ADJUSTMENT';

export type StockLevelStatus = 'WELL_STOCKED' | 'ADEQUATE' | 'LOW' | 'CRITICAL' | 'OUT_OF_STOCK';

export type MaintenanceStatus = 'PENDING' | 'COMPLETED' | 'OVERDUE' | 'SKIPPED';

export interface StockSummary {
  totalItems: number;
  feedItems: number;
  chemicalItems: number;
  equipmentItems: number;
  toolItems: number;
  otherItems: number;
  lowStockCount: number;
  outOfStockCount: number;
  criticalStockCount: number;
  totalInventoryValue: number;
  feedStockKg: number;
}

export interface EnrichedInventoryItem extends Omit<Inventory, 'category'> {
  category: InventoryCategory;
  stockStatus: StockLevelStatus;
  avgDailyUsageKg: number;
  daysRemaining: number | null;
}

export interface TransactionWithItem extends InventoryTransaction {
  inventory: {
    itemName: string;
    unit: string;
    category: string;
  };
}

export interface MaintenanceWithItem extends EquipmentMaintenance {
  inventory: {
    itemName: string;
    category: string;
    pondId?: string;
    pond?: {
      userId: string;
      name: string;
    };
  };
}

export interface DailyUsage {
  date: string;
  quantity: number;
}

export interface FeedInventoryStatus {
  items: EnrichedInventoryItem[];
  totalStockKg: number;
  lowStockItems: EnrichedInventoryItem[];
  estimatedDaysRemaining: number | null;
}

export interface InventoryStats {
  stockSummary: StockSummary;
  lowStockItems: EnrichedInventoryItem[];
  feedInventory: FeedInventoryStatus;
  upcomingMaintenance: MaintenanceWithItem[];
  recentTransactions: TransactionWithItem[];
  totalInventoryValue: number;
}

export interface InventoryOverview {
  stats: InventoryStats;
  allItems: EnrichedInventoryItem[];
  recentTransactions: TransactionWithItem[];
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
