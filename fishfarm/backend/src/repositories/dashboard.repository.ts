import { PrismaClient } from '@prisma/client';
import { 
  PondBasicStats, 
  TodayFeedingStatus, 
  LatestWaterQuality, 
  TaskCountSummary, 
  DailyMortality, 
  DailyFeeding,
  LowStockItem,
  ActivityItem,
  ExpenseBreakdown
} from '../types/dashboard.types';

export class DashboardRepository {
  constructor(private prisma: PrismaClient) {}

  async getPondBasicStats(pondId: string): Promise<PondBasicStats> {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
    
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

    const [
      latestStocking,
      totalMortalityAgg,
      todayMortalityAgg,
      latestGrowth,
      totalExpenseAgg,
      totalSalesAgg,
      currentMonthExpenseAgg
    ] = await Promise.all([
      this.prisma.fishStocking.findFirst({
        where: { pondId },
        orderBy: { stockingDate: 'desc' }
      }),
      this.prisma.mortalityLog.aggregate({
        where: { pondId },
        _sum: { deadCount: true }
      }),
      this.prisma.mortalityLog.aggregate({
        where: { pondId, logDate: { gte: startOfToday, lte: endOfToday } },
        _sum: { deadCount: true }
      }),
      this.prisma.fishGrowthSample.findFirst({
        where: { pondId },
        orderBy: { sampleDate: 'desc' }
      }),
      this.prisma.expense.aggregate({
        where: { pondId },
        _sum: { totalAmount: true }
      }),
      this.prisma.sale.aggregate({
        where: { pondId },
        _sum: { totalAmount: true }
      }),
      this.prisma.expense.aggregate({
        where: { pondId, expenseDate: { gte: startOfMonth, lte: endOfMonth } },
        _sum: { totalAmount: true }
      })
    ]);

    const totalStocked = latestStocking?.quantity || 0;
    const totalMortality = totalMortalityAgg._sum.deadCount || 0;
    const todayMortality = todayMortalityAgg._sum.deadCount || 0;
    const estimatedAlive = Math.max(0, totalStocked - totalMortality);
    
    let survivalRate = 0;
    if (totalStocked > 0) {
      survivalRate = (estimatedAlive / totalStocked) * 100;
    }

    let fishAgeDays = 0;
    if (latestStocking?.stockingDate) {
      const diffTime = Math.abs(today.getTime() - latestStocking.stockingDate.getTime());
      fishAgeDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }

    const latestAvgWeightGrams = latestGrowth?.averageWeightGrams || null;
    let estimatedBiomassKg = 0;
    if (estimatedAlive > 0) {
      if (latestAvgWeightGrams) {
        estimatedBiomassKg = (estimatedAlive * latestAvgWeightGrams) / 1000;
      } else if (fishAgeDays > 0) {
        // Fallback: estimate 5g per day growth if no sample
        const expectedWeightGrams = Math.min(500, fishAgeDays * 5);
        estimatedBiomassKg = (estimatedAlive * expectedWeightGrams) / 1000;
      }
    }

    return {
      totalStocked,
      totalMortality,
      todayMortality,
      estimatedAlive,
      survivalRate,
      fishAgeDays,
      latestAvgWeightGrams,
      estimatedBiomassKg,
      totalInvested: Number(totalExpenseAgg._sum.totalAmount || 0),
      totalRevenue: Number(totalSalesAgg._sum.totalAmount || 0),
      netProfitLoss: Number((totalSalesAgg._sum.totalAmount || 0) - (totalExpenseAgg._sum.totalAmount || 0)),
      currentMonthExpense: Number(currentMonthExpenseAgg._sum.totalAmount || 0),
      stockingDate: latestStocking?.stockingDate || null,
      species: latestStocking?.species || null
    };
  }

  async getTodayFeedingStatus(pondId: string): Promise<TodayFeedingStatus> {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

    const logs = await this.prisma.feedingLog.findMany({
      where: { pondId, feedDate: { gte: startOfToday, lte: endOfToday } },
      orderBy: { feedTime: 'desc' }
    });

    const feedingCount = logs.length;
    const fedToday = feedingCount > 0;
    const totalFedGrams = logs.reduce((sum, log) => sum + log.quantityGrams, 0);
    const lastFeedTime = fedToday ? logs[0].feedTime : null;
    const lastFeedResponse = fedToday ? logs[0].fishResponse : null;

    return {
      fedToday,
      feedingCount,
      totalFedGrams,
      lastFeedTime,
      lastFeedResponse
    };
  }

  async getLatestWaterQuality(pondId: string): Promise<LatestWaterQuality | null> {
    const record = await this.prisma.waterQualityLog.findFirst({
      where: { pondId },
      orderBy: { logDate: 'desc' }
    });

    if (!record) return null;

    let phStatus: 'normal' | 'low' | 'high' | 'critical' | 'unknown' = 'unknown';
    if (record.phValue !== null) {
      const ph = record.phValue;
      if (ph < 6.0 || ph > 9.0) phStatus = 'critical';
      else if (ph >= 7.0 && ph <= 8.5) phStatus = 'normal';
      else if (ph >= 6.0 && ph < 7.0) phStatus = 'low';
      else if (ph > 8.5 && ph <= 9.0) phStatus = 'high';
    }

    const today = new Date();
    const diffTime = Math.abs(today.getTime() - record.logDate.getTime());
    const daysSinceLastReading = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    return {
      logDate: record.logDate,
      phValue: record.phValue,
      waterColor: record.waterColor,
      waterSmell: record.waterSmell || 'Unknown',
      temperatureCelsius: record.temperatureCelsius,
      dissolvedOxygenPpm: record.dissolvedOxygenPpm,
      phStatus,
      daysSinceLastReading
    };
  }

  async getPendingTasksCount(pondId: string): Promise<TaskCountSummary> {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

    const [overdueCount, dueTodayCount, totalPendingCount] = await Promise.all([
      this.prisma.task.count({
        where: { pondId, status: 'PENDING', dueDate: { lt: startOfToday } }
      }),
      this.prisma.task.count({
        where: { pondId, status: 'PENDING', dueDate: { gte: startOfToday, lte: endOfToday } }
      }),
      this.prisma.task.count({
        where: { pondId, status: { in: ['PENDING', 'IN_PROGRESS'] } }
      })
    ]);

    return { overdueCount, dueTodayCount, totalPendingCount };
  }

  async getWeeklyMortalityTrend(pondId: string): Promise<DailyMortality[]> {
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const logs = await this.prisma.mortalityLog.findMany({
      where: { pondId, logDate: { gte: sevenDaysAgo } },
      orderBy: { logDate: 'asc' }
    });

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const result: Record<string, number> = {};
    
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
      result[days[d.getDay()]] = 0;
    }

    logs.forEach(log => {
      const dayName = days[log.logDate.getDay()];
      if (result[dayName] !== undefined) {
        result[dayName] += log.deadCount;
      }
    });

    return Object.entries(result).map(([date, deadCount]) => ({ date, deadCount }));
  }

  async getWeeklyFeedingTrend(pondId: string): Promise<DailyFeeding[]> {
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const logs = await this.prisma.feedingLog.findMany({
      where: { pondId, feedDate: { gte: sevenDaysAgo } },
      orderBy: { feedDate: 'asc' }
    });

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const result: Record<string, number> = {};
    
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
      result[days[d.getDay()]] = 0;
    }

    logs.forEach(log => {
      const dayName = days[log.feedDate.getDay()];
      if (result[dayName] !== undefined) {
        result[dayName] += log.quantityGrams;
      }
    });

    return Object.entries(result).map(([date, totalGrams]) => ({ date, totalGrams }));
  }

  async getLowStockInventory(pondId: string): Promise<LowStockItem[]> {
    const items = await this.prisma.inventory.findMany({
      where: { pondId }
    });

    // We do filtering here since prisma doesn't allow comparing two columns directly in findMany where clause easily without queryRaw
    return items
      .filter(item => item.currentQuantity <= item.reorderThreshold)
      .map(item => ({
        id: item.id,
        itemName: item.itemName,
        currentQuantity: Number(item.currentQuantity),
        unit: item.unit,
        reorderThreshold: Number(item.reorderThreshold),
        category: item.category
      }));
  }

  async getRecentActivityFeed(pondId: string): Promise<ActivityItem[]> {
    const [feedings, mortalities, waters, expenses] = await Promise.all([
      this.prisma.feedingLog.findMany({
        where: { pondId }, orderBy: { feedDate: 'desc' }, take: 5
      }),
      this.prisma.mortalityLog.findMany({
        where: { pondId }, orderBy: { logDate: 'desc' }, take: 5
      }),
      this.prisma.waterQualityLog.findMany({
        where: { pondId }, orderBy: { logDate: 'desc' }, take: 5
      }),
      this.prisma.expense.findMany({
        where: { pondId }, orderBy: { expenseDate: 'desc' }, take: 3
      })
    ]);

    const activities: ActivityItem[] = [];

    feedings.forEach(f => {
      activities.push({
        id: `f-${f.id}`,
        type: 'feeding',
        date: f.feedDate,
        displayText: `Fed ${f.quantityGrams}g, response: ${f.fishResponse}`,
        icon: 'UtensilsCrossed'
      });
    });

    mortalities.forEach(m => {
      activities.push({
        id: `m-${m.id}`,
        type: 'mortality',
        date: m.logDate,
        displayText: `Mortality: ${m.deadCount} dead. Reason: ${m.probableReason || 'Unknown'}`,
        icon: 'AlertTriangle'
      });
    });

    waters.forEach(w => {
      activities.push({
        id: `w-${w.id}`,
        type: 'water',
        date: w.logDate,
        displayText: `Water check: pH ${w.phValue}, Color: ${w.waterColor}`,
        icon: 'Droplets'
      });
    });

    expenses.forEach(e => {
      activities.push({
        id: `e-${e.id}`,
        type: 'expense',
        date: e.expenseDate,
        displayText: `Expense: ${e.itemName} (₹${e.totalAmount})`,
        icon: 'IndianRupee'
      });
    });

    return activities.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 10);
  }

  async getUnreadNotificationsCount(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: { userId, isRead: false, isDismissed: false }
    });
  }

  async getMonthlyExpenseBreakdown(pondId: string): Promise<ExpenseBreakdown[]> {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const expenses = await this.prisma.expense.groupBy({
      by: ['category'],
      where: { pondId, expenseDate: { gte: startOfMonth } },
      _sum: { totalAmount: true }
    });

    const categoryLabels: Record<string, string> = {
      FEED: 'Feed',
      FINGERLINGS: 'Fingerlings',
      CHEMICALS_LIME: 'Chemicals/Lime',
      EQUIPMENT: 'Equipment',
      LABOR: 'Labor',
      FENCING_INFRASTRUCTURE: 'Fencing/Infra',
      TRANSPORT: 'Transport',
      MISCELLANEOUS: 'Miscellaneous'
    };

    return expenses.map(e => ({
      category: e.category,
      total: Number(e._sum.totalAmount || 0),
      label: categoryLabels[e.category] || e.category
    }));
  }
}
