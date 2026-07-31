import type { Pond, InfrastructureChecklist, FishStocking } from '@prisma/client';

export interface InfrastructureStats {
  total: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  completionPercent: number;
}

export interface PondWithCounts extends Pond {
  fishStockings: Pick<FishStocking, 'id' | 'species' | 'quantity' | 'stockingDate'>[];
  _count: {
    fishStockings: number;
    mortalityLogs: number;
    feedingLogs: number;
    tasks: number;
  };
}

export interface PondWithFullDetails extends Pond {
  fishStockings: FishStocking[];
  infrastructureItems: InfrastructureChecklist[];
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
