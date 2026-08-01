import { PrismaClient } from '@prisma/client';
import {
  FarmTimelineData,
  GrowthDataPoint,
  FeedingPerformanceData,
  WaterQualityReportData,
  MortalityCausesData,
  FinancialReportData,
  TaskCompletionReportData,
  HarvestReadinessData,
  InventoryUsageReportData
} from '../types/reports.types';
import { AppError } from '../utils/app-error';

export class ReportsRepository {
  constructor(private prisma: PrismaClient) {}

  async getFullFarmTimeline(pondId: string, startDate: Date, endDate: Date): Promise<FarmTimelineData> {
    const [
      feedingByDay,
      mortalityByDay,
      waterReadingsByDay,
      expensesByDay,
      salesByDay,
      tasksByDay
    ] = await Promise.all([
      // Daily feed totals
      this.prisma.feedingLog.groupBy({
        by: ['feedDate'],
        where: { pondId, feedDate: { gte: startDate, lte: endDate } },
        _sum: { quantityGrams: true },
        _count: { id: true },
        orderBy: { feedDate: 'asc' }
      }),
      // Daily mortality totals
      this.prisma.mortalityLog.groupBy({
        by: ['logDate'],
        where: { pondId, logDate: { gte: startDate, lte: endDate } },
        _sum: { deadCount: true },
        orderBy: { logDate: 'asc' }
      }),
      // Water readings
      this.prisma.waterQualityLog.findMany({
        where: { pondId, logDate: { gte: startDate, lte: endDate } },
        select: {
          logDate: true,
          phValue: true,
          waterColor: true,
          dissolvedOxygenPpm: true,
          temperatureCelsius: true
        },
        orderBy: { logDate: 'asc' }
      }),
      // Expenses
      this.prisma.expense.groupBy({
        by: ['expenseDate'],
        where: { pondId, expenseDate: { gte: startDate, lte: endDate } },
        _sum: { totalAmount: true },
        orderBy: { expenseDate: 'asc' }
      }),
      // Sales
      this.prisma.sale.findMany({
        where: { pondId, saleDate: { gte: startDate, lte: endDate } },
        select: {
          saleDate: true,
          fishQuantityKg: true,
          pricePerKg: true,
          totalAmount: true,
          paymentStatus: true
        },
        orderBy: { saleDate: 'asc' }
      }),
      // Tasks
      this.prisma.task.findMany({
        where: { pondId, completedDate: { gte: startDate, lte: endDate } },
        select: {
          completedDate: true,
          category: true,
          priority: true,
          dueDate: true
        }
      })
    ]);

    // Combine identical dates for tasks
    const tasksAggregated = tasksByDay.reduce((acc, curr) => {
      const dateStr = curr.completedDate?.toISOString().split('T')[0];
      if (dateStr) {
        if (!acc[dateStr]) acc[dateStr] = 0;
        acc[dateStr]++;
      }
      return acc;
    }, {} as Record<string, number>);

    return {
      feedingByDay: feedingByDay.map(f => ({
        date: f.feedDate.toISOString().split('T')[0],
        totalGrams: f._sum.quantityGrams ?? 0,
        sessions: f._count.id
      })),
      mortalityByDay: mortalityByDay.map(m => ({
        date: m.logDate.toISOString().split('T')[0],
        deadCount: m._sum.deadCount ?? 0
      })),
      waterReadingsByDay: waterReadingsByDay.map(w => ({
        date: w.logDate.toISOString().split('T')[0],
        phValue: w.phValue,
        waterColor: w.waterColor
      })),
      expensesByDay: expensesByDay.map(e => ({
        date: e.expenseDate.toISOString().split('T')[0],
        total: e._sum.totalAmount ?? 0
      })),
      salesByDay: salesByDay.map(s => ({
        date: s.saleDate.toISOString().split('T')[0],
        quantityKg: s.fishQuantityKg,
        revenue: s.totalAmount
      })),
      tasksByDay: Object.entries(tasksAggregated).map(([date, count]) => ({
        date,
        completedCount: count as number
      }))
    };
  }

  async getGrowthTimeline(pondId: string): Promise<GrowthDataPoint[]> {
    const [samples, latestStocking] = await Promise.all([
      this.prisma.fishGrowthSample.findMany({
        where: { pondId },
        orderBy: { sampleDate: 'asc' }
      }),
      this.prisma.fishStocking.findFirst({
        where: { pondId },
        orderBy: { stockingDate: 'desc' }
      })
    ]);

    // We will enrich this in the service layer where we have `getBenchmarkWeight`.
    // Returning partially constructed points here, service will fill the rest.
    return samples.map(s => ({
      fishAgeDays: latestStocking ? Math.max(0, Math.floor((s.sampleDate.getTime() - latestStocking.stockingDate.getTime()) / (1000 * 60 * 60 * 24))) : 0,
      fishAgeWeeks: latestStocking ? Math.max(0, Math.floor((s.sampleDate.getTime() - latestStocking.stockingDate.getTime()) / (1000 * 60 * 60 * 24 * 7))) : 0,
      sampleDate: s.sampleDate.toISOString().split('T')[0],
      averageWeightGrams: s.averageWeightGrams,
      benchmarkWeight: null, // to be calculated in service
      variancePercent: null, // to be calculated in service
      weeklyGrowthRate: null // to be calculated in service
    }));
  }

  async getFeedingPerformanceData(pondId: string, startDate: Date, endDate: Date): Promise<FeedingPerformanceData> {
    const logs = await this.prisma.feedingLog.findMany({
      where: { pondId, feedDate: { gte: startDate, lte: endDate } },
      orderBy: { feedDate: 'asc' }
    });

    const [
      responseGroup,
      typeGroup,
      aggregateStats,
      leftoverCount
    ] = await Promise.all([
      this.prisma.feedingLog.groupBy({
        by: ['fishResponse'],
        where: { pondId, feedDate: { gte: startDate, lte: endDate } },
        _count: { id: true }
      }),
      this.prisma.feedingLog.groupBy({
        by: ['feedType'],
        where: { pondId, feedDate: { gte: startDate, lte: endDate } },
        _sum: { quantityGrams: true }
      }),
      this.prisma.feedingLog.aggregate({
        where: { pondId, feedDate: { gte: startDate, lte: endDate } },
        _sum: { quantityGrams: true },
        _avg: { quantityGrams: true, finishTimeMinutes: true }
      }),
      this.prisma.feedingLog.count({
        where: { pondId, feedDate: { gte: startDate, lte: endDate }, leftoverObserved: true }
      })
    ]);

    const periodDays = Math.max(1, Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    
    const uniqueDays = new Set(logs.map(l => l.feedDate.toISOString().split('T')[0]));
    const feedingDaysCount = uniqueDays.size;

    return {
      logs,
      totalFeedKg: (aggregateStats._sum.quantityGrams ?? 0) / 1000,
      averageDailyGrams: feedingDaysCount > 0 ? (aggregateStats._sum.quantityGrams ?? 0) / feedingDaysCount : 0,
      feedingDaysCount,
      periodDays,
      feedingConsistencyPct: (feedingDaysCount / periodDays) * 100,
      responseBreakdown: responseGroup.map(r => ({
        response: r.fishResponse,
        count: r._count.id,
        percentage: logs.length > 0 ? (r._count.id / logs.length) * 100 : 0
      })),
      feedTypeBreakdown: typeGroup.map(t => ({
        type: t.feedType,
        grams: t._sum.quantityGrams ?? 0,
        percentage: (aggregateStats._sum.quantityGrams ?? 0) > 0 ? ((t._sum.quantityGrams ?? 0) / (aggregateStats._sum.quantityGrams ?? 1)) * 100 : 0
      })),
      weeklyTrend: [], // Built in service
      leftoverFrequencyPct: logs.length > 0 ? (leftoverCount / logs.length) * 100 : 0,
      averageFinishMinutes: aggregateStats._avg.finishTimeMinutes,
      bestDayOfWeek: null, // Built in service
      overUnderFeedingDays: { overfeeding: 0, underfeeding: 0, onTarget: 0 } // Built in service
    };
  }

  async getWaterQualityReport(pondId: string, startDate: Date, endDate: Date): Promise<WaterQualityReportData> {
    const logs = await this.prisma.waterQualityLog.findMany({
      where: { pondId, logDate: { gte: startDate, lte: endDate } },
      orderBy: { logDate: 'asc' }
    });

    return {
      logs,
      periodDays: 0, // set in service
      totalReadings: logs.length,
      readingsPerWeek: 0, // set in service
      phStats: { min: null, max: null, avg: null }, // computed in service
      doStats: { min: null, max: null, avg: null },
      tempStats: { min: null, max: null, avg: null },
      phHealthPercent: null,
      colorFrequency: [],
      longestGapDays: 0,
      limeApplicationEffects: [],
      weeklyPHTrend: []
    };
  }

  async getMortalityCausesReport(pondId: string, startDate: Date, endDate: Date): Promise<MortalityCausesData> {
    const logs = await this.prisma.mortalityLog.findMany({
      where: { pondId, logDate: { gte: startDate, lte: endDate } },
      orderBy: { logDate: 'asc' }
    });
    
    return {
      logs,
      byReason: [],
      highestMortalityDay: null,
      weeklyAverages: [],
      survivalRate: null
    };
  }

  async getFinancialReport(pondId: string, startDate: Date, endDate: Date): Promise<FinancialReportData> {
    const [expenses, sales] = await Promise.all([
      this.prisma.expense.findMany({
        where: { pondId, expenseDate: { gte: startDate, lte: endDate } },
        orderBy: { expenseDate: 'asc' }
      }),
      this.prisma.sale.findMany({
        where: { pondId, saleDate: { gte: startDate, lte: endDate } },
        orderBy: { saleDate: 'asc' }
      })
    ]);

    return {
      expenses,
      sales,
      byCategory: [],
      monthlyExpenseTrend: [],
      monthlyRevenueTrend: [],
      buyerList: []
    };
  }

  async getTaskCompletionReport(pondId: string, userId: string, startDate: Date, endDate: Date): Promise<TaskCompletionReportData> {
    const tasks = await this.prisma.task.findMany({
      where: { pondId, dueDate: { gte: startDate, lte: endDate } }
    });
    return {
      tasks,
      byStatus: [],
      byCategory: [],
      averageCompletionTimeMinutes: null,
      onTimeVsLate: { onTime: 0, late: 0 },
      mostCompletedCategories: []
    };
  }

  async getHarvestReadinessData(pondId: string): Promise<HarvestReadinessData> {
    const [
      latestStocking,
      growthSamples,
      totalMortalityAggregate,
      latestMarketPrices,
      totalExpensesAggregate,
      totalFeedAggregate
    ] = await Promise.all([
      this.prisma.fishStocking.findFirst({
        where: { pondId },
        orderBy: { stockingDate: 'desc' }
      }),
      this.prisma.fishGrowthSample.findMany({
        where: { pondId },
        orderBy: { sampleDate: 'asc' }
      }),
      this.prisma.mortalityLog.aggregate({
        where: { pondId },
        _sum: { deadCount: true }
      }),
      // We don't have a MarketPrice table, but the prompt says:
      // "Latest market prices" ... maybe from previous sales?
      this.prisma.sale.findMany({
        where: { pondId },
        orderBy: { saleDate: 'desc' },
        take: 5
      }),
      this.prisma.expense.aggregate({
        where: { pondId },
        _sum: { totalAmount: true }
      }),
      this.prisma.feedingLog.aggregate({
        where: { pondId },
        _sum: { quantityGrams: true }
      })
    ]);

    return {
      latestStocking,
      growthSamples,
      totalMortality: totalMortalityAggregate._sum.deadCount ?? 0,
      latestMarketPrices: latestMarketPrices,
      totalExpenses: totalExpensesAggregate._sum.totalAmount ?? 0,
      totalFeedKg: (totalFeedAggregate._sum.quantityGrams ?? 0) / 1000
    };
  }

  async getInventoryUsageReport(pondId: string, startDate: Date, endDate: Date): Promise<InventoryUsageReportData> {
    const transactions = await this.prisma.inventoryTransaction.findMany({
      where: {
        inventory: { pondId },
        transactionDate: { gte: startDate, lte: endDate }
      },
      include: {
        inventory: true
      },
      orderBy: { transactionDate: 'asc' }
    });

    return {
      transactions,
      byCategory: [],
      mostUsedItems: []
    };
  }
}
