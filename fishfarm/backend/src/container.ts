import { prisma } from './config/database';

import { UserRepository } from './repositories/user.repository';
import { ActivityLogRepository } from './repositories/activity-log.repository';
import { PondRepository } from './repositories/pond.repository';
import { DashboardRepository } from './repositories/dashboard.repository';
import { NotificationRepository } from './repositories/notification.repository';
import { InfrastructureChecklistRepository } from './repositories/infrastructure-checklist.repository';
import { FishStockingRepository } from './repositories/fish-stocking.repository';
import { MortalityLogRepository } from './repositories/mortality-log.repository';
import { FishGrowthSampleRepository } from './repositories/fish-growth-sample.repository';
import { FeedingLogRepository } from './repositories/feeding-log.repository';
import { FeedingScheduleRepository } from './repositories/feeding-schedule.repository';

import { AuthService } from './services/auth.service';
import { WeatherService } from './services/weather.service';
import { NotificationService } from './services/notifications.service';
import { DashboardService } from './services/dashboard.service';
import { PondService } from './services/pond.service';
import { FishService } from './services/fish.service';
import { FeedingService } from './services/feeding.service';
import { SchedulerService } from './services/scheduler.service';

import { AuthController } from './controllers/auth.controller';
import { DashboardController } from './controllers/dashboard.controller';
import { AiController } from './controllers/ai.controller';
import { PondController } from './controllers/pond.controller';
import { FishController } from './controllers/fish.controller';
import { FeedingController } from './controllers/feeding.controller';
import { WaterQualityLogRepository } from './repositories/water-quality-log.repository';
import { WaterTreatmentLogRepository } from './repositories/water-treatment-log.repository';
import { WaterService } from './services/water.service';
import { WaterController } from './controllers/water.controller';

// 1. Repositories
const userRepo = new UserRepository(prisma);
const activityLogRepo = new ActivityLogRepository(prisma);
const pondRepo = new PondRepository(prisma);
const dashboardRepo = new DashboardRepository(prisma);
const notificationRepo = new NotificationRepository(prisma);
const infraRepo = new InfrastructureChecklistRepository(prisma);
const fishStockingRepo = new FishStockingRepository(prisma);
const mortalityLogRepo = new MortalityLogRepository(prisma);
const fishGrowthRepo = new FishGrowthSampleRepository(prisma);
const feedingLogRepo = new FeedingLogRepository(prisma);
const feedingScheduleRepo = new FeedingScheduleRepository(prisma);
const waterQualityRepo = new WaterQualityLogRepository(prisma);
const waterTreatmentRepo = new WaterTreatmentLogRepository(prisma);

// 2. Services
const authService = new AuthService(userRepo, activityLogRepo);
const weatherService = new WeatherService();
const notificationService = new NotificationService(notificationRepo);
const dashboardService = new DashboardService(dashboardRepo, weatherService, notificationService);
const pondService = new PondService(pondRepo, infraRepo, activityLogRepo, notificationRepo);
const fishService = new FishService(fishStockingRepo, mortalityLogRepo, fishGrowthRepo, pondRepo, activityLogRepo, notificationService, feedingLogRepo as any);
const feedingService = new FeedingService(feedingLogRepo, feedingScheduleRepo, fishStockingRepo, fishGrowthRepo, mortalityLogRepo, pondRepo, activityLogRepo, notificationService);

const waterService = new WaterService(
  waterQualityRepo,
  waterTreatmentRepo,
  pondRepo,
  fishStockingRepo,
  mortalityLogRepo,
  activityLogRepo,
  notificationService
);

const schedulerService = new SchedulerService(feedingScheduleRepo, feedingLogRepo, notificationService);
schedulerService.start();

// 3. Controllers
export const authController = new AuthController(authService);
export const dashboardController = new DashboardController(dashboardService, pondRepo);
export const aiController = new AiController();
export const pondController = new PondController(pondService);
export const fishController = new FishController(fishService);
export const feedingController = new FeedingController(feedingService);
export const waterController = new WaterController(waterService);
