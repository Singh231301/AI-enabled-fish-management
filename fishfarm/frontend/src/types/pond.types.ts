export type InfrastructureStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

export interface Pond {
  id: string;
  userId: string;
  name: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  lengthFt: number;
  widthFt: number;
  areaSqft: number;
  areaAcres: number;
  maxDepthFt: number;
  soilType: string;
  waterSource: string;
  pondType: string;
  constructionDate: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PondWithCounts extends Pond {
  fishStockings: Array<{
    id: string;
    species: string;
    quantity: number;
    stockingDate: string;
  }>;
  _count: {
    fishStockings: number;
    mortalityLogs: number;
    feedingLogs: number;
    tasks: number;
  };
}

export interface PondWithFullDetails extends Pond {
  fishStockings: FishStocking[];
  infrastructureItems: InfrastructureItem[];
  infrastructureStats?: InfrastructureStats;
  _count: {
    mortalityLogs: number;
    feedingLogs: number;
    waterQualityLogs: number;
    expenses: number;
    sales: number;
    tasks: number;
    infrastructureItems: number;
  };
}

export interface InfrastructureItem {
  id: string;
  pondId: string;
  userId: string;
  itemName: string;
  description: string | null;
  status: InfrastructureStatus;
  completedDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InfrastructureStats {
  total: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  completionPercent: number;
}

export interface CreatePondForm {
  name: string;
  location: string;
  lengthFt: number;
  widthFt: number;
  maxDepthFt: number;
  soilType: string;
  waterSource: string;
  pondType: string;
  constructionDate?: string;
  notes?: string;
  latitude?: number;
  longitude?: number;
}

export interface FishStocking {
  id: string;
  pondId: string;
  species: string;
  localName: string | null;
  quantity: number;
  fingerlingSize_cm: number;
  sourceSupplier: string | null;
  costPerFingerling: number | null;
  totalCost: number | null;
  batchNumber: number;
  stockingDate: string;
  notes: string | null;
}

export interface UpdateInfrastructureItemForm {
  itemName?: string;
  description?: string;
  status?: InfrastructureStatus;
  completedDate?: string;
  notes?: string;
}
