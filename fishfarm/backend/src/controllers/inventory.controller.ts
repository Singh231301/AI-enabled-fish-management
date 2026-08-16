import { Request, Response, NextFunction } from 'express';
import { InventoryService } from '../services/inventory.service';
import { sendSuccess, sendPaginated } from '../utils/response.utils';
import {
  createInventoryItemSchema,
  updateInventoryItemSchema,
  recordPurchaseSchema,
  recordUsageSchema,
  adjustStockSchema,
  createMaintenanceSchema,
  completeMaintenanceSchema,
  inventoryQuerySchema,
  transactionQuerySchema
} from '../validators/inventory.validator';

export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  public getOverview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pondId = req.query.pondId as string;
      const data = await this.inventoryService.getInventoryOverview(pondId, req.user!.id);
      return sendSuccess(res, data, "Inventory overview retrieved");
    } catch (error) {
      next(error);
    }
  };

  public getStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pondId = req.query.pondId as string;
      const data = await this.inventoryService.getInventoryStats(pondId, req.user!.id);
      return sendSuccess(res, data, "Inventory stats retrieved");
    } catch (error) {
      next(error);
    }
  };

  public getItems = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = inventoryQuerySchema.parse(req.query);
      const data = await this.inventoryService.getInventoryItems(query.pondId, req.user!.id, query);
      return sendPaginated(res, data.items, data.total, query.page, query.limit, "Inventory items retrieved");
    } catch (error) {
      next(error);
    }
  };

  public getItemById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const pondId = req.query.pondId as string;
      const data = await this.inventoryService.getInventoryItemById(id, pondId, req.user!.id);
      return sendSuccess(res, data, "Inventory item retrieved");
    } catch (error) {
      next(error);
    }
  };

  public createItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = createInventoryItemSchema.parse(req.body);
      const item = await this.inventoryService.createInventoryItem(dto, req.user!.id);
      return sendSuccess(res, item, "Inventory item created", 201);
    } catch (error) {
      next(error);
    }
  };

  public updateItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const pondId = req.query.pondId as string;
      const dto = updateInventoryItemSchema.parse(req.body);
      const item = await this.inventoryService.updateInventoryItem(id, pondId, req.user!.id, dto);
      return sendSuccess(res, item, "Inventory item updated");
    } catch (error) {
      next(error);
    }
  };

  public deactivateItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const pondId = req.query.pondId as string;
      await this.inventoryService.deactivateInventoryItem(id, pondId, req.user!.id);
      return sendSuccess(res, null, "Inventory item deactivated");
    } catch (error) {
      next(error);
    }
  };

  public recordPurchase = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = recordPurchaseSchema.parse(req.body);
      const data = await this.inventoryService.recordPurchase(dto, req.user!.id);
      return sendSuccess(res, data, "Purchase recorded", 201);
    } catch (error) {
      next(error);
    }
  };

  public recordUsage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = recordUsageSchema.parse(req.body);
      const data = await this.inventoryService.recordUsage(dto, req.user!.id);
      return sendSuccess(res, data, "Usage recorded", 201);
    } catch (error) {
      next(error);
    }
  };

  public adjustStock = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = adjustStockSchema.parse(req.body);
      const item = await this.inventoryService.adjustStock(dto, req.user!.id);
      return sendSuccess(res, item, "Stock adjusted");
    } catch (error) {
      next(error);
    }
  };

  public getTransactions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = transactionQuerySchema.parse(req.query);
      const data = await this.inventoryService.getTransactions(query.pondId, req.user!.id, query);
      return sendPaginated(res, data.records, data.total, query.page, query.limit, "Transactions retrieved");
    } catch (error) {
      next(error);
    }
  };

  public getMaintenanceSchedule = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pondId = req.query.pondId as string;
      const data = await this.inventoryService.getMaintenanceSchedule(pondId, req.user!.id);
      return sendSuccess(res, data, "Maintenance schedule retrieved");
    } catch (error) {
      next(error);
    }
  };

  public scheduleMaintenance = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = createMaintenanceSchema.parse(req.body);
      const data = await this.inventoryService.scheduleMaintenance(dto, req.user!.id);
      return sendSuccess(res, data, "Maintenance scheduled", 201);
    } catch (error) {
      next(error);
    }
  };

  public completeMaintenance = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const dto = completeMaintenanceSchema.parse(req.body);
      const data = await this.inventoryService.completeMaintenance(id, req.user!.id, dto);
      return sendSuccess(res, data, "Maintenance completed");
    } catch (error) {
      next(error);
    }
  };

  public deleteTransaction = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pondId = req.query.pondId as string;
      const { id } = req.params;
      await this.inventoryService.deleteTransaction(id, pondId, req.user!.id);
      return sendSuccess(res, null, "Transaction deleted successfully");
    } catch (error) {
      next(error);
    }
  };
}
