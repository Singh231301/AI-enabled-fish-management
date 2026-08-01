import { Request, Response, NextFunction } from 'express';
import { ReportsService } from '../services/reports.service';
import { reportQuerySchema, exportQuerySchema, scorecardQuerySchema } from '../validators/reports.validator';
import { sendSuccess } from '../utils/response.utils';

export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  getScorecard = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { pondId } = scorecardQuerySchema.parse(req.query);
      const data = await this.reportsService.getFarmScorecard(pondId, req.user!.id);
      sendSuccess(res, data, 'Farm scorecard retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  getHarvestReadiness = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { pondId } = scorecardQuerySchema.parse(req.query);
      const data = await this.reportsService.getHarvestReadinessReport(pondId, req.user!.id);
      sendSuccess(res, data, 'Harvest readiness report retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  getGrowthAnalytics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { pondId } = scorecardQuerySchema.parse(req.query);
      const data = await this.reportsService.getGrowthAnalyticsReport(pondId, req.user!.id);
      sendSuccess(res, data, 'Growth analytics retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  getFeedingAnalytics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = reportQuerySchema.parse(req.query);
      const data = await this.reportsService.getFeedingAnalyticsReport(query.pondId, req.user!.id, query);
      sendSuccess(res, data, 'Feeding analytics retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  getWaterQuality = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = reportQuerySchema.parse(req.query);
      const data = await this.reportsService.getWaterQualityReport(query.pondId, req.user!.id, query);
      sendSuccess(res, data, 'Water quality report retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  getFullFarmReport = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = reportQuerySchema.parse(req.query);
      const data = await this.reportsService.getFullFarmReport(query.pondId, req.user!.id, query);
      sendSuccess(res, data, 'Full farm report retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  exportData = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = exportQuerySchema.parse(req.query);
      const data = await this.reportsService.getExportData(query.pondId, req.user!.id, query);
      sendSuccess(res, data, 'Data exported successfully');
    } catch (error) {
      next(error);
    }
  };
}
