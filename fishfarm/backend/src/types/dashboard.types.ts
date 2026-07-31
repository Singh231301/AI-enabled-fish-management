export interface WeatherCurrent {
  temperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  weatherDescription: string;
  weatherEmoji: string;
  precipitation: number;
  cloudCover: number;
  feelsLike: string;
}

export interface WeatherForecastDay {
  date: string;
  maxTemp: number;
  minTemp: number;
  precipitationSum: number;
  weatherCode: number;
  weatherDescription: string;
  weatherEmoji: string;
}

export interface WeatherData {
  current: WeatherCurrent;
  forecast: WeatherForecastDay[];
  pondImpact: string;
}

export interface PondBasicStats {
  totalStocked: number;
  totalMortality: number;
  todayMortality: number;
  estimatedAlive: number;
  survivalRate: number;
  fishAgeDays: number;
  latestAvgWeightGrams: number | null;
  estimatedBiomassKg: number;
  totalInvested: number;
  totalRevenue: number;
  netProfitLoss: number;
  currentMonthExpense: number;
  stockingDate: Date | null;
  species: string | null;
}

export interface TodayFeedingStatus {
  fedToday: boolean;
  feedingCount: number;
  totalFedGrams: number;
  lastFeedTime: string | null;
  lastFeedResponse: string | null;
}

export interface LatestWaterQuality {
  logDate: Date;
  phValue: number | null;
  waterColor: string;
  waterSmell: string;
  temperatureCelsius: number | null;
  dissolvedOxygenPpm: number | null;
  phStatus: 'normal' | 'low' | 'high' | 'critical' | 'unknown';
  daysSinceLastReading: number;
}

export interface TaskCountSummary {
  overdueCount: number;
  dueTodayCount: number;
  totalPendingCount: number;
}

export interface DailyMortality {
  date: string;
  deadCount: number;
}

export interface DailyFeeding {
  date: string;
  totalGrams: number;
}

export interface LowStockItem {
  id: string;
  itemName: string;
  currentQuantity: number;
  unit: string;
  reorderThreshold: number;
  category: string;
}

export interface ActivityItem {
  id: string;
  type: 'feeding' | 'mortality' | 'water' | 'expense';
  date: Date;
  displayText: string;
  icon: string;
}

export interface ExpenseBreakdown {
  category: string;
  total: number;
  label: string;
}

export interface DashboardData {
  pond: {
    id: string;
    name: string;
    location: string;
    areaSqft: number;
    areaAcres: number;
  };
  basicStats: PondBasicStats;
  todayFeeding: TodayFeedingStatus;
  latestWater: LatestWaterQuality | null;
  taskCounts: TaskCountSummary;
  mortalityTrend: DailyMortality[];
  feedingTrend: DailyFeeding[];
  lowStock: LowStockItem[];
  recentActivity: ActivityItem[];
  monthlyExpenses: ExpenseBreakdown[];
  unreadNotifications: number;
  weather: WeatherData | null;
  computed: {
    recommendedFeedGrams: number;
    expectedWeightGrams: number | null;
    weightVsBenchmarkPercent: number | null;
  };
  generatedAt: string;
}
