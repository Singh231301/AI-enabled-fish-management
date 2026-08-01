import { FeedingLogRepository } from '../repositories/feeding-log.repository';
import { FeedingScheduleRepository } from '../repositories/feeding-schedule.repository';
import { FishStockingRepository } from '../repositories/fish-stocking.repository';
import { FishGrowthSampleRepository } from '../repositories/fish-growth-sample.repository';
import { MortalityLogRepository } from '../repositories/mortality-log.repository';
import { PondRepository } from '../repositories/pond.repository';
import { ActivityLogRepository } from '../repositories/activity-log.repository';
import { AppError } from '../utils/app-error';
import { differenceInDays, subDays, addDays } from 'date-fns';
import {
  CreateFeedingLogDTO,
  UpdateFeedingLogDTO,
  CreateFeedingScheduleDTO,
  UpdateFeedingScheduleDTO,
  FeedingListQuery,
  updateFeedingScheduleSchema
} from '../validators/feeding.validator';
import { 
  FeedType, 
  FishResponseType, 
  FeedRecommendation,
  FeedingStats,
  TodayFeedingStatus,
  FeedingOverview
} from '../types/feeding.types';

const FEED_RATE_BY_AGE: Array<{ maxAgeDays: number; ratePercent: number; label: string }> = [
  { maxAgeDays: 7,   ratePercent: 7.0, label: "New fingerlings" },
  { maxAgeDays: 14,  ratePercent: 6.0, label: "Early growth" },
  { maxAgeDays: 21,  ratePercent: 5.5, label: "Early growth" },
  { maxAgeDays: 30,  ratePercent: 5.0, label: "Growing" },
  { maxAgeDays: 45,  ratePercent: 4.5, label: "Growing" },
  { maxAgeDays: 60,  ratePercent: 4.0, label: "Active growth" },
  { maxAgeDays: 90,  ratePercent: 3.5, label: "Mid-growth" },
  { maxAgeDays: 120, ratePercent: 3.0, label: "Mid-growth" },
  { maxAgeDays: 180, ratePercent: 2.5, label: "Late growth" },
  { maxAgeDays: 999, ratePercent: 2.0, label: "Pre-harvest" },
];

const MIN_FEED_GRAMS = 400;
const MAX_FEED_GRAMS = 10000;

export class FeedingService {
  constructor(
    private feedingLogRepo: FeedingLogRepository,
    private scheduleRepo: FeedingScheduleRepository,
    private stockingRepo: FishStockingRepository,
    private growthRepo: FishGrowthSampleRepository,
    private mortalityRepo: MortalityLogRepository,
    private pondRepo: PondRepository,
    private activityRepo: ActivityLogRepository,
    private notificationService: any
  ) {}

  private calculateRecommendedFeed(
    fishAgeDays: number,
    estimatedAlive: number,
    avgWeightGrams: number
  ): FeedRecommendation {
    const rateObj = FEED_RATE_BY_AGE.find(r => fishAgeDays <= r.maxAgeDays) || FEED_RATE_BY_AGE[FEED_RATE_BY_AGE.length - 1];
    const rate = rateObj.ratePercent;
    const label = rateObj.label;

    const estimatedBiomassKg = (estimatedAlive * avgWeightGrams) / 1000;
    let dailyFeedGrams = (estimatedBiomassKg * 1000) * (rate / 100);

    dailyFeedGrams = Math.max(MIN_FEED_GRAMS, Math.min(MAX_FEED_GRAMS, dailyFeedGrams));
    const perSession = Math.round(dailyFeedGrams / 2);

    return {
      totalDailyGrams: Math.round(dailyFeedGrams),
      perSessionGrams: perSession,
      feedRatePercent: rate,
      ageLabel: label,
      rationale: `At ${fishAgeDays} days (${label}), feed at ${rate}% of body weight. Biomass: ${estimatedBiomassKg.toFixed(2)}kg × ${rate}% = ${Math.round(dailyFeedGrams)}g/day`,
      minGrams: Math.round(dailyFeedGrams * 0.8),
      maxGrams: Math.round(dailyFeedGrams * 1.2),
    };
  }

  async createFeedingLog(dto: CreateFeedingLogDTO, userId: string) {
    const pond = await this.pondRepo.findByIdAndUserId(dto.pondId, userId);
    if (!pond) throw new AppError("Pond not found", 404);

    const latestStocking = await this.stockingRepo.findLatestByPondId(dto.pondId);
    if (!latestStocking) {
      throw new AppError("No fish stocked in this pond. Stock fish before logging feeds.", 400);
    }

    const { pondId: _pondId, ...dtoWithoutPondId } = dto;
    const log = await this.feedingLogRepo.create({
      ...dtoWithoutPondId,
      feedDate: new Date(dto.feedDate),
      feedType: dto.feedType as any,
      fishResponse: dto.fishResponse as any,
      user: { connect: { id: userId } },
      pond: { connect: { id: dto.pondId } }
    });

    if (dto.leftoverObserved && this.notificationService) {
      const recentLogs = await this.feedingLogRepo.findByPondIdAndDateRange(
        dto.pondId,
        subDays(new Date(), 3),
        new Date()
      );
      const leftoverCount = recentLogs.filter(l => l.leftoverObserved).length;
      
      if (leftoverCount >= 3) {
        await this.notificationService.checkAndCreate({
          userId,
          pondId: dto.pondId,
          title: "Overfeeding Warning",
          message: "Leftover feed observed 3+ days in a row. Reduce feed quantity by 10-15% to avoid water quality issues.",
          type: 'AI_ALERT',
          priority: 'MEDIUM',
          actionUrl: '/feeding'
        });
      }
    }

    if ((dto.fishResponse === 'POOR' || dto.fishResponse === 'REFUSED') && this.notificationService) {
      const recentLogs = await this.feedingLogRepo.findByPondIdAndDateRange(
        dto.pondId,
        subDays(new Date(), 3),
        new Date()
      );
      const poorCount = recentLogs.filter(l =>
        l.fishResponse === 'POOR' || l.fishResponse === 'REFUSED'
      ).length;
      
      if (poorCount >= 2) {
        await this.notificationService.checkAndCreate({
          userId,
          pondId: dto.pondId,
          title: "Poor Feeding Response",
          message: "Fish have shown poor feeding response 2+ times recently. Check water quality and dissolved oxygen levels.",
          type: 'AI_ALERT',
          priority: 'HIGH',
          actionUrl: '/water'
        });
      }
    }

    await this.activityRepo.create({
      userId,
      action: 'FEEDING_LOGGED',
      module: 'feeding',
      recordId: log.id,
      details: {
        quantityGrams: dto.quantityGrams,
        fishResponse: dto.fishResponse,
        feedDate: dto.feedDate
      }
    } as any);

    return log;
  }

  async getFeedingLogs(pondId: string, userId: string, query: FeedingListQuery) {
    const pond = await this.pondRepo.findByIdAndUserId(pondId, userId);
    if (!pond) throw new AppError("Pond not found", 404);

    const skip = (query.page - 1) * query.limit;
    const filters = {
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
      feedType: query.feedType,
      fishResponse: query.fishResponse,
      skip,
      take: query.limit
    };

    const { records, total } = await this.feedingLogRepo.findByPondId(pondId, filters);
    
    return {
      records,
      total,
      pagination: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit)
      }
    };
  }

  async getFeedingLogById(id: string, pondId: string, userId: string) {
    const pond = await this.pondRepo.findByIdAndUserId(pondId, userId);
    if (!pond) throw new AppError("Pond not found", 404);
    
    const log = await this.feedingLogRepo.findById(id);
    if (!log || (log as any).pondId !== pondId) throw new AppError("Feeding log not found", 404);
    
    return log;
  }

  async updateFeedingLog(id: string, pondId: string, userId: string, dto: UpdateFeedingLogDTO) {
    const pond = await this.pondRepo.findByIdAndUserId(pondId, userId);
    if (!pond) throw new AppError("Pond not found", 404);
    
    const existing = await this.feedingLogRepo.findById(id);
    if (!existing || (existing as any).pondId !== pondId) throw new AppError("Feeding log not found", 404);
    
    const data: any = { ...dto };
    if (dto.feedDate) data.feedDate = new Date(dto.feedDate);

    return this.feedingLogRepo.update(id, data);
  }

  async deleteFeedingLog(id: string, pondId: string, userId: string) {
    const pond = await this.pondRepo.findByIdAndUserId(pondId, userId);
    if (!pond) throw new AppError("Pond not found", 404);
    
    const existing = await this.feedingLogRepo.findById(id);
    if (!existing || (existing as any).pondId !== pondId) throw new AppError("Feeding log not found", 404);

    await this.feedingLogRepo.delete(id);
    
    await this.activityRepo.create({
      userId,
      action: 'FEEDING_DELETED',
      module: 'feeding',
      recordId: id,
      details: { id }
    } as any);
  }

  async upsertSchedule(dto: CreateFeedingScheduleDTO, userId: string) {
    const pond = await this.pondRepo.findByIdAndUserId(dto.pondId, userId);
    if (!pond) throw new AppError("Pond not found", 404);

    const schedule = await this.scheduleRepo.upsert(dto.pondId, userId, dto as any);

    await this.activityRepo.create({
      userId,
      action: 'FEEDING_SCHEDULE_UPDATED',
      module: 'feeding',
      recordId: schedule.id,
      details: { morningTime: dto.morningTime, eveningTime: dto.eveningTime }
    } as any);

    if (dto.reminderEnabled && this.notificationService) {
      await this.notificationService.checkAndCreate({
        userId,
        pondId: dto.pondId,
        title: "⏰ Feeding Reminders Set",
        message: `Feeding reminders set for ${dto.morningTime ?? 'N/A'} and ${dto.eveningTime ?? 'N/A'}`,
        type: 'INFO',
        priority: 'LOW',
        actionUrl: '/feeding'
      });
    }

    return schedule;
  }

  async getScheduleByPond(pondId: string, userId: string) {
    const pond = await this.pondRepo.findByIdAndUserId(pondId, userId);
    if (!pond) throw new AppError("Pond not found", 404);
    return this.scheduleRepo.findByPondId(pondId);
  }

  private getFCRInterpretation(fcr: number | null): string {
    if (fcr === null) return "Not enough data — keep logging feeds";
    if (fcr < 1.2) return "Exceptional — very efficient feed use";
    if (fcr < 1.5) return "Excellent — above industry standard";
    if (fcr < 1.8) return "Good — within normal Pangasius range (1.5-1.8)";
    if (fcr < 2.2) return "Average — review feeding practices";
    if (fcr < 2.5) return "Below average — reduce waste, check feed quality";
    return "Poor — significant feed waste. Review immediately";
  }

  async getFeedingStats(pondId: string, userId: string, query: { period?: string }): Promise<any> {
    const pond = await this.pondRepo.findByIdAndUserId(pondId, userId);
    if (!pond) throw new AppError("Pond not found", 404);

    const latestStocking = await this.stockingRepo.findLatestByPondId(pondId);

    let periodDays = 30;
    if (query.period === '7d') periodDays = 7;
    else if (query.period === '90d') periodDays = 90;
    else if (query.period === 'all') periodDays = 3650; // effectively all

    const endDate = new Date();
    const startDate = subDays(endDate, periodDays);

    const [
      totalFeedKg,
      dailyTotalsRaw,
      weeklyTotals,
      responseBreakdown,
      feedTypeBreakdown,
      averageDailyGrams,
      streakData,
      leftoverFrequencyPercent,
      todayLogs,
      allLogs
    ] = await Promise.all([
      this.feedingLogRepo.getTotalFeedKgByPondId(pondId),
      this.feedingLogRepo.getDailyFeedTotals(pondId, startDate, endDate),
      this.feedingLogRepo.getWeeklyFeedTotals(pondId),
      this.feedingLogRepo.getFeedResponseBreakdown(pondId, startDate),
      this.feedingLogRepo.getFeedTypeBreakdown(pondId),
      this.feedingLogRepo.getAverageDailyFeed(pondId, periodDays),
      this.feedingLogRepo.getStreakData(pondId),
      this.feedingLogRepo.getLeftoverFrequency(pondId, periodDays),
      this.feedingLogRepo.findTodayByPondId(pondId),
      this.feedingLogRepo.findAllByPondId(pondId)
    ]);

    const [latestGrowth, totalMortality] = await Promise.all([
      this.growthRepo.findLatestByPondId(pondId),
      this.mortalityRepo.getTotalMortality(pondId)
    ]);

    const totalStocked = latestStocking?.quantity ?? 0;
    const estimatedAlive = totalStocked - totalMortality;
    const avgWeight = latestGrowth?.averageWeightGrams ?? 5;
    const currentBiomassKg = (estimatedAlive * avgWeight) / 1000;
    const initialBiomassKg = (totalStocked * 5) / 1000;
    const weightGainKg = currentBiomassKg - initialBiomassKg;
    const fcr = weightGainKg > 0 && totalFeedKg > 0 ? totalFeedKg / weightGainKg : null;

    // Fill daily totals with zeros if missing
    const filledDailyTotals = [];
    for (let i = periodDays; i >= 0; i--) {
      const date = subDays(endDate, i);
      const dateStr = date.toISOString().split('T')[0];
      const existing = dailyTotalsRaw.find(d => d.date === dateStr);
      if (existing) {
        filledDailyTotals.push(existing);
      } else {
        filledDailyTotals.push({
          date: dateStr,
          displayDate: date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }),
          totalGrams: 0,
          sessions: 0,
          responses: [],
          hasLeftover: false
        });
      }
    }

    const fishAgeDays = latestStocking ? Math.max(0, differenceInDays(new Date(), latestStocking.stockingDate)) : 0;
    const recommendation = latestStocking ? this.calculateRecommendedFeed(fishAgeDays, estimatedAlive, avgWeight) : null;

    const fedToday = todayLogs.length > 0;
    const todayGrams = todayLogs.reduce((s, l) => s + l.quantityGrams, 0);
    const todaySessions = todayLogs.length;
    const lastFeedTime = todayLogs[todayLogs.length - 1]?.feedTime ?? null;
    const lastFeedResponse = todayLogs[todayLogs.length - 1]?.fishResponse ?? null;

    return {
      totalFeedKg,
      averageDailyGrams: Math.round(averageDailyGrams),
      todayStatus: {
        fedToday,
        feedingCount: todaySessions,
        totalFedGrams: todayGrams,
        lastFeedTime,
        lastFeedResponse,
        logs: todayLogs
      },
      recommendation,
      fcr,
      fcrInterpretation: this.getFCRInterpretation(fcr),
      dailyTrend: filledDailyTotals,
      weeklyTrend: weeklyTotals,
      responseBreakdown,
      feedTypeBreakdown,
      streakData,
      leftoverFrequencyPercent,
      periodDays,
      totalSessions: allLogs.length,
      weightGainKg,
      currentBiomassKg,
    };
  }

  async getTodayFeedingStatus(pondId: string, userId: string) {
    const pond = await this.pondRepo.findByIdAndUserId(pondId, userId);
    if (!pond) throw new AppError("Pond not found", 404);

    const logs = await this.feedingLogRepo.findTodayByPondId(pondId);
    return {
      fedToday: logs.length > 0,
      feedingCount: logs.length,
      totalFedGrams: logs.reduce((s, l) => s + l.quantityGrams, 0),
      lastFeedTime: logs[logs.length - 1]?.feedTime ?? null,
      lastFeedResponse: logs[logs.length - 1]?.fishResponse ?? null,
      logs
    };
  }

  async getFeedingOverview(pondId: string, userId: string): Promise<any> {
    const [stats, logs, schedule, todayStatus] = await Promise.all([
      this.getFeedingStats(pondId, userId, { pondId, period: '30d' } as any),
      this.getFeedingLogs(pondId, userId, { pondId, page: 1, limit: 20 } as any),
      this.getScheduleByPond(pondId, userId),
      this.getTodayFeedingStatus(pondId, userId)
    ]);

    return {
      stats,
      recentLogs: logs.records,
      recentLogsPagination: logs.pagination,
      schedule,
      todayStatus
    };
  }
}
