import { Request, Response, NextFunction } from 'express';
import { FinancialService } from '../services/financials.service';
import { sendSuccess, sendPaginated } from '../utils/response.utils';
import { AppError } from '../utils/app-error';
import { 
  createExpenseSchema, updateExpenseSchema, createSaleSchema, updateSaleSchema,
  recordPaymentSchema, createMarketPriceSchema, setBudgetSchema,
  financialQuerySchema, financialStatsQuerySchema 
} from '../validators/financials.validator';

export class FinancialsController {
  constructor(private financialService: FinancialService) {}

  getFinancialOverview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pondId = req.query.pondId as string;
      if (!pondId) throw new AppError('pondId is required', 400);
      const overview = await this.financialService.getFinancialOverview(pondId, req.user!.id);
      sendSuccess(res, overview, 'Overview retrieved');
    } catch (error) {
      next(error);
    }
  };

  getFinancialStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = financialStatsQuerySchema.parse(req.query);
      const stats = await this.financialService.getFinancialStats(query.pondId, req.user!.id, query);
      sendSuccess(res, stats, 'Stats retrieved');
    } catch (error) {
      next(error);
    }
  };

  createExpense = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = createExpenseSchema.parse(req.body);
      const expense = await this.financialService.createExpense(dto, req.user!.id);
      sendSuccess(res, expense, 'Expense recorded', 201);
    } catch (error) {
      next(error);
    }
  };

  getExpenses = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = financialQuerySchema.parse(req.query);
      const { data, meta } = await this.financialService.getExpenses(query.pondId, req.user!.id, query);
      sendPaginated(res, data, meta.total, meta.page, meta.limit, 'Expenses retrieved');
    } catch (error) {
      next(error);
    }
  };

  getExpenseById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pondId = req.query.pondId as string;
      if (!pondId) throw new AppError('pondId is required', 400);
      const expense = await this.financialService.getExpenseById(req.params.id, pondId, req.user!.id);
      sendSuccess(res, expense, 'Expense retrieved');
    } catch (error) {
      next(error);
    }
  };

  updateExpense = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = updateExpenseSchema.parse(req.body);
      const pondId = req.query.pondId as string;
      if (!pondId) throw new AppError('pondId is required', 400);
      const expense = await this.financialService.updateExpense(req.params.id, pondId, req.user!.id, dto);
      sendSuccess(res, expense, 'Expense updated');
    } catch (error) {
      next(error);
    }
  };

  deleteExpense = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pondId = req.query.pondId as string;
      if (!pondId) throw new AppError('pondId is required', 400);
      await this.financialService.deleteExpense(req.params.id, pondId, req.user!.id);
      sendSuccess(res, null, 'Expense deleted');
    } catch (error) {
      next(error);
    }
  };

  createSale = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = createSaleSchema.parse(req.body);
      const sale = await this.financialService.createSale(dto, req.user!.id);
      sendSuccess(res, sale, 'Sale recorded', 201);
    } catch (error) {
      next(error);
    }
  };

  getSales = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = financialQuerySchema.parse(req.query);
      const { data, meta } = await this.financialService.getSales(query.pondId, req.user!.id, query);
      sendPaginated(res, data, meta.total, meta.page, meta.limit, 'Sales retrieved');
    } catch (error) {
      next(error);
    }
  };

  getSaleById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pondId = req.query.pondId as string;
      if (!pondId) throw new AppError('pondId is required', 400);
      const sale = await this.financialService.getSaleById(req.params.id, pondId, req.user!.id);
      sendSuccess(res, sale, 'Sale retrieved');
    } catch (error) {
      next(error);
    }
  };

  updateSale = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = updateSaleSchema.parse(req.body);
      const pondId = req.query.pondId as string;
      if (!pondId) throw new AppError('pondId is required', 400);
      const sale = await this.financialService.updateSale(req.params.id, pondId, req.user!.id, dto);
      sendSuccess(res, sale, 'Sale updated');
    } catch (error) {
      next(error);
    }
  };

  deleteSale = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pondId = req.query.pondId as string;
      if (!pondId) throw new AppError('pondId is required', 400);
      await this.financialService.deleteSale(req.params.id, pondId, req.user!.id);
      sendSuccess(res, null, 'Sale deleted');
    } catch (error) {
      next(error);
    }
  };

  recordPayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = recordPaymentSchema.parse(req.body);
      const pondId = req.query.pondId as string || req.body.pondId;
      if (!pondId) throw new AppError('pondId is required', 400);
      const sale = await this.financialService.recordPayment(req.params.id, pondId, req.user!.id, dto);
      sendSuccess(res, sale, 'Payment recorded');
    } catch (error) {
      next(error);
    }
  };

  recordMarketPrice = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = createMarketPriceSchema.parse(req.body);
      const price = await this.financialService.recordMarketPrice(dto, req.user!.id);
      sendSuccess(res, price, 'Market price recorded', 201);
    } catch (error) {
      next(error);
    }
  };

  getMarketPrices = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pondId = req.query.pondId as string;
      if (!pondId) throw new AppError('pondId is required', 400);
      const prices = await this.financialService.getMarketPrices(pondId, req.user!.id);
      sendSuccess(res, prices, 'Prices retrieved');
    } catch (error) {
      next(error);
    }
  };

  setBudget = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = setBudgetSchema.parse(req.body);
      const budget = await this.financialService.setBudget(dto, req.user!.id);
      sendSuccess(res, budget, 'Budget saved', 201);
    } catch (error) {
      next(error);
    }
  };

  getBudgets = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pondId = req.query.pondId as string;
      const monthYear = req.query.monthYear as string;
      if (!pondId || !monthYear) throw new AppError('pondId and monthYear required', 400);
      const budgets = await this.financialService.getBudgets(pondId, req.user!.id, monthYear);
      sendSuccess(res, budgets, 'Budgets retrieved');
    } catch (error) {
      next(error);
    }
  };

  wireAutoExpenses = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pondId = req.query.pondId as string;
      if (!pondId) throw new AppError('pondId is required', 400);
      await this.financialService.wireAutoExpenses(pondId, req.user!.id);
      sendSuccess(res, null, 'Auto-expenses synced');
    } catch (error) {
      next(error);
    }
  };
}
