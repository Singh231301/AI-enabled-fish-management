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
import { TaskRepository } from './repositories/task.repository';
import { WaterQualityLogRepository } from './repositories/water-quality-log.repository';
import { WaterTreatmentLogRepository } from './repositories/water-treatment-log.repository';
import { ExpenseRepository } from './repositories/expense.repository';
import { SaleRepository } from './repositories/sale.repository';
import { MarketPriceRepository } from './repositories/market-price.repository';
import { BudgetRepository } from './repositories/budget.repository';
import { InventoryRepository } from './repositories/inventory.repository';
import { InventoryTransactionRepository } from './repositories/inventory-transaction.repository';
import { EquipmentMaintenanceRepository } from './repositories/equipment-maintenance.repository';
import { AiBriefingRepository } from './repositories/ai-briefing.repository';
import { AiChatHistoryRepository } from './repositories/ai-chat-history.repository';
import { ReportsRepository } from './repositories/reports.repository';
import { UserSettingsRepository } from './repositories/user-settings.repository';
import { NotificationPreferenceRepository } from './repositories/notification-preference.repository';
import { UserInvitationRepository } from './repositories/user-invitation.repository';

import { AuthService } from './services/auth.service';
import { WeatherService } from './services/weather.service';
import { NotificationService } from './services/notifications.service';
import { DashboardService } from './services/dashboard.service';
import { PondService } from './services/pond.service';
import { FishService } from './services/fish.service';
import { FeedingService } from './services/feeding.service';
import { SchedulerService } from './services/scheduler.service';
import { TaskService } from './services/task.service';
import { WaterService } from './services/water.service';
import { FinancialService } from './services/financials.service';
import { InventoryService } from './services/inventory.service';
import { FarmContextService } from './services/farm-context.service';
import { AiService } from './services/ai.service';
import { ReportsService } from './services/reports.service';
import { SettingsService } from './services/settings.service';

import { AuthController } from './controllers/auth.controller';
import { DashboardController } from './controllers/dashboard.controller';
import { AiController } from './controllers/ai.controller';
import { PondController } from './controllers/pond.controller';
import { FishController } from './controllers/fish.controller';
import { FeedingController } from './controllers/feeding.controller';
import { WaterController } from './controllers/water.controller';
import { FinancialsController } from './controllers/financials.controller';
import { InventoryController } from './controllers/inventory.controller';
import { TaskController } from './controllers/task.controller';
import { ReportsController } from './controllers/reports.controller';
import { SettingsController } from './controllers/settings.controller';

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
const expenseRepo = new ExpenseRepository(prisma);
const saleRepo = new SaleRepository(prisma);
const marketPriceRepo = new MarketPriceRepository(prisma);
const budgetRepo = new BudgetRepository(prisma);
const inventoryRepo = new InventoryRepository(prisma);
const inventoryTransactionRepo = new InventoryTransactionRepository(prisma);
const equipmentMaintenanceRepo = new EquipmentMaintenanceRepository(prisma);
const taskRepo = new TaskRepository(prisma);
const aiBriefingRepo = new AiBriefingRepository(prisma);
const aiChatHistoryRepo = new AiChatHistoryRepository(prisma);
const reportsRepo = new ReportsRepository(prisma);
const userSettingsRepo = new UserSettingsRepository(prisma);
const notificationPreferenceRepo = new NotificationPreferenceRepository(prisma);
const userInvitationRepo = new UserInvitationRepository(prisma);

// 2. Services
const authService = new AuthService(userRepo, activityLogRepo);
const weatherService = new WeatherService();
const notificationService = new NotificationService(notificationRepo, notificationPreferenceRepo);
const settingsService = new SettingsService(userSettingsRepo, notificationPreferenceRepo, userInvitationRepo, userRepo);
const dashboardService = new DashboardService(dashboardRepo, weatherService, notificationService);
const pondService = new PondService(pondRepo, infraRepo, activityLogRepo, notificationRepo, taskRepo);
const fishService = new FishService(fishStockingRepo, mortalityLogRepo, fishGrowthRepo, pondRepo, activityLogRepo, notificationService);
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

const financialService = new FinancialService(
  expenseRepo,
  saleRepo,
  marketPriceRepo,
  budgetRepo,
  pondRepo,
  fishStockingRepo,
  fishGrowthRepo,
  mortalityLogRepo,
  activityLogRepo,
  notificationService
);

const inventoryService = new InventoryService(
  inventoryRepo,
  inventoryTransactionRepo,
  equipmentMaintenanceRepo,
  pondRepo,
  activityLogRepo,
  notificationService,
  expenseRepo
);

const taskService = new TaskService(taskRepo, pondRepo, fishStockingRepo, fishGrowthRepo, mortalityLogRepo, waterQualityRepo, activityLogRepo, notificationService);

const farmContextService = new FarmContextService(
  pondRepo,
  fishStockingRepo,
  mortalityLogRepo,
  fishGrowthRepo,
  feedingLogRepo,
  waterQualityRepo,
  waterTreatmentRepo,
  expenseRepo,
  saleRepo,
  inventoryRepo,
  taskRepo,
  weatherService
);

const aiService = new AiService(
  aiBriefingRepo,
  aiChatHistoryRepo,
  farmContextService,
  pondRepo,
  feedingLogRepo,
  mortalityLogRepo,
  waterQualityRepo
);

const reportsService = new ReportsService(
  reportsRepo,
  pondRepo,
  fishStockingRepo,
  mortalityLogRepo,
  fishGrowthRepo,
  feedingLogRepo,
  waterQualityRepo,
  expenseRepo,
  saleRepo,
  taskRepo,
  inventoryRepo,
  activityLogRepo
);

const schedulerService = new SchedulerService(feedingScheduleRepo, feedingLogRepo, notificationService, aiService);

export const startScheduler = () => {
  schedulerService.start();
};

// 3. Controllers
export const authController = new AuthController(authService);
export const dashboardController = new DashboardController(dashboardService, pondRepo);
export const aiController = new AiController(aiService);
export const pondController = new PondController(pondService);
export const fishController = new FishController(fishService);
export const feedingController = new FeedingController(feedingService, inventoryService);
export const waterController = new WaterController(waterService, inventoryService);
export const financialsController = new FinancialsController(financialService);
export const inventoryController = new InventoryController(inventoryService);
export const taskController = new TaskController(taskService);
export const reportsController = new ReportsController(reportsService);
export const settingsController = new SettingsController(settingsService);
