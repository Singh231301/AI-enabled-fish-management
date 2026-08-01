export type InventoryCategory = 'FEED' | 'CHEMICAL' | 'EQUIPMENT' | 'TOOL' | 'OTHER';
export type TransactionType = 'PURCHASE' | 'USAGE' | 'ADJUSTMENT' | 'WASTAGE';
export type TransactionSource = 'MANUAL' | 'FEEDING_LOG' | 'WATER_TREATMENT' | 'EXPENSE_IMPORT' | 'ADJUSTMENT';
export type StockLevelStatus = 'WELL_STOCKED' | 'ADEQUATE' | 'LOW' | 'CRITICAL' | 'OUT_OF_STOCK';
export type MaintenanceStatus = 'PENDING' | 'COMPLETED' | 'OVERDUE' | 'SKIPPED';

export interface InventoryItem {
  id: string;
  pondId: string;
  itemName: string;
  category: InventoryCategory;
  description: string | null;
  currentQuantity: number;
  unit: string;
  reorderThreshold: number;
  unitCost: number | null;
  supplier: string | null;
  location: string | null;
  isActive: boolean;
  totalPurchasedKg: number;
  totalUsedKg: number;
  lastRestockedDate: string | null;
  lastTransactionDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EnrichedInventoryItem extends InventoryItem {
  stockStatus: StockLevelStatus;
  avgDailyUsageKg: number;
  daysRemaining: number | null;
}

export interface InventoryTransaction {
  id: string;
  inventoryId: string;
  transactionType: TransactionType;
  quantity: number;
  unitCost: number | null;
  totalCost: number | null;
  transactionDate: string;
  referenceNote: string | null;
  sourceType: TransactionSource;
  sourceId: string | null;
  supplier: string | null;
  invoiceNumber: string | null;
  balanceAfter: number;
  createdAt: string;
}

export interface TransactionWithItem extends InventoryTransaction {
  inventory: {
    itemName: string;
    unit: string;
    category: string;
  };
}

export interface EquipmentMaintenance {
  id: string;
  inventoryId: string;
  scheduledDate: string;
  completedDate: string | null;
  maintenanceType: string;
  description: string | null;
  cost: number | null;
  status: MaintenanceStatus;
  notes: string | null;
  nextScheduledDate: string | null;
  createdAt: string;
}

export interface MaintenanceWithItem extends EquipmentMaintenance {
  inventory: {
    itemName: string;
    category: string;
    pondId?: string;
  };
}

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

export interface CreateInventoryItemDTO {
  pondId: string;
  itemName: string;
  category: InventoryCategory;
  description?: string;
  currentQuantity: number;
  unit: string;
  reorderThreshold: number;
  unitCost?: number;
  supplier?: string;
  location?: string;
}

export interface UpdateInventoryItemDTO extends Partial<Omit<CreateInventoryItemDTO, 'pondId'>> {}

export interface RecordPurchaseDTO {
  inventoryId: string;
  pondId: string;
  quantity: number;
  unitCost?: number;
  totalCost?: number;
  purchaseDate: string;
  supplier?: string;
  invoiceNumber?: string;
  notes?: string;
  createExpenseRecord?: boolean;
}

export interface RecordUsageDTO {
  inventoryId: string;
  pondId: string;
  quantity: number;
  usageDate: string;
  sourceType?: TransactionSource;
  sourceId?: string;
  notes?: string;
}

export interface AdjustStockDTO {
  inventoryId: string;
  pondId: string;
  newQuantity: number;
  reason: string;
}

export interface CreateMaintenanceDTO {
  inventoryId: string;
  scheduledDate: string;
  maintenanceType: string;
  description?: string;
  cost?: number;
  notes?: string;
  nextScheduledDate?: string;
}

export interface CompleteMaintenanceDTO {
  completedDate: string;
  cost?: number;
  notes?: string;
  nextScheduledDate?: string;
}
