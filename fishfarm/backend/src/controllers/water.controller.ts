import { Request, Response, NextFunction } from 'express';
import { WaterService } from '../services/water.service';
import { InventoryService } from '../services/inventory.service';
import { sendSuccess } from '../utils/response.utils';
import {
  createWaterQualityLogSchema,
  updateWaterQualityLogSchema,
  createWaterTreatmentSchema,
  updateWaterTreatmentSchema,
  waterQualityListQuerySchema,
  waterQualityStatsQuerySchema
} from '../validators/water.validator';

export class WaterController {
  constructor(
    private readonly waterService: WaterService,
    private readonly inventoryService: InventoryService
  ) {}

  public getWaterOverview = async (req: Request, res: Response) => {
    const pondId = req.query.pondId as string;
    if (!pondId) {
      return res.status(400).json({ success: false, message: 'pondId query parameter is required' });
    }
    const overview = await this.waterService.getWaterOverview(pondId, req.user!.id);
    return sendSuccess(res, overview, "Water overview retrieved");
  };

  public getWaterStats = async (req: Request, res: Response) => {
    const query = waterQualityStatsQuerySchema.parse(req.query);
    const stats = await this.waterService.getWaterQualityStats(query.pondId, req.user!.id, query);
    return sendSuccess(res, stats, "Stats retrieved");
  };

  public createWaterQualityLog = async (req: Request, res: Response) => {
    const dto = createWaterQualityLogSchema.parse(req.body);
    const log = await this.waterService.createWaterQualityLog(dto, req.user!.id);
    return sendSuccess(res, log, "Water quality logged", 201);
  };

  public getWaterQualityLogs = async (req: Request, res: Response) => {
    const query = waterQualityListQuerySchema.parse(req.query);
    const data = await this.waterService.getWaterQualityLogs(query.pondId, req.user!.id, query);
    return res.status(200).json({
      success: true,
      data: data.records,
      meta: {
        total: data.total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(data.total / query.limit),
      }
    });
  };

  public getWaterQualityLogById = async (req: Request, res: Response) => {
    const id = req.params.id;
    const pondId = req.query.pondId as string;
    if (!pondId) {
      return res.status(400).json({ success: false, message: 'pondId query parameter is required' });
    }
    const log = await this.waterService.getWaterQualityLogById(id, pondId, req.user!.id);
    return sendSuccess(res, log, "Log retrieved");
  };

  public updateWaterQualityLog = async (req: Request, res: Response) => {
    const id = req.params.id;
    const pondId = req.query.pondId as string;
    if (!pondId) {
      return res.status(400).json({ success: false, message: 'pondId query parameter is required' });
    }
    const dto = updateWaterQualityLogSchema.parse(req.body);
    const updated = await this.waterService.updateWaterQualityLog(id, pondId, req.user!.id, dto);
    return sendSuccess(res, updated, "Water quality updated");
  };

  public deleteWaterQualityLog = async (req: Request, res: Response) => {
    const id = req.params.id;
    const pondId = req.query.pondId as string;
    if (!pondId) {
      return res.status(400).json({ success: false, message: 'pondId query parameter is required' });
    }
    await this.waterService.deleteWaterQualityLog(id, pondId, req.user!.id);
    return sendSuccess(res, null, "Log deleted");
  };

  public createWaterTreatment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = createWaterTreatmentSchema.parse(req.body);
      const treatment = await this.waterService.createWaterTreatment(dto, req.user!.id);

      // Auto-deduct from inventory (non-blocking)
      this.inventoryService.autoDeductChemicalUsage(
        dto.pondId,
        req.user!.id,
        treatment.id,
        treatment.chemicalName,
        treatment.quantityKg,
        new Date(treatment.treatmentDate)
      ).catch(err => {
        console.warn('Inventory chemical auto-deduct failed:', err.message);
      });

      return sendSuccess(res, treatment, "Treatment logged successfully", 201);
    } catch (error) {
      next(error);
    }
  };

  public getTreatmentLogs = async (req: Request, res: Response) => {
    const pondId = req.query.pondId as string;
    if (!pondId) {
      return res.status(400).json({ success: false, message: 'pondId query parameter is required' });
    }
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const data = await this.waterService.getTreatmentLogs(pondId, req.user!.id, { page, limit });
    return res.status(200).json({
      success: true,
      data: data.records,
      meta: {
        total: data.total,
        page,
        limit,
        totalPages: Math.ceil(data.total / limit),
      }
    });
  };

  public updateWaterTreatment = async (req: Request, res: Response) => {
    const id = req.params.id;
    const pondId = req.query.pondId as string;
    if (!pondId) {
      return res.status(400).json({ success: false, message: 'pondId query parameter is required' });
    }
    const dto = updateWaterTreatmentSchema.parse(req.body);
    const updated = await this.waterService.updateWaterTreatment(id, pondId, req.user!.id, dto);
    return sendSuccess(res, updated, "Treatment updated");
  };

  public deleteWaterTreatment = async (req: Request, res: Response) => {
    const id = req.params.id;
    const pondId = req.query.pondId as string;
    if (!pondId) {
      return res.status(400).json({ success: false, message: 'pondId query parameter is required' });
    }
    await this.waterService.deleteWaterTreatment(id, pondId, req.user!.id);
    return sendSuccess(res, null, "Treatment deleted");
  };
}
