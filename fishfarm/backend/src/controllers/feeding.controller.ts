import { Request, Response, NextFunction } from 'express';
import { FeedingService } from '../services/feeding.service';
import { InventoryService } from '../services/inventory.service';
import { sendSuccess, sendPaginated } from '../utils/response.utils';
import { 
  createFeedingLogSchema, 
  updateFeedingLogSchema, 
  feedingListQuerySchema, 
  feedingStatsQuerySchema, 
  createFeedingScheduleSchema 
} from '../validators/feeding.validator';

export class FeedingController {
  constructor(
    private feedingService: FeedingService,
    private inventoryService: InventoryService
  ) {}

  createFeedingLog = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = createFeedingLogSchema.parse(req.body);
      const log = await this.feedingService.createFeedingLog(body, req.user!.id);
      
      // Auto-deduct from inventory (non-blocking)
      if (log.feedBrand) {
        this.inventoryService.autoDeductFeedUsage(
          body.pondId,
          req.user!.id,
          log.id,
          log.feedBrand,
          log.quantityGrams,
          new Date(log.feedDate)
        ).catch(err => {
          console.warn('Inventory auto-deduct failed:', err.message);
        });
      }

      sendSuccess(res, log, "Feeding logged successfully", 201);
    } catch (error) {
      next(error);
    }
  };

  getFeedingLogs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = feedingListQuerySchema.parse(req.query);
      const result = await this.feedingService.getFeedingLogs(query.pondId, req.user!.id, query);
      sendPaginated(res, result.records, result.total, result.pagination.page, result.pagination.limit, "Logs retrieved");
    } catch (error) {
      next(error);
    }
  };

  getFeedingLogById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const pondId = req.query.pondId as string;
      const log = await this.feedingService.getFeedingLogById(id, pondId, req.user!.id);
      sendSuccess(res, log, "Feeding log retrieved");
    } catch (error) {
      next(error);
    }
  };

  updateFeedingLog = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const pondId = req.query.pondId as string;
      const dto = updateFeedingLogSchema.parse(req.body);
      const log = await this.feedingService.updateFeedingLog(id, pondId, req.user!.id, dto);
      sendSuccess(res, log, "Feeding log updated");
    } catch (error) {
      next(error);
    }
  };

  deleteFeedingLog = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const pondId = req.query.pondId as string;
      await this.feedingService.deleteFeedingLog(id, pondId, req.user!.id);
      sendSuccess(res, null, "Feeding log deleted");
    } catch (error) {
      next(error);
    }
  };

  getFeedingStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = feedingStatsQuerySchema.parse(req.query);
      const stats = await this.feedingService.getFeedingStats(query.pondId, req.user!.id, query);
      sendSuccess(res, stats, "Stats retrieved");
    } catch (error) {
      next(error);
    }
  };

  getTodayStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pondId = req.query.pondId as string;
      const status = await this.feedingService.getTodayFeedingStatus(pondId, req.user!.id);
      sendSuccess(res, status, "Today's status retrieved");
    } catch (error) {
      next(error);
    }
  };

  getFeedingOverview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pondId = req.query.pondId as string;
      const overview = await this.feedingService.getFeedingOverview(pondId, req.user!.id);
      sendSuccess(res, overview, "Overview retrieved");
    } catch (error) {
      next(error);
    }
  };

  upsertSchedule = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = createFeedingScheduleSchema.parse(req.body);
      const schedule = await this.feedingService.upsertSchedule(dto, req.user!.id);
      sendSuccess(res, schedule, "Schedule saved", 201);
    } catch (error) {
      next(error);
    }
  };

  getSchedule = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pondId = req.query.pondId as string;
      const schedule = await this.feedingService.getScheduleByPond(pondId, req.user!.id);
      sendSuccess(res, schedule, "Schedule retrieved");
    } catch (error) {
      next(error);
    }
  };
}
