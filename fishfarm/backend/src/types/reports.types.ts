import {
  FeedingLog,
  WaterQualityLog
} from '@prisma/client';

export interface ScoreGrade {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  label: string;
  color: string;
}

export interface MilestoneAchieved {
  label: string;
  achievedDate: string | null;
  isAchieved: boolean;
}

export interface FarmScorecard {
  generatedAt: string;
  period: string;
  pond: {
    name: string;
    location: string;
    areaSqft: number;
    areaAcres: number;
    maxDepthFt: number;
  };
  fish: {
    fishAgeDays: number;
    species: string | null;
    totalStocked: number;
    estimatedAlive: number;
    totalMortality: number;
    survivalRate: number;
    survivalRateGrade: ScoreGrade;
    avgWeightGrams: number | null;
    benchmarkWeight: number | null;
    growthVariance: number | null;
    estimatedBiomassKg: number | null;
    fcr: number | null;
    fcrGrade: ScoreGrade | null;
  };
  feeding: {
    totalFeedKg: number;
    averageDailyGrams: number;
    feedingDaysCount: number;
    feedingConsistencyPct: number;
  };
  water: {
    totalReadings: number;
    readingsPerWeek: number;
    avgPH: number | null;
    phInRangePct: number | null;
  };
  financials: {
    totalExpenses: number;
    totalRevenue: number;
    netPL: number;
    isProfit: boolean;
    costPerKgProduced: number | null;
    totalFishSoldKg: number;
  };
  tasks: {
    overdueCount: number;
    completionRate: number;
    streak: number;
  };
  scores: {
    fishHealth: ScoreGrade;
    feedingConsistency: ScoreGrade;
    waterQuality: ScoreGrade;
    taskCompletion: ScoreGrade;
    financialHealth: ScoreGrade;
    dataCompleteness: ScoreGrade;
    overall: ScoreGrade;
  };
  milestones: MilestoneAchieved[];
  recommendations: string[];
}

export type ReadinessStatus =
  | 'PASS' | 'CONCERN' | 'NOT_READY' | 'ACTION_NEEDED' | 'MANUAL_CHECK';

export interface ReadinessCheckItem {
  item: string;
  status: ReadinessStatus;
  value: string;
}

export interface HarvestScenario {
  label: string;
  pricePerKg: number;
  harvestKg: number;
  revenue: number;
  profit: number;
  roi: number;
}

export interface HarvestReadinessReport {
  generatedAt: string;
  currentWeight: number | null;
  targetWeight: number;
  readinessPercent: number;
  daysToHarvest: number | null;
  estimatedHarvestDate: string | null;
  gramsPerDay: number;
  estimatedAlive: number;
  estimatedHarvestKg: number;
  scenarios: HarvestScenario[];
  checklist: ReadinessCheckItem[];
  recommendation: string;
  isReadyToHarvest: boolean;
}

export interface GrowthDataPoint {
  fishAgeDays: number;
  fishAgeWeeks: number;
  sampleDate: string;
  averageWeightGrams: number;
  benchmarkWeight: number | null;
  variancePercent: number | null;
  weeklyGrowthRate: number | null;
}

export interface GrowthPrediction {
  day: number;
  predictedWeight: number;
}

export interface GrowthAnalyticsReport {
  generatedAt: string;
  samples: GrowthDataPoint[];
  chartData: {
    actual: Array<{ day: number; weight: number }>;
    benchmark: Array<{ day: number; weight: number }>;
    predicted: Array<{ day: number; weight: number; isPrediction: true }>;
  };
  fcr: number | null;
  fcrTrend: Array<{ date: string; fcr: number }>;
  currentWeight: number | null;
  benchmarkWeight: number | null;
  growthVariance: number | null;
  gramsPerDay: number;
  predictions: GrowthPrediction[];
  totalSamples: number;
}

export interface ResponseBreakdown {
  response: string;
  count: number;
  percentage: number;
}

export interface FeedTypeBreakdown {
  type: string;
  grams: number;
  percentage: number;
}

export interface WeeklyFeedTrend {
  week: string;
  totalGrams: number;
  sessions: number;
  avgGramsPerDay: number;
  responseScore: number | null;
}

export interface FeedingPerformanceData {
  logs: FeedingLog[];
  totalFeedKg: number;
  averageDailyGrams: number;
  feedingDaysCount: number;
  periodDays: number;
  feedingConsistencyPct: number;
  responseBreakdown: ResponseBreakdown[];
  feedTypeBreakdown: FeedTypeBreakdown[];
  weeklyTrend: WeeklyFeedTrend[];
  leftoverFrequencyPct: number;
  averageFinishMinutes: number | null;
  bestDayOfWeek: string | null;
  overUnderFeedingDays: {
    overfeeding: number;
    underfeeding: number;
    onTarget: number;
  };
}

export interface PHStats {
  min: number | null;
  max: number | null;
  avg: number | null;
}

export interface DOStats {
  min: number | null;
  max: number | null;
  avg: number | null;
}

export interface TemperatureStats {
  min: number | null;
  max: number | null;
  avg: number | null;
}

export interface ColorFrequency {
  color: string;
  count: number;
  percentage: number;
}

export interface LimeEffect {
  treatmentDate: string;
  chemicalName: string;
  quantityKg: number;
  phBefore: number | null;
  phAfter: number | null;
  phChange: number | null;
  wasEffective: boolean;
}

export interface WaterQualityReportData {
  logs: WaterQualityLog[];
  periodDays: number;
  totalReadings: number;
  readingsPerWeek: number;
  phStats: PHStats;
  doStats: DOStats;
  tempStats: TemperatureStats;
  phHealthPercent: number | null;
  colorFrequency: ColorFrequency[];
  longestGapDays: number;
  limeApplicationEffects: LimeEffect[];
  weeklyPHTrend: Array<{ week: string; avgPH: number | null }>;
}

export interface FarmTimelineData {
  feedingByDay: Array<{ date: string; totalGrams: number; sessions: number }>;
  mortalityByDay: Array<{ date: string; deadCount: number }>;
  waterReadingsByDay: Array<{
    date: string;
    phValue: number | null;
    waterColor: string;
  }>;
  expensesByDay: Array<{ date: string; total: number }>;
  salesByDay: Array<{
    date: string;
    quantityKg: number;
    revenue: number;
  }>;
  tasksByDay: Array<{ date: string; completedCount: number }>;
}

export interface FullFarmReport {
  generatedAt: string;
  period: { start: string; end: string; label: string };
  pond: FarmScorecard['pond'];
  scorecard: FarmScorecard;
  harvestReadiness: HarvestReadinessReport;
  growthAnalytics: GrowthAnalyticsReport;
  feedingAnalytics: FeedingPerformanceData;
  waterQuality: WaterQualityReportData;
  timeline: FarmTimelineData;
  exportedBy: string;
}

export interface ExportDataResult {
  module: string;
  filename: string;
  headers: string[];
  rows: string[][];
  rowCount: number;
  generatedAt: string;
}

export interface HarvestReadinessData {
  latestStocking: any | null;
  growthSamples: any[];
  totalMortality: number;
  latestMarketPrices: any[];
  totalExpenses: number;
  totalFeedKg: number;
}

export interface MortalityCausesData {
  logs: any[];
  byReason: Array<{ reason: string; count: number }>;
  highestMortalityDay: { date: Date; count: number } | null;
  weeklyAverages: Array<{ week: string; average: number }>;
  survivalRate: number | null;
}

export interface FinancialReportData {
  expenses: any[];
  sales: any[];
  byCategory: Array<{ category: string; amount: number }>;
  monthlyExpenseTrend: Array<{ month: string; amount: number }>;
  monthlyRevenueTrend: Array<{ month: string; amount: number }>;
  buyerList: Array<{ buyerName: string; amount: number }>;
}

export interface TaskCompletionReportData {
  tasks: any[];
  byStatus: Array<{ status: string; count: number }>;
  byCategory: Array<{ category: string; count: number }>;
  averageCompletionTimeMinutes: number | null;
  onTimeVsLate: { onTime: number; late: number };
  mostCompletedCategories: Array<{ category: string; count: number }>;
}

export interface InventoryUsageReportData {
  transactions: any[];
  byCategory: Array<{ category: string; usedAmount: number }>;
  mostUsedItems: Array<{ item: string; usedAmount: number }>;
}
