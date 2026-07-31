import { FeedingLog, FeedingSchedule } from '@prisma/client';

export type FeedType =
  | 'FLOATING_PELLET'
  | 'SINKING_PELLET'
  | 'MIXED'
  | 'POWDER'
  | 'NATURAL'
  | 'OTHER';

export type FishResponseType =
  | 'EXCELLENT'
  | 'GOOD'
  | 'FAIR'
  | 'POOR'
  | 'REFUSED';

export interface DailyFeedTotal {
  date: string;
  displayDate: string;
  totalGrams: number;
  sessions: number;
  responses: FishResponseType[];
  hasLeftover: boolean;
}

export interface WeeklyFeedTotal {
  week: string;
  totalGrams: number;
  avgGramsPerDay: number;
  daysWithFeeding: number;
}

export interface ResponseBreakdown {
  response: FishResponseType;
  label: string;
  count: number;
  totalGrams: number;
  percentage: number;
}

export interface FeedTypeBreakdown {
  feedType: FeedType;
  label: string;
  count: number;
  totalGrams: number;
  percentage: number;
}

export interface FeedingStreakData {
  currentStreak: number;
  longestStreak: number;
  lastFedDate: string | null;
}

export interface FeedRecommendation {
  totalDailyGrams: number;
  perSessionGrams: number;
  feedRatePercent: number;
  ageLabel: string;
  rationale: string;
  minGrams: number;
  maxGrams: number;
}

export interface TodayFeedingStatus {
  fedToday: boolean;
  feedingCount: number;
  totalFedGrams: number;
  lastFeedTime: string | null;
  lastFeedResponse: FishResponseType | null;
  logs: FeedingLog[];
}

export interface FeedingStats {
  totalFeedKg: number;
  averageDailyGrams: number;
  todayStatus: TodayFeedingStatus;
  recommendation: FeedRecommendation | null;
  fcr: number | null;
  fcrInterpretation: string;
  dailyTrend: DailyFeedTotal[];
  weeklyTrend: WeeklyFeedTotal[];
  responseBreakdown: ResponseBreakdown[];
  feedTypeBreakdown: FeedTypeBreakdown[];
  streakData: FeedingStreakData;
  leftoverFrequencyPercent: number;
  periodDays: number;
  totalSessions: number;
  weightGainKg: number;
  currentBiomassKg: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FeedingOverview {
  stats: FeedingStats;
  recentLogs: FeedingLog[];
  recentLogsPagination: PaginationMeta;
  schedule: FeedingSchedule | null;
  todayStatus: TodayFeedingStatus;
}
