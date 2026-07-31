import { Request, Response, NextFunction } from 'express';
import { FishService } from '../services/fish.service';
import { sendSuccess, sendPaginated } from '../utils/response.utils';
import {
  createStockingSchema,
  updateStockingSchema,
  createMortalitySchema,
  updateMortalitySchema,
  createGrowthSampleSchema,
  updateGrowthSampleSchema,
  mortalityListQuerySchema,
  growthSampleListQuerySchema
} from '../validators/fish.validator';
import { z } from 'zod';

export class FishController {
  constructor(private fishService: FishService) {}

  // === STOCKING ===

  createStocking = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = createStockingSchema.parse(req.body);
      const stocking = await this.fishService.createStocking(data, req.user!.id);
      sendSuccess(res, stocking, "Stocking record created", 201);
    } catch (error) {
      next(error);
    }
  };

  getStockings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pondId = z.string().uuid().parse(req.query.pondId);
      const stockings = await this.fishService.getStockingsByPond(pondId, req.user!.id);
      sendSuccess(res, stockings, "Stockings retrieved");
    } catch (error) {
      next(error);
    }
  };

  getStockingById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pondId = z.string().uuid().parse(req.query.pondId);
      const id = z.string().uuid().parse(req.params.id);
      const stocking = await this.fishService.getStockingById(id, pondId, req.user!.id);
      sendSuccess(res, stocking, "Stocking retrieved");
    } catch (error) {
      next(error);
    }
  };

  updateStocking = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pondId = z.string().uuid().parse(req.query.pondId);
      const id = z.string().uuid().parse(req.params.id);
      const data = updateStockingSchema.parse(req.body);
      const stocking = await this.fishService.updateStocking(id, pondId, req.user!.id, data);
      sendSuccess(res, stocking, "Stocking record updated");
    } catch (error) {
      next(error);
    }
  };

  deleteStocking = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pondId = z.string().uuid().parse(req.query.pondId);
      const id = z.string().uuid().parse(req.params.id);
      await this.fishService.deleteStocking(id, pondId, req.user!.id);
      sendSuccess(res, null, "Stocking record deleted");
    } catch (error) {
      next(error);
    }
  };

  // === MORTALITY ===

  createMortality = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = createMortalitySchema.parse(req.body);
      const log = await this.fishService.createMortalityLog(data, req.user!.id);
      sendSuccess(res, log, "Mortality log created", 201);
    } catch (error) {
      next(error);
    }
  };

  getMortalityLogs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = mortalityListQuerySchema.parse(req.query);
      const result = await this.fishService.getMortalityLogs(query.pondId, req.user!.id, query);
      sendPaginated(res, result.records, result.total, result.pagination.page, result.pagination.limit, "Mortality logs retrieved");
    } catch (error) {
      next(error);
    }
  };

  getMortalityById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pondId = z.string().uuid().parse(req.query.pondId);
      const id = z.string().uuid().parse(req.params.id);
      const log = await this.fishService.getMortalityById(id, pondId, req.user!.id);
      sendSuccess(res, log, "Mortality log retrieved");
    } catch (error) {
      next(error);
    }
  };

  updateMortality = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pondId = z.string().uuid().parse(req.query.pondId);
      const id = z.string().uuid().parse(req.params.id);
      const data = updateMortalitySchema.parse(req.body);
      const log = await this.fishService.updateMortalityLog(id, pondId, req.user!.id, data);
      sendSuccess(res, log, "Mortality log updated");
    } catch (error) {
      next(error);
    }
  };

  deleteMortality = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pondId = z.string().uuid().parse(req.query.pondId);
      const id = z.string().uuid().parse(req.params.id);
      await this.fishService.deleteMortalityLog(id, pondId, req.user!.id);
      sendSuccess(res, null, "Mortality log deleted");
    } catch (error) {
      next(error);
    }
  };

  getMortalitySummary = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pondId = z.string().uuid().parse(req.query.pondId);
      const summary = await this.fishService.getMortalitySummary(pondId, req.user!.id);
      sendSuccess(res, summary, "Mortality summary retrieved");
    } catch (error) {
      next(error);
    }
  };

  // === GROWTH SAMPLES ===

  createGrowthSample = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = createGrowthSampleSchema.parse(req.body);
      const sample = await this.fishService.createGrowthSample(data, req.user!.id);
      sendSuccess(res, sample, "Growth sample created", 201);
    } catch (error) {
      next(error);
    }
  };

  getGrowthSamples = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = growthSampleListQuerySchema.parse(req.query);
      const result = await this.fishService.getGrowthSamples(query.pondId, req.user!.id, query);
      sendPaginated(res, result.records, result.total, result.pagination.page, result.pagination.limit, "Growth samples retrieved");
    } catch (error) {
      next(error);
    }
  };

  updateGrowthSample = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pondId = z.string().uuid().parse(req.query.pondId);
      const id = z.string().uuid().parse(req.params.id);
      const data = updateGrowthSampleSchema.parse(req.body);
      const sample = await this.fishService.updateGrowthSample(id, pondId, req.user!.id, data);
      sendSuccess(res, sample, "Growth sample updated");
    } catch (error) {
      next(error);
    }
  };

  deleteGrowthSample = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pondId = z.string().uuid().parse(req.query.pondId);
      const id = z.string().uuid().parse(req.params.id);
      await this.fishService.deleteGrowthSample(id, pondId, req.user!.id);
      sendSuccess(res, null, "Growth sample deleted");
    } catch (error) {
      next(error);
    }
  };

  getGrowthSummary = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pondId = z.string().uuid().parse(req.query.pondId);
      const summary = await this.fishService.getGrowthSummary(pondId, req.user!.id);
      sendSuccess(res, summary, "Growth summary retrieved");
    } catch (error) {
      next(error);
    }
  };

  // === COMBINED OVERVIEW ===

  getFishOverview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pondId = z.string().uuid().parse(req.query.pondId);
      const [stockings, mortalitySummary, growthSummary] = await Promise.all([
        this.fishService.getStockingsByPond(pondId, req.user!.id),
        this.fishService.getMortalitySummary(pondId, req.user!.id),
        this.fishService.getGrowthSummary(pondId, req.user!.id)
      ]);
      
      sendSuccess(res, { stockings, mortalitySummary, growthSummary }, "Fish overview retrieved");
    } catch (error) {
      next(error);
    }
  };
}
