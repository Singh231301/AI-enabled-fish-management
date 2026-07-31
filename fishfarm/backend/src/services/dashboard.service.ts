import { DashboardRepository } from '../repositories/dashboard.repository';
import { WeatherService } from './weather.service';
import { NotificationService } from './notifications.service';
import { DashboardData, PondBasicStats, LatestWaterQuality, TaskCountSummary, LowStockItem } from '../types/dashboard.types';
import { Pond } from '@prisma/client';

export class DashboardService {
  constructor(
    private dashboardRepo: DashboardRepository,
    private weatherService: WeatherService,
    private notificationService: NotificationService
  ) {}

  async getDashboardData(pondId: string, userId: string, pond: Pond): Promise<DashboardData> {
    const [
      basicStats,
      todayFeeding,
      latestWater,
      taskCounts,
      mortalityTrend,
      feedingTrend,
      lowStock,
      recentActivity,
      monthlyExpenses,
      unreadNotifications
    ] = await Promise.all([
      this.dashboardRepo.getPondBasicStats(pondId),
      this.dashboardRepo.getTodayFeedingStatus(pondId),
      this.dashboardRepo.getLatestWaterQuality(pondId),
      this.dashboardRepo.getPendingTasksCount(pondId),
      this.dashboardRepo.getWeeklyMortalityTrend(pondId),
      this.dashboardRepo.getWeeklyFeedingTrend(pondId),
      this.dashboardRepo.getLowStockInventory(pondId),
      this.dashboardRepo.getRecentActivityFeed(pondId),
      this.dashboardRepo.getMonthlyExpenseBreakdown(pondId),
      this.dashboardRepo.getUnreadNotificationsCount(userId)
    ]);

    const weather = await this.weatherService
      .getCurrentWeather(pond.latitude || 25.1337, pond.longitude || 82.5644)
      .catch(() => null);

    // Run alert checks without blocking main thread aggressively
    await this.checkAndCreateAlerts(
      pondId, 
      userId, 
      basicStats, 
      latestWater, 
      taskCounts, 
      lowStock,
      todayFeeding.fedToday
    ).catch(e => console.error("Error creating alerts:", e));

    // Calculate derived values
    const biomassKg = basicStats.estimatedBiomassKg;
    const fishAgeDays = basicStats.fishAgeDays;
    
    let recommendedFeedGrams = 0;
    if (biomassKg > 0) {
      if (fishAgeDays < 30) {
        recommendedFeedGrams = biomassKg * 1000 * 0.05;
      } else if (fishAgeDays < 60) {
        recommendedFeedGrams = biomassKg * 1000 * 0.04;
      } else if (fishAgeDays < 90) {
        recommendedFeedGrams = biomassKg * 1000 * 0.03;
      } else {
        recommendedFeedGrams = biomassKg * 1000 * 0.025;
      }
      recommendedFeedGrams = Math.max(400, Math.min(5000, recommendedFeedGrams));
    } else {
      recommendedFeedGrams = 400; // default minimum
    }

    // Benchmark calculation (simplified)
    const expectedWeightGrams = Math.min(500, fishAgeDays * 5); // Rough linear estimate for Pangasius up to 500g
    let weightVsBenchmarkPercent = null;
    
    if (basicStats.latestAvgWeightGrams) {
      weightVsBenchmarkPercent = ((basicStats.latestAvgWeightGrams - expectedWeightGrams) / expectedWeightGrams) * 100;
    }

    return {
      pond: {
        id: pond.id,
        name: pond.name,
        location: pond.location,
        areaSqft: Number(pond.areaSqft),
        areaAcres: Number(pond.areaAcres)
      },
      basicStats,
      todayFeeding,
      latestWater,
      taskCounts,
      mortalityTrend,
      feedingTrend,
      lowStock,
      recentActivity,
      monthlyExpenses,
      unreadNotifications,
      weather,
      computed: {
        recommendedFeedGrams: Math.round(recommendedFeedGrams),
        expectedWeightGrams,
        weightVsBenchmarkPercent
      },
      generatedAt: new Date().toISOString()
    };
  }

  private async checkAndCreateAlerts(
    pondId: string, 
    userId: string, 
    basicStats: PondBasicStats, 
    water: LatestWaterQuality | null, 
    tasks: TaskCountSummary, 
    lowStock: LowStockItem[],
    fedToday: boolean
  ) {
    // Condition 1: Mortality spike
    if (basicStats.todayMortality >= 5) {
      await this.notificationService.checkAndCreate({
        userId,
        pondId,
        type: 'MORTALITY_ALERT',
        priority: 'HIGH',
        title: "High Mortality Alert",
        message: `${basicStats.todayMortality} fish died today. Check dissolved oxygen and water quality immediately.`,
        actionUrl: "/fish"
      });
    }

    // Condition 2: No feeding logged today (Only between 10 AM and 6 PM)
    const currentHour = new Date().getHours();
    if (!fedToday && basicStats.fishAgeDays > 0 && currentHour >= 10 && currentHour < 18) {
      await this.notificationService.checkAndCreate({
        userId,
        pondId,
        type: 'FEEDING_REMINDER',
        priority: 'MEDIUM',
        title: "Feeding Not Logged Today",
        message: "No feeding recorded today. Log your feeding activity.",
        actionUrl: "/feeding"
      });
    }

    // Condition 3: pH out of range
    if (water && water.phValue !== null) {
      const ph = water.phValue;
      if (ph < 6.5 || ph > 9.0) {
        await this.notificationService.checkAndCreate({
          userId,
          pondId,
          type: 'WATER_QUALITY_ALERT',
          priority: 'HIGH',
          title: "pH Level Critical",
          message: `Current pH is ${ph}. Normal range is 7.0-8.5. Apply lime immediately if pH is low.`,
          actionUrl: "/water"
        });
      } else if (ph < 7.0 || ph > 8.5) {
        await this.notificationService.checkAndCreate({
          userId,
          pondId,
          type: 'WATER_QUALITY_ALERT',
          priority: 'MEDIUM',
          title: "pH Level Warning",
          message: `Current pH is ${ph}. Monitor closely.`,
          actionUrl: "/water"
        });
      }
    }

    // Condition 4: Overdue tasks
    if (tasks.overdueCount > 0) {
      await this.notificationService.checkAndCreate({
        userId,
        pondId,
        type: 'TASK_OVERDUE',
        priority: 'HIGH',
        title: `${tasks.overdueCount} Tasks Overdue`,
        message: `You have ${tasks.overdueCount} overdue tasks. Complete them to keep your farm on track.`,
        actionUrl: "/tasks"
      });
    }

    // Condition 5: Low stock
    if (lowStock.length > 0) {
      for (const item of lowStock) {
        await this.notificationService.checkAndCreate({
          userId,
          pondId,
          type: 'LOW_STOCK',
          priority: 'MEDIUM',
          title: `Low Stock: ${item.itemName}`,
          message: `${item.itemName} is at ${item.currentQuantity} ${item.unit}. Reorder threshold is ${item.reorderThreshold} ${item.unit}.`,
          actionUrl: "/inventory"
        });
      }
    }

    // Condition 6: Water quality not checked in 3+ days
    if (!water || water.daysSinceLastReading >= 3) {
      await this.notificationService.checkAndCreate({
        userId,
        pondId,
        type: 'WATER_QUALITY_ALERT',
        priority: 'MEDIUM',
        title: "Water Quality Check Due",
        message: "Water quality hasn't been logged in 3+ days. Check pH and water color today.",
        actionUrl: "/water"
      });
    }
  }
}
