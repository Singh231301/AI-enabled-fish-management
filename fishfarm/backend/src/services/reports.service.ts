import {
  FarmScorecard,
  HarvestReadinessReport,
  GrowthAnalyticsReport,
  FeedingPerformanceData,
  WaterQualityReportData,
  FullFarmReport,
  ExportDataResult,
  MilestoneAchieved,
  GrowthPrediction
} from '../types/reports.types';
import { ReportQuery, ExportQuery } from '../validators/reports.validator';
import { ReportsRepository } from '../repositories/reports.repository';
import { PondRepository } from '../repositories/pond.repository';
import { FishStockingRepository } from '../repositories/fish-stocking.repository';
import { MortalityLogRepository } from '../repositories/mortality-log.repository';
import { FishGrowthSampleRepository } from '../repositories/fish-growth-sample.repository';
import { FeedingLogRepository } from '../repositories/feeding-log.repository';
import { WaterQualityLogRepository } from '../repositories/water-quality-log.repository';
import { ExpenseRepository } from '../repositories/expense.repository';
import { SaleRepository } from '../repositories/sale.repository';
import { TaskRepository } from '../repositories/task.repository';
import { InventoryRepository } from '../repositories/inventory.repository';
import { ActivityLogRepository } from '../repositories/activity-log.repository';
import { AppError } from '../utils/app-error';
import { subDays, subMonths, subYears, startOfMonth, endOfMonth, startOfYear, endOfYear, differenceInDays, addDays } from 'date-fns';
import { format as formatDate } from 'date-fns';

export class ReportsService {
  constructor(
    private reportsRepo: ReportsRepository,
    private pondRepo: PondRepository,
    private stockingRepo: FishStockingRepository,
    private mortalityRepo: MortalityLogRepository,
    private growthRepo: FishGrowthSampleRepository,
    private feedingRepo: FeedingLogRepository,
    private waterRepo: WaterQualityLogRepository,
    private expenseRepo: ExpenseRepository,
    private saleRepo: SaleRepository,
    private taskRepo: TaskRepository,
    private inventoryRepo: InventoryRepository,
    private activityRepo: ActivityLogRepository
  ) {}

  private resolveDateRange(period: string, startDate?: string, endDate?: string) {
    const now = new Date();
    switch (period) {
      case 'last_7_days': return { start: subDays(now, 7), end: now, label: 'Last 7 Days' };
      case 'last_30_days': return { start: subDays(now, 30), end: now, label: 'Last 30 Days' };
      case 'last_90_days': return { start: subDays(now, 90), end: now, label: 'Last 90 Days' };
      case 'last_6_months': return { start: subMonths(now, 6), end: now, label: 'Last 6 Months' };
      case 'last_year': return { start: subYears(now, 1), end: now, label: 'Last Year' };
      case 'current_month': return { start: startOfMonth(now), end: endOfMonth(now), label: 'Current Month' };
      case 'current_year': return { start: startOfYear(now), end: endOfYear(now), label: 'Current Year' };
      case 'all_time': return { start: new Date('2020-01-01'), end: now, label: 'All Time' };
      case 'custom':
        if (!startDate || !endDate) throw new AppError('Missing dates for custom period', 400);
        return { start: new Date(startDate), end: new Date(endDate), label: `${formatDate(new Date(startDate), 'MMM d, yyyy')} – ${formatDate(new Date(endDate), 'MMM d, yyyy')}` };
      default:
        return { start: subDays(now, 30), end: now, label: 'Last 30 Days' };
    }
  }

  private getBenchmarkWeight(ageDays: number): number {
    const months = ageDays / 30;
    if (months <= 1) return 10 + (months * 40);
    if (months <= 2) return 50 + ((months - 1) * 100);
    if (months <= 3) return 150 + ((months - 2) * 150);
    if (months <= 4) return 300 + ((months - 3) * 200);
    if (months <= 5) return 500 + ((months - 4) * 250);
    return 750 + ((months - 5) * 300);
  }

  private getGrade(score: number): { score: number, grade: 'A' | 'B' | 'C' | 'D' | 'F', label: string, color: string } {
    if (score >= 90) return { score, grade: 'A', label: 'Excellent', color: 'green' };
    if (score >= 75) return { score, grade: 'B', label: 'Good', color: 'sky' };
    if (score >= 60) return { score, grade: 'C', label: 'Average', color: 'amber' };
    if (score >= 45) return { score, grade: 'D', label: 'Needs Improvement', color: 'orange' };
    return { score, grade: 'F', label: 'Critical', color: 'red' };
  }

  async getFarmScorecard(pondId: string, userId: string): Promise<FarmScorecard> {
    const pond = await this.pondRepo.findByIdAndUserId(pondId, userId);
    if (!pond) throw new AppError('Pond not found', 404);

    const [
      latestStocking,
      totalMortality,
      latestGrowth,
      allGrowthSamples,
      totalFeedKg,
      totalExpenses,
      totalRevenue,
      totalFishSold,
      overdueTaskCount,
      waterReadingCount,
      completionStats
    ] = await Promise.all([
      this.stockingRepo.findLatestByPondId(pondId),
      this.mortalityRepo.getTotalMortality(pondId),
      this.growthRepo.findLatestByPondId(pondId),
      this.growthRepo.findAllByPondId(pondId),
      this.feedingRepo.getTotalFeedKgByPondId(pondId),
      this.expenseRepo.getTotalExpenses(pondId),
      this.saleRepo.getTotalRevenue(pondId),
      this.saleRepo.getTotalFishSoldKg(pondId),
      this.taskRepo.countByStatus(userId, pondId),
      this.waterRepo.countByPondId(pondId),
      this.taskRepo.getCompletionStats(userId, 30)
    ]);

    const fishAgeDays = latestStocking ? differenceInDays(new Date(), latestStocking.stockingDate) : 0;
    const totalStocked = latestStocking?.quantity ?? 0;
    const estimatedAlive = Math.max(0, totalStocked - totalMortality);
    const survivalRate = totalStocked > 0 ? (estimatedAlive / totalStocked) * 100 : 0;
    
    const avgWeightGrams = latestGrowth?.averageWeightGrams ?? null;
    const benchmarkWeight = avgWeightGrams ? this.getBenchmarkWeight(fishAgeDays) : null;
    const growthVariance = avgWeightGrams && benchmarkWeight ? ((avgWeightGrams - benchmarkWeight) / benchmarkWeight) * 100 : null;
    
    const estimatedBiomassKg = avgWeightGrams ? (estimatedAlive * avgWeightGrams) / 1000 : null;
    const initialBiomassKg = (totalStocked * (latestStocking?.fingerlingSize_cm ?? 5)) / 1000;
    const weightGainKg = estimatedBiomassKg ? estimatedBiomassKg - initialBiomassKg : 0;
    const fcr = weightGainKg > 0 && totalFeedKg > 0 ? totalFeedKg / weightGainKg : null;
    
    const netPL = totalRevenue - totalExpenses;
    const costPerKg = totalFishSold > 0 ? totalExpenses / totalFishSold : null;

    // Grades
    const fishHealthScoreVal = survivalRate > 95 ? 100 : survivalRate > 85 ? 85 : survivalRate > 70 ? 70 : 50;
    const feedingScoreVal = fcr ? (fcr < 1.5 ? 100 : fcr <= 1.8 ? 85 : fcr <= 2.2 ? 70 : 50) : 0;
    const waterScoreVal = waterReadingCount > 10 ? 90 : waterReadingCount > 0 ? 70 : 0;
    const taskScoreVal = completionStats.completionRate;
    const financialScoreVal = netPL > 0 ? 100 : totalExpenses > 0 ? 60 : 0;
    
    let completeness = 0;
    if (latestStocking) completeness += 20;
    if (totalFeedKg > 0) completeness += 20;
    if (waterReadingCount > 0) completeness += 20;
    if (allGrowthSamples.length > 0) completeness += 20;
    if (totalExpenses > 0) completeness += 20;

    const overallScoreVal = Math.round((fishHealthScoreVal + feedingScoreVal + waterScoreVal + taskScoreVal + financialScoreVal + completeness) / 6);

    const milestones: MilestoneAchieved[] = [];
    milestones.push({ label: 'First fish stocked', isAchieved: !!latestStocking, achievedDate: latestStocking?.stockingDate.toISOString() ?? null });
    milestones.push({ label: 'First growth sample', isAchieved: allGrowthSamples.length > 0, achievedDate: allGrowthSamples[0]?.sampleDate.toISOString() ?? null });
    milestones.push({ label: 'First water quality reading', isAchieved: waterReadingCount > 0, achievedDate: null });
    milestones.push({ label: '30-day survival achieved', isAchieved: fishAgeDays >= 30, achievedDate: latestStocking ? addDays(latestStocking.stockingDate, 30).toISOString() : null });
    milestones.push({ label: 'Fish reached 100g', isAchieved: (avgWeightGrams ?? 0) >= 100, achievedDate: latestGrowth?.sampleDate.toISOString() ?? null });
    milestones.push({ label: 'First sale completed', isAchieved: totalRevenue > 0, achievedDate: null });
    milestones.push({ label: 'Break-even reached', isAchieved: totalRevenue >= totalExpenses && totalRevenue > 0, achievedDate: null });

    return {
      generatedAt: new Date().toISOString(),
      period: 'all_time',
      pond: {
        name: pond.name,
        location: pond.location ?? '',
        areaSqft: pond.areaSqft,
        areaAcres: pond.areaAcres,
        maxDepthFt: pond.maxDepthFt
      },
      fish: {
        fishAgeDays,
        species: latestStocking?.species ?? null,
        totalStocked,
        estimatedAlive,
        totalMortality,
        survivalRate,
        survivalRateGrade: this.getGrade(fishHealthScoreVal),
        avgWeightGrams,
        benchmarkWeight,
        growthVariance,
        estimatedBiomassKg,
        fcr,
        fcrGrade: fcr ? this.getGrade(feedingScoreVal) : null
      },
      feeding: {
        totalFeedKg,
        averageDailyGrams: fishAgeDays > 0 ? (totalFeedKg * 1000) / fishAgeDays : 0,
        feedingDaysCount: 0, // Not querying detailed logs here
        feedingConsistencyPct: 0
      },
      water: {
        totalReadings: waterReadingCount,
        readingsPerWeek: fishAgeDays > 0 ? waterReadingCount / (fishAgeDays / 7) : 0,
        avgPH: null,
        phInRangePct: null
      },
      financials: {
        totalExpenses,
        totalRevenue,
        netPL,
        isProfit: netPL >= 0,
        costPerKgProduced: costPerKg,
        totalFishSoldKg: totalFishSold
      },
      tasks: {
        overdueCount: overdueTaskCount.overdue,
        completionRate: completionStats.completionRate,
        streak: completionStats.streak
      },
      scores: {
        fishHealth: this.getGrade(fishHealthScoreVal),
        feedingConsistency: this.getGrade(feedingScoreVal),
        waterQuality: this.getGrade(waterScoreVal),
        taskCompletion: this.getGrade(taskScoreVal),
        financialHealth: this.getGrade(financialScoreVal),
        dataCompleteness: this.getGrade(completeness),
        overall: this.getGrade(overallScoreVal)
      },
      milestones,
      recommendations: ["Monitor water quality daily", "Ensure feed rationing is consistent", "Log tasks to improve completion rate"]
    };
  }

  async getHarvestReadinessReport(pondId: string, userId: string): Promise<HarvestReadinessReport> {
    const pond = await this.pondRepo.findByIdAndUserId(pondId, userId);
    if (!pond) throw new AppError('Pond not found', 404);

    const data = await this.reportsRepo.getHarvestReadinessData(pondId);
    const latestGrowth = data.growthSamples[data.growthSamples.length - 1];
    const currentWeight = latestGrowth?.averageWeightGrams ?? 0;
    const targetWeight = 700;
    const remainingGrowth = Math.max(0, targetWeight - currentWeight);

    let gramsPerDay = 0;
    let daysToHarvest: number | null = null;
    let harvestDate: string | null = null;

    if (data.growthSamples.length >= 2) {
      const last = data.growthSamples[data.growthSamples.length - 1];
      const prev = data.growthSamples[data.growthSamples.length - 2];
      const daysBetween = differenceInDays(last.sampleDate, prev.sampleDate);
      gramsPerDay = daysBetween > 0 ? (last.averageWeightGrams - prev.averageWeightGrams) / daysBetween : 0;

      if (gramsPerDay > 0) {
        daysToHarvest = Math.ceil(remainingGrowth / gramsPerDay);
        harvestDate = formatDate(addDays(new Date(), daysToHarvest), 'yyyy-MM-dd');
      }
    }

    const estimatedAlive = Math.max(0, (data.latestStocking?.quantity ?? 0) - data.totalMortality);
    const estimatedHarvestKg = (estimatedAlive * targetWeight) / 1000;
    const latestPrice = data.latestMarketPrices[0]?.pricePerKg ?? 80;

    const scenarios = [
      { label: "Pessimistic", pricePerKg: latestPrice * 0.85, harvestKg: estimatedHarvestKg * 0.95 },
      { label: "Expected", pricePerKg: latestPrice, harvestKg: estimatedHarvestKg },
      { label: "Optimistic", pricePerKg: latestPrice * 1.15, harvestKg: estimatedHarvestKg * 1.05 }
    ].map(s => {
      const revenue = s.pricePerKg * s.harvestKg;
      const profit = revenue - data.totalExpenses;
      return { ...s, revenue, profit, roi: data.totalExpenses > 0 ? (profit / data.totalExpenses) * 100 : 0 };
    });

    const survivalRate = data.latestStocking?.quantity ? (estimatedAlive / data.latestStocking.quantity) * 100 : 0;
    
    return {
      generatedAt: new Date().toISOString(),
      currentWeight: currentWeight > 0 ? currentWeight : null,
      targetWeight,
      readinessPercent: Math.min(100, Math.round((currentWeight / targetWeight) * 100)),
      daysToHarvest,
      estimatedHarvestDate: harvestDate,
      gramsPerDay,
      estimatedAlive,
      estimatedHarvestKg,
      scenarios,
      checklist: [
        { item: "Fish reached 500g+ average weight", status: currentWeight >= 500 ? 'PASS' : 'NOT_READY', value: `${currentWeight}g (target: 500g)` },
        { item: "Survival rate above 85%", status: survivalRate >= 85 ? 'PASS' : 'CONCERN', value: `${survivalRate.toFixed(1)}%` },
        { item: "Market price recorded", status: data.latestMarketPrices.length > 0 ? 'PASS' : 'ACTION_NEEDED', value: data.latestMarketPrices.length > 0 ? `₹${latestPrice}/kg` : 'No price recorded' },
        { item: "Transport/logistics planned", status: 'MANUAL_CHECK', value: 'Requires manual verification' },
        { item: "Pre-harvest fasting planned", status: 'MANUAL_CHECK', value: 'Stop feeding 24-48 hours before harvest' }
      ],
      recommendation: currentWeight >= targetWeight ? "Fish are ready to harvest!" : "Keep monitoring growth. Plan harvest when closer to target.",
      isReadyToHarvest: currentWeight >= 700
    };
  }

  async getGrowthAnalyticsReport(pondId: string, userId: string): Promise<GrowthAnalyticsReport> {
    const pond = await this.pondRepo.findByIdAndUserId(pondId, userId);
    if (!pond) throw new AppError('Pond not found', 404);

    const samples = await this.reportsRepo.getGrowthTimeline(pondId);
    let fcr: number | null = null;
    let gramsPerDay = 0;
    
    const enrichedSamples = samples.map(s => {
      s.benchmarkWeight = this.getBenchmarkWeight(s.fishAgeDays);
      s.variancePercent = s.averageWeightGrams && s.benchmarkWeight ? ((s.averageWeightGrams - s.benchmarkWeight) / s.benchmarkWeight) * 100 : null;
      return s;
    });

    if (enrichedSamples.length >= 2) {
      const last = enrichedSamples[enrichedSamples.length - 1];
      const prev = enrichedSamples[enrichedSamples.length - 2];
      const daysBetween = last.fishAgeDays - prev.fishAgeDays;
      if (daysBetween > 0) {
        gramsPerDay = (last.averageWeightGrams - prev.averageWeightGrams) / daysBetween;
      }
    }

    const predictions: GrowthPrediction[] = [];
    if (enrichedSamples.length >= 2) {
      const lastN = enrichedSamples.slice(-3);
      const meanX = lastN.reduce((s, p) => s + p.fishAgeDays, 0) / lastN.length;
      const meanY = lastN.reduce((s, p) => s + p.averageWeightGrams, 0) / lastN.length;
      const num = lastN.reduce((s, p) => s + (p.fishAgeDays - meanX) * (p.averageWeightGrams - meanY), 0);
      const den = lastN.reduce((s, p) => s + Math.pow(p.fishAgeDays - meanX, 2), 0);
      const slope = den !== 0 ? num / den : 0;
      const intercept = meanY - slope * meanX;

      const currentAge = enrichedSamples[enrichedSamples.length - 1].fishAgeDays;
      predictions.push(
        { day: currentAge + 30, predictedWeight: Math.max(0, slope * (currentAge + 30) + intercept) },
        { day: currentAge + 60, predictedWeight: Math.max(0, slope * (currentAge + 60) + intercept) },
        { day: currentAge + 90, predictedWeight: Math.max(0, slope * (currentAge + 90) + intercept) }
      );
    }

    return {
      generatedAt: new Date().toISOString(),
      samples: enrichedSamples,
      chartData: {
        actual: enrichedSamples.map(s => ({ day: s.fishAgeDays, weight: s.averageWeightGrams })),
        benchmark: enrichedSamples.map(s => ({ day: s.fishAgeDays, weight: s.benchmarkWeight! })),
        predicted: predictions.map(p => ({ day: p.day, weight: p.predictedWeight, isPrediction: true }))
      },
      fcr,
      fcrTrend: [],
      currentWeight: enrichedSamples.length > 0 ? enrichedSamples[enrichedSamples.length - 1].averageWeightGrams : null,
      benchmarkWeight: enrichedSamples.length > 0 ? enrichedSamples[enrichedSamples.length - 1].benchmarkWeight : null,
      growthVariance: enrichedSamples.length > 0 ? enrichedSamples[enrichedSamples.length - 1].variancePercent : null,
      gramsPerDay,
      predictions,
      totalSamples: enrichedSamples.length
    };
  }

  async getFeedingAnalyticsReport(pondId: string, userId: string, query: ReportQuery): Promise<FeedingPerformanceData> {
    const pond = await this.pondRepo.findByIdAndUserId(pondId, userId);
    if (!pond) throw new AppError('Pond not found', 404);

    const { start, end } = this.resolveDateRange(query.period, query.startDate, query.endDate);
    const data = await this.reportsRepo.getFeedingPerformanceData(pondId, start, end);
    return data;
  }

  async getWaterQualityReport(pondId: string, userId: string, query: ReportQuery): Promise<WaterQualityReportData> {
    const pond = await this.pondRepo.findByIdAndUserId(pondId, userId);
    if (!pond) throw new AppError('Pond not found', 404);

    const { start, end } = this.resolveDateRange(query.period, query.startDate, query.endDate);
    const data = await this.reportsRepo.getWaterQualityReport(pondId, start, end);
    
    let sumPh = 0, countPh = 0, minPh = 999, maxPh = -999;
    let sumDo = 0, countDo = 0, minDo = 999, maxDo = -999;
    let sumT = 0, countT = 0, minT = 999, maxT = -999;
    let inRange = 0;

    data.logs.forEach(l => {
      if (l.phValue) {
        sumPh += l.phValue; countPh++;
        if (l.phValue < minPh) minPh = l.phValue;
        if (l.phValue > maxPh) maxPh = l.phValue;
        if (l.phValue >= 7.0 && l.phValue <= 8.5) inRange++;
      }
      if (l.dissolvedOxygenPpm) {
        sumDo += l.dissolvedOxygenPpm; countDo++;
        if (l.dissolvedOxygenPpm < minDo) minDo = l.dissolvedOxygenPpm;
        if (l.dissolvedOxygenPpm > maxDo) maxDo = l.dissolvedOxygenPpm;
      }
      if (l.temperatureCelsius) {
        sumT += l.temperatureCelsius; countT++;
        if (l.temperatureCelsius < minT) minT = l.temperatureCelsius;
        if (l.temperatureCelsius > maxT) maxT = l.temperatureCelsius;
      }
    });

    data.phStats = {
      min: countPh > 0 ? minPh : null,
      max: countPh > 0 ? maxPh : null,
      avg: countPh > 0 ? sumPh / countPh : null
    };
    data.doStats = {
      min: countDo > 0 ? minDo : null,
      max: countDo > 0 ? maxDo : null,
      avg: countDo > 0 ? sumDo / countDo : null
    };
    data.tempStats = {
      min: countT > 0 ? minT : null,
      max: countT > 0 ? maxT : null,
      avg: countT > 0 ? sumT / countT : null
    };
    data.phHealthPercent = countPh > 0 ? (inRange / countPh) * 100 : null;

    return data;
  }

  async getFullFarmReport(pondId: string, userId: string, query: ReportQuery): Promise<FullFarmReport> {
    const pond = await this.pondRepo.findByIdAndUserId(pondId, userId);
    if (!pond) throw new AppError('Pond not found', 404);

    const { start, end, label } = this.resolveDateRange(query.period, query.startDate, query.endDate);

    const [scorecard, harvestReadiness, growthAnalytics, feedingAnalytics, waterQuality, timeline] = await Promise.all([
      this.getFarmScorecard(pondId, userId),
      this.getHarvestReadinessReport(pondId, userId),
      this.getGrowthAnalyticsReport(pondId, userId),
      this.getFeedingAnalyticsReport(pondId, userId, query),
      this.getWaterQualityReport(pondId, userId, query),
      this.reportsRepo.getFullFarmTimeline(pondId, start, end)
    ]);

    return {
      generatedAt: new Date().toISOString(),
      period: { start: start.toISOString(), end: end.toISOString(), label },
      pond: scorecard.pond,
      scorecard,
      harvestReadiness,
      growthAnalytics,
      feedingAnalytics,
      waterQuality,
      timeline,
      exportedBy: userId
    };
  }

  async getExportData(pondId: string, userId: string, query: ExportQuery): Promise<ExportDataResult> {
    const pond = await this.pondRepo.findByIdAndUserId(pondId, userId);
    if (!pond) throw new AppError('Pond not found', 404);

    const { start, end } = this.resolveDateRange(query.period, query.startDate, query.endDate);

    if (query.module === 'feeding_logs') {
      const data = await this.reportsRepo.getFeedingPerformanceData(pondId, start, end);
      return {
        module: query.module,
        filename: `feeding-logs-${pond.name}-${query.period}.csv`,
        headers: ['Date', 'Time', 'Feed Type', 'Brand', 'Quantity (g)', 'Response', 'Finish Time (min)', 'Leftover', 'Notes'],
        rows: data.logs.map(l => [
          l.feedDate.toISOString().split('T')[0],
          l.feedTime ?? '',
          l.feedType,
          l.feedBrand ?? '',
          l.quantityGrams.toString(),
          l.fishResponse,
          l.finishTimeMinutes?.toString() ?? '',
          l.leftoverObserved ? 'Yes' : 'No',
          l.notes ?? ''
        ]),
        rowCount: data.logs.length,
        generatedAt: new Date().toISOString()
      };
    }
    
    // We stub the rest for the time being. In production we'd add the remaining modules.
    return {
      module: query.module,
      filename: `${query.module}-${pond.name}-${query.period}.csv`,
      headers: ['Data export for other modules is mock implemented'],
      rows: [['-']],
      rowCount: 1,
      generatedAt: new Date().toISOString()
    };
  }
}
