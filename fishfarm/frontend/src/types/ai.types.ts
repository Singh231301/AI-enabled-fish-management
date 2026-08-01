export interface FarmContext {
  generatedAt: string;
  pond: {
    name: string;
    location: string;
    areaSqft: number;
    areaAcres: number;
    maxDepthFt: number;
    soilType: string;
    waterSource: string;
    pondType: string;
  };
  fish: {
    species: string;
    localName: string | null;
    totalStocked: number;
    estimatedAlive: number;
    totalMortality: number;
    survivalRate: number;
    fishAgeDays: number;
    fishAgeWeeks: number;
    stockingDate: string;
    fingerlingSize_cm: number;
    batchNumber: number;
  } | null;
  growth: {
    avgWeightGrams: number;
    sampleDate: string;
    fishSampledCount: number;
    estimatedBiomassKg: number | null;
    daysSinceLastSample: number;
  } | null;
  feeding: {
    fedToday: boolean;
    todayFedGrams: number;
    todaySessionCount: number;
    lastFeedResponse: string | null;
  };
  water: {
    logDate: string;
    phValue: number | null;
    phStatus: string;
    waterColor: string;
    waterSmell: string;
    temperatureCelsius: number | null;
    dissolvedOxygenPpm: number | null;
    daysSinceLastReading: number;
  } | null;
  financials: {
    totalInvested: number;
  };
  inventory: {
    lowStockCount: number;
    lowStockItems: Array<{
      name: string;
      quantity: number;
      unit: string;
      threshold: number;
    }>;
  };
  tasks: {
    overdueCount: number;
    dueTodayCount: number;
    pendingCount: number;
  } | null;
  season: {
    name: string;
    month: number;
    advice: string;
  };
  weather: {
    temperature: number;
    description: string;
    humidity: number;
    pondImpact: string;
  } | null;
}

export interface SessionSummary {
  sessionId: string;
  firstMessage: string;
  messageCount: number;
  startedAt: string;
  pondId: string | null;
}

export interface AIInsight {
  module: string;
  type: 'danger' | 'warning' | 'info' | 'success';
  title: string;
  detail?: string;
  action: string;
  urgency: 'critical' | 'high' | 'medium' | 'low';
}

export interface SuggestedQuestion {
  text: string;
  category: string;
  urgent?: boolean;
}

export interface FarmHealthScoreComponent {
  score: number;
  maxScore: number;
  label: string;
}

export interface FarmHealthScore {
  totalScore: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  label: string;
  components: {
    fishHealth: FarmHealthScoreComponent;
    feedingConsistency: FarmHealthScoreComponent;
    waterQuality: FarmHealthScoreComponent;
    taskCompletion: FarmHealthScoreComponent;
    financialHealth: FarmHealthScoreComponent;
  };
  topStrengths: string[];
  topWeaknesses: string[];
  improvementTip: string;
}

export interface ChatMessage {
  id: string;
  role: 'USER' | 'ASSISTANT';
  message: string;
  createdAt: string;
  sessionId: string;
}

export interface AiBriefing {
  id: string;
  pondId: string;
  briefingType: 'DAILY' | 'WEEKLY' | 'ALERT';
  content: string;
  contextSnapshot: any;
  briefingDate: string;
  createdAt: string;
}
