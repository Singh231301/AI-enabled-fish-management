import cron from 'node-cron';
import { FeedingScheduleRepository } from '../repositories/feeding-schedule.repository';
import { FeedingLogRepository } from '../repositories/feeding-log.repository';
import { startOfWeek, endOfWeek, format } from 'date-fns';
import { NotificationService } from './notification.service';
import { PrismaClient } from '@prisma/client';
import { PondRepository } from '../repositories/pond.repository';
import { WaterQualityLogRepository } from '../repositories/water-quality-log.repository';

export class SchedulerService {
  private prisma = new PrismaClient();
  private pondRepo = new PondRepository(this.prisma);
  private waterQualityRepo = new WaterQualityLogRepository(this.prisma);

  constructor(
    private readonly feedingScheduleRepo: FeedingScheduleRepository,
    private readonly feedingLogRepo: FeedingLogRepository,
    private readonly notificationService: NotificationService
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
  }
}
