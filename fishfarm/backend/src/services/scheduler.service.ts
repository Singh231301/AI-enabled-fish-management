import cron from 'node-cron';
import { FeedingScheduleRepository } from '../repositories/feeding-schedule.repository';
import { FeedingLogRepository } from '../repositories/feeding-log.repository';
import { startOfWeek, endOfWeek, format } from 'date-fns';
import { NotificationService } from './notifications.service';
import { PrismaClient } from '@prisma/client';
import { PondRepository } from '../repositories/pond.repository';
import { WaterQualityLogRepository } from '../repositories/water-quality-log.repository';
import { InventoryRepository } from '../repositories/inventory.repository';
import { EquipmentMaintenanceRepository } from '../repositories/equipment-maintenance.repository';
import { TaskRepository } from '../repositories/task.repository';
import { startOfDay, endOfDay, addDays } from 'date-fns';
import { AiService } from './ai.service';

export class SchedulerService {
  private prisma = new PrismaClient();
  private pondRepo = new PondRepository(this.prisma);
  private waterQualityRepo = new WaterQualityLogRepository(this.prisma);
  private inventoryRepo = new InventoryRepository(this.prisma);
  private maintenanceRepo = new EquipmentMaintenanceRepository(this.prisma);
  private taskRepo = new TaskRepository(this.prisma);

  constructor(
    private readonly feedingScheduleRepo: FeedingScheduleRepository,
    private readonly feedingLogRepo: FeedingLogRepository,
    private readonly notificationService: NotificationService,
    private readonly aiService: AiService
  ) {}

  start() {
    // MORNING & EVENING FEEDING REMINDER
    cron.schedule('0 * * * *', async () => {
      const currentHour = new Date().getHours();
      
      const schedules = await this.feedingScheduleRepo.findAllActiveWithReminders();
      
      for (const schedule of schedules) {
        if (schedule.morningTime) {
          const [schedHour] = schedule.morningTime.split(':').map(Number);
          
          if (schedHour === currentHour) {
            const todayLogs = await this.feedingLogRepo.findTodayByPondId(schedule.pondId);
            const morningFeeds = todayLogs.filter(log => {
              if (!log.feedTime) return false;
              const [h] = log.feedTime.split(':').map(Number);
              return h < 12;
            });
            
            if (morningFeeds.length === 0) {
              await this.notificationService.checkAndCreate({
                userId: schedule.userId,
                pondId: schedule.pondId,
                title: "🌅 Morning Feeding Time",
                message: `It's time to feed your fish in ${schedule.pond.name}. Log your feeding session after completion.`,
                type: 'FEEDING_REMINDER',
                priority: 'MEDIUM',
                actionUrl: '/feeding'
              });
            }
          }
        }
        
        if (schedule.eveningTime) {
          const [eveningHour] = schedule.eveningTime.split(':').map(Number);
          
          if (eveningHour === currentHour) {
            const todayLogs = await this.feedingLogRepo.findTodayByPondId(schedule.pondId);
            const eveningFeeds = todayLogs.filter(log => {
              if (!log.feedTime) return false;
              const [h] = log.feedTime.split(':').map(Number);
              return h >= 12;
            });
            
            if (eveningFeeds.length === 0) {
              await this.notificationService.checkAndCreate({
                userId: schedule.userId,
                pondId: schedule.pondId,
                title: "🌅 Evening Feeding Time",
                message: `Time for the evening feed in ${schedule.pond.name}.`,
                type: 'FEEDING_REMINDER',
                priority: 'MEDIUM',
                actionUrl: '/feeding'
              });
            }
          }
        }
      }
    });

    // MISSED FEEDING ALERT
    cron.schedule('0 20 * * *', async () => {
      const schedules = await this.feedingScheduleRepo.findAllActiveWithReminders();
      
      for (const schedule of schedules) {
        const todayLogs = await this.feedingLogRepo.findTodayByPondId(schedule.pondId);
        
        if (todayLogs.length === 0) {
          await this.notificationService.checkAndCreate({
            userId: schedule.userId,
            pondId: schedule.pondId,
            title: "⚠️ No Feeding Logged Today",
            message: `No feeding recorded today for ${schedule.pond.name}. If fish were fed, please log it to maintain accurate FCR calculations.`,
            type: 'FEEDING_REMINDER',
            priority: 'HIGH',
            actionUrl: '/feeding'
          });
        }
      }
    });

    // WEEKLY FEEDING REPORT
    cron.schedule('0 9 * * 0', async () => {
      const schedules = await this.feedingScheduleRepo.findAllActiveWithReminders();
      
      for (const schedule of schedules) {
        const weekStart = startOfWeek(new Date());
        const weekEnd = endOfWeek(new Date());
        
        const weekLogs = await this.feedingLogRepo.findByPondIdAndDateRange(
          schedule.pondId, weekStart, weekEnd
        );
        
        const totalGrams = weekLogs.reduce((s, l) => s + l.quantityGrams, 0);
        const daysWithFeeding = new Set(
          weekLogs.map(l => format(l.feedDate, 'yyyy-MM-dd'))
        ).size;
        const poorResponses = weekLogs.filter(
          l => l.fishResponse === 'POOR' || l.fishResponse === 'REFUSED'
        ).length;
        
        await this.notificationService.checkAndCreate({
          userId: schedule.userId,
          pondId: schedule.pondId,
          title: "📊 Weekly Feeding Summary",
          message: `This week: ${totalGrams}g total feed given over ${daysWithFeeding}/7 days. ${poorResponses > 0 ? poorResponses + ' poor response sessions.' : 'All feeding responses were good!'}`,
          type: 'INFO',
          priority: 'LOW',
          actionUrl: '/feeding'
        });
      }
    });

    // WATER QUALITY MONITORING REMINDER (Daily at 8 AM)
    cron.schedule('0 8 * * *', async () => {
      try {
        const ponds = await this.pondRepo.findAllActive();
        for (const pond of ponds) {
          const daysSince = await this.waterQualityRepo.getDaysSinceLastReading(pond.id);
          
          if (daysSince >= 3 && daysSince < 7) {
            await this.notificationService.checkAndCreate({
              userId: pond.userId,
              pondId: pond.id,
              title: "💧 Water Quality Check Due",
              message: `${daysSince} days since last reading for ${pond.name}. Check pH and water color today.`,
              type: 'WATER_QUALITY_ALERT',
              priority: 'MEDIUM',
              actionUrl: '/water'
            });
          } else if (daysSince >= 7) {
            await this.notificationService.checkAndCreate({
              userId: pond.userId,
              pondId: pond.id,
              title: "⚠️ Water Quality Overdue",
              message: `No water check in ${daysSince} days for ${pond.name}. Please test immediately.`,
              type: 'WATER_QUALITY_ALERT',
              priority: 'HIGH',
              actionUrl: '/water'
            });
          }
        }
      } catch (err) {
        console.error('Error running water quality reminder job:', err);
      }
    });

    // DAILY LOW STOCK CHECK (runs at 7 AM)
    cron.schedule('0 7 * * *', async () => {
      try {
        const allPonds = await this.pondRepo.findAllActive();
        for (const pond of allPonds) {
          const lowStockItems = await this.inventoryRepo.findLowStockItems(pond.id);
          
          for (const item of lowStockItems) {
            const isOutOfStock = item.currentQuantity === 0;
            
            await this.notificationService.checkAndCreate({
              userId: pond.userId,
              pondId: pond.id,
              title: isOutOfStock
                ? `🚨 Out of Stock: ${item.itemName}`
                : `⚠️ Low Stock: ${item.itemName}`,
              message: isOutOfStock
                ? `${item.itemName} is out of stock. Purchase immediately.`
                : `${item.itemName}: ${item.currentQuantity}${item.unit} remaining (threshold: ${item.reorderThreshold}${item.unit}).`,
              type: 'LOW_STOCK',
              priority: isOutOfStock ? 'HIGH' : 'MEDIUM',
              actionUrl: '/inventory'
            });
          }
        }
      } catch (err) {
        console.error('Error running low stock check job:', err);
      }
    });

    // MAINTENANCE OVERDUE CHECK (runs at 8 AM)
    cron.schedule('0 8 * * *', async () => {
      try {
        const overdueItems = await this.maintenanceRepo.findOverdue();
        
        if (overdueItems.length > 0) {
          const ids = overdueItems.map(m => m.id);
          await this.maintenanceRepo.markOverdue(ids);
          
          for (const maintenance of overdueItems) {
            await this.notificationService.checkAndCreate({
              userId: maintenance.inventory.pond.userId,
              pondId: maintenance.inventory.pondId,
              title: `⚠️ Maintenance Overdue: ${maintenance.inventory.itemName}`,
              message: `${maintenance.maintenanceType} for ${maintenance.inventory.itemName} was due on ${format(maintenance.scheduledDate, 'dd MMM yyyy')}.`,
              type: 'TASK_OVERDUE',
              priority: 'MEDIUM',
              actionUrl: '/inventory'
            });
          }
        }
      } catch (err) {
        console.error('Error running maintenance overdue check job:', err);
      }
    });

    // OVERDUE TASK ESCALATION (runs daily at 6 AM)
    cron.schedule('0 6 * * *', async () => {
      try {
        const overdueTasks = await this.taskRepo.findAllOverdue();
        if (overdueTasks.length === 0) return;
        
        const overdueIds = overdueTasks.map(t => t.id);
        await this.taskRepo.markManyOverdue(overdueIds);
        
        const byUser = new Map<string, typeof overdueTasks>();
        overdueTasks.forEach(task => {
          const existing = byUser.get(task.userId) ?? [];
          byUser.set(task.userId, [...existing, task]);
        });
        
        for (const [userId, tasks] of byUser.entries()) {
          const urgentTasks = tasks.filter(t => t.priority === 'URGENT');
          await this.notificationService.checkAndCreate({
            userId,
            title: `⚠️ ${tasks.length} Task(s) Overdue`,
            message: `You have ${tasks.length} overdue task(s). ${urgentTasks.length > 0 ? `URGENT: ${urgentTasks.map(t => t.title).join(', ')}.` : ''} Please complete or reschedule them.`,
            type: 'TASK_OVERDUE',
            priority: urgentTasks.length > 0 ? 'HIGH' : 'MEDIUM',
            actionUrl: '/tasks'
          });
        }
      } catch (err) {
        console.error('Error running overdue task escalation job:', err);
      }
    });

    // UPCOMING TASK REMINDER (runs daily at 7 AM)
    cron.schedule('0 7 * * *', async () => {
      try {
        const tomorrow = addDays(new Date(), 1);
        const dueTomorrow = await this.prisma.task.findMany({
          where: {
            status: { in: ['PENDING', 'IN_PROGRESS'] },
            dueDate: {
              gte: startOfDay(tomorrow),
              lte: endOfDay(tomorrow)
            },
            reminderDaysBefore: { gte: 1 }
          },
          include: {
            user: { select: { id: true } },
            pond: { select: { id: true, name: true } }
          }
        });
        
        const byUser = new Map<string, typeof dueTomorrow>();
        dueTomorrow.forEach(task => {
          const existing = byUser.get(task.userId) ?? [];
          byUser.set(task.userId, [...existing, task]);
        });
        
        for (const [userId, tasks] of byUser.entries()) {
          if (tasks.length === 0) continue;
          
          const urgentCount = tasks.filter(t => t.priority === 'URGENT' || t.priority === 'HIGH').length;
          
          await this.notificationService.checkAndCreate({
            userId,
            title: `📅 ${tasks.length} Task(s) Due Tomorrow`,
            message: `Tasks due tomorrow: ${tasks.slice(0, 3).map(t => t.title).join(', ')}${tasks.length > 3 ? ` and ${tasks.length - 3} more.` : '.'}`,
            type: 'TASK_DUE',
            priority: urgentCount > 0 ? 'HIGH' : 'MEDIUM',
            actionUrl: '/tasks'
          });
        }
      } catch (err) {
        console.error('Error running upcoming task reminder job:', err);
      }
    });

    // WEEKLY TASK REVIEW (runs every Monday at 8 AM)
    cron.schedule('0 8 * * 1', async () => {
      try {
        const users = await this.prisma.user.findMany({
          where: { isActive: true },
          select: { id: true }
        });
        
        for (const { id: userId } of users) {
          const counts = await this.taskRepo.countByStatus(userId);
          
          if (counts.pending + counts.overdue === 0) continue;
          
          await this.notificationService.checkAndCreate({
            userId,
            title: "📋 Weekly Task Review",
            message: `This week: ${counts.overdue} overdue, ${counts.dueToday} due today, ${counts.pending} upcoming. Review your task list to stay on track.`,
            type: 'INFO',
            priority: counts.overdue > 0 ? 'MEDIUM' : 'LOW',
            actionUrl: '/tasks'
          });
        }
      } catch (err) {
        console.error('Error running weekly task review job:', err);
      }
    });

    // DAILY BRIEFING GENERATION (runs at 6 AM)
    cron.schedule('0 6 * * *', async () => {
      const activePonds = await this.pondRepo.findAllActive();
      for (const pond of activePonds) {
        try {
          await this.aiService.generateDailyBriefing(pond.id, pond.userId, false);
          
          await this.notificationService.checkAndCreate({
            userId: pond.userId,
            pondId: pond.id,
            title: "🤖 Daily Farm Briefing Ready",
            message: "Your AI-powered daily farm briefing has been generated. Check AI Assistant.",
            type: 'INFO',
            priority: 'LOW',
            actionUrl: '/ai'
          });
        } catch (error) {
          console.warn(`Failed to generate briefing for pond ${pond.id}:`, error);
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    });

    // WEEKLY REPORT GENERATION (runs Sunday at 9 AM)
    cron.schedule('0 9 * * 0', async () => {
      const activePonds = await this.pondRepo.findAllActive();
      for (const pond of activePonds) {
        try {
          await this.aiService.generateWeeklyReport(pond.id, pond.userId);
          
          await this.notificationService.checkAndCreate({
            userId: pond.userId,
            pondId: pond.id,
            title: "📊 Weekly Farm Report Ready",
            message: "Your AI weekly farm analysis is ready. Review insights and next week's priorities.",
            type: 'INFO',
            priority: 'LOW',
            actionUrl: '/ai'
          });
        } catch (error) {
          console.warn(`Failed to generate weekly report for ${pond.id}`);
        }
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    });
  }
}
