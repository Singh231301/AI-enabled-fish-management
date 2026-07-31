export type MortalityReason =
  | 'OXYGEN_DEFICIENCY'
  | 'DISEASE_INFECTION'
  | 'WATER_QUALITY'
  | 'PREDATION'
  | 'INJURY'
  | 'UNKNOWN'
  | 'OTHER';

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
  createdAt: string;
  updatedAt: string;
}

export interface MortalityLog {
  id: string;
  pondId: string;
  logDate: string;
  deadCount: number;
  probableReason: MortalityReason | null;
  actionTaken: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FishGrowthSample {
  id: string;
  pondId: string;
  sampleDate: string;
  fishSampledCount: number;
  averageWeightGrams: number;
  minWeightGrams: number | null;
  maxWeightGrams: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EnrichedGrowthSample extends FishGrowthSample {
  fishAgeDays: number;
  fishAgeWeeks: number;
  benchmarkWeight: number | null;
  variancePercent: number | null;
}

export interface GrowthChartPoint {
  day: number;
  actualWeight?: number;
  benchmarkWeight?: number;
}

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

export interface FishOverview {
  stockings: FishStocking[];
  mortalitySummary: MortalitySummary;
  growthSummary: GrowthSummary;
}

export interface CreateStockingForm {
  pondId: string;
  stockingDate: string;
  species: string;
  localName?: string;
  quantity: number;
  fingerlingSize_cm: number;
  sourceSupplier?: string;
  costPerFingerling?: number;
  totalCost?: number;
  notes?: string;
}

export interface CreateMortalityForm {
  pondId: string;
  logDate: string;
  deadCount: number;
  probableReason?: MortalityReason;
  actionTaken?: string;
  notes?: string;
}

export interface CreateGrowthSampleForm {
  pondId: string;
  sampleDate: string;
  fishSampledCount: number;
  averageWeightGrams: number;
  minWeightGrams?: number;
  maxWeightGrams?: number;
  notes?: string;
}
