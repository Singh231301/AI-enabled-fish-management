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
  isPrediction?: boolean;
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
  logs: any[];
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
  logs: any[];
  periodDays: number;
  totalReadings: number;
  readingsPerWeek: number;
  phStats: PHStats;
  doStats: PHStats;
  tempStats: PHStats;
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

export type ReportPeriod = 'last_7_days' | 'last_30_days' | 'last_90_days' | 'last_6_months' | 'last_year' | 'current_month' | 'current_year' | 'all_time' | 'custom';
