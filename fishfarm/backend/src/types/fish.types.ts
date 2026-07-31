import { FishStocking, MortalityLog, FishGrowthSample } from '@prisma/client';

export type MortalityReason =
  | 'OXYGEN_DEFICIENCY'
  | 'DISEASE_INFECTION'
  | 'WATER_QUALITY'
  | 'PREDATION'
  | 'INJURY'
  | 'UNKNOWN'
  | 'OTHER';

export interface DailyMortalityData {
  date: string;
  fullDate: string;
  deadCount: number;
}

export interface MonthlyMortalityData {
  month: string;
  deadCount: number;
}

export interface ReasonBreakdown {
  reason: MortalityReason | null;
  label: string;
  count: number;
  totalDead: number;
  percentage: number;
}

export interface MortalitySummary {
  totalMortality: number;
  todayMortality: number;
  totalStocked: number;
  estimatedAlive: number;
  survivalRate: number;
  dailyTrend: DailyMortalityData[];
  monthlyTrend: MonthlyMortalityData[];
  byReason: ReasonBreakdown[];
  highestMortalityDay: { date: string; count: number } | null;
  averageDailyMortality: number;
}

export interface EnrichedGrowthSample {
  id: string;
  sampleDate: string;
  fishSampledCount: number;
  averageWeightGrams: number;
  minWeightGrams: number | null;
  maxWeightGrams: number | null;
  notes: string | null;
  fishAgeDays: number;
  fishAgeWeeks: number;
  benchmarkWeight: number | null;
  variancePercent: number | null;
  createdAt: string;
}

export interface GrowthChartPoint {
  day: number;
  actualWeight?: number;
  benchmarkWeight?: number;
}

export interface GrowthSummary {
  samples: EnrichedGrowthSample[];
  latestSample: EnrichedGrowthSample | null;
  chartData: {
    actual: GrowthChartPoint[];
    benchmark: GrowthChartPoint[];
    combined: GrowthChartPoint[];
  };
  fcr: number | null;
  estimatedHarvestDate: string | null;
  gramsPerDay: number | null;
  totalSamples: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FishOverview {
  stockings: FishStocking[];
  mortalitySummary: MortalitySummary;
  growthSummary: GrowthSummary;
}
