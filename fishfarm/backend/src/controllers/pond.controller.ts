import { Request, Response, NextFunction } from 'express';
import { PondService } from '../services/pond.service';
import { sendSuccess } from '../utils/response.utils';
import { 
  createPondSchema, 
  updatePondSchema, 
  createInfrastructureItemSchema, 
  updateInfrastructureItemSchema,
  pondIdParamSchema,
  itemIdParamSchema
} from '../validators/pond.validator';

export class PondController {
  constructor(private pondService: PondService) {}

  createPond = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = createPondSchema.parse(req.body);
      const pond = await this.pondService.createPond(dto, req.user!.id);
      return sendSuccess(res, pond, "Pond created successfully", 201);
    } catch (error) {
      next(error);
    }
  };

  getUserPonds = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ponds = await this.pondService.getUserPonds(req.user!.id);
      return sendSuccess(res, ponds, "Ponds retrieved successfully");
    } catch (error) {
      next(error);
    }
  };

  getPondById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { pondId } = pondIdParamSchema.parse(req.params);
      const pond = await this.pondService.getPondById(pondId, req.user!.id);
      return sendSuccess(res, pond, "Pond retrieved successfully");
    } catch (error) {
      next(error);
    }
  };

  updatePond = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { pondId } = pondIdParamSchema.parse(req.params);
      const dto = updatePondSchema.parse(req.body);
      const pond = await this.pondService.updatePond(pondId, req.user!.id, dto);
      return sendSuccess(res, pond, "Pond updated successfully");
    } catch (error) {
      next(error);
    }
  };

  deletePond = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { pondId } = pondIdParamSchema.parse(req.params);
      await this.pondService.deletePond(pondId, req.user!.id);
      return sendSuccess(res, null, "Pond deleted successfully");
    } catch (error) {
      next(error);
    }
  };

  getInfrastructureItems = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { pondId } = pondIdParamSchema.parse(req.params);
      const items = await this.pondService.getInfrastructureItems(pondId, req.user!.id);
      return sendSuccess(res, items, "Infrastructure items retrieved");
    } catch (error) {
      next(error);
    }
  };

  addInfrastructureItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { pondId } = pondIdParamSchema.parse(req.params);
      const dto = createInfrastructureItemSchema.parse(req.body);
      const item = await this.pondService.addInfrastructureItem(pondId, req.user!.id, dto);
      return sendSuccess(res, item, "Infrastructure item added", 201);
    } catch (error) {
      next(error);
    }
  };

  updateInfrastructureItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { pondId, itemId } = itemIdParamSchema.parse(req.params);
      const dto = updateInfrastructureItemSchema.parse(req.body);
      const item = await this.pondService.updateInfrastructureItem(pondId, itemId, req.user!.id, dto);
      return sendSuccess(res, item, "Item updated successfully");
    } catch (error) {
      next(error);
    }
  };

  deleteInfrastructureItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { pondId, itemId } = itemIdParamSchema.parse(req.params);
      await this.pondService.deleteInfrastructureItem(pondId, itemId, req.user!.id);
      return sendSuccess(res, null, "Item deleted successfully");
    } catch (error) {
      next(error);
    }
  };

  getInfrastructureStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { pondId } = pondIdParamSchema.parse(req.params);
      const stats = await this.pondService.getInfrastructureStats(pondId, req.user!.id);
      return sendSuccess(res, stats, "Stats retrieved");
    } catch (error) {
      next(error);
    }
  };
}
