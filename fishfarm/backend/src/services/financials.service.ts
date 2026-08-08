import { ExpenseCategory, PaymentStatus, Expense, Sale, MarketPrice, Budget } from '@prisma/client';
import { ExpenseRepository } from '../repositories/expense.repository';
import { SaleRepository } from '../repositories/sale.repository';
import { MarketPriceRepository } from '../repositories/market-price.repository';
import { BudgetRepository } from '../repositories/budget.repository';
import { PondRepository } from '../repositories/pond.repository';
import { FishStockingRepository } from '../repositories/fish-stocking.repository';
import { FishGrowthSampleRepository } from '../repositories/fish-growth-sample.repository';
import { MortalityLogRepository } from '../repositories/mortality-log.repository';
import { ActivityLogRepository } from '../repositories/activity-log.repository';
import { NotificationService } from './notifications.service';
import { 
  FinancialStats, FinancialOverview, BudgetVsActual,
  CategoryBreakdown, MonthlyCashFlow, BreakEvenAnalysis, HarvestProjection, PLStatement
} from '../types/financials.types';
import { 
  CreateExpenseDTO, CreateSaleDTO, RecordPaymentDTO, CreateMarketPriceDTO, 
  SetBudgetDTO,
  FinancialQuery,
  FinancialStatsQuery
} from '../validators/financials.validator';
import { AppError } from '../utils/app-error';
import { startOfMonth, endOfMonth, format } from 'date-fns';

const EXPENSE_CATEGORY_LABELS: Record<string, string> = {
  FINGERLINGS: "Fingerlings",
  FEED: "Fish Feed",
  CHEMICALS_LIME: "Chemicals & Lime",
  EQUIPMENT: "Equipment",
  LABOR: "Labor",
  FENCING_INFRASTRUCTURE: "Fencing & Infrastructure",
  TRANSPORT: "Transport",
  MISCELLANEOUS: "Miscellaneous"
};

const HARVEST_TARGET_WEIGHT_GRAMS = 700;

export class FinancialService {
  constructor(
    private expenseRepo: ExpenseRepository,
    private saleRepo: SaleRepository,
    private marketPriceRepo: MarketPriceRepository,
    private budgetRepo: BudgetRepository,
    private pondRepo: PondRepository,
    private stockingRepo: FishStockingRepository,
    private growthRepo: FishGrowthSampleRepository,
    private mortalityRepo: MortalityLogRepository,
    private activityRepo: ActivityLogRepository,
    private notificationService: NotificationService
  ) {}

  private async generateInvoiceNumber(pondId: string): Promise<string> {
    const latest = await this.saleRepo.getLatestInvoiceNumber(pondId);
    let seq = 1;
    if (latest) {
      const parts = latest.split('-');
      if (parts.length === 3) {
        seq = parseInt(parts[2], 10) + 1;
      }
    }
    return `INV-${new Date().getFullYear()}-${seq.toString().padStart(4, '0')}`;
  }

  async createExpense(dto: CreateExpenseDTO, userId: string): Promise<Expense> {
    const pond = await this.pondRepo.findByIdAndUserId(dto.pondId, userId);
    if (!pond) throw new AppError('Pond not found or unauthorized', 404);

    let totalAmount = dto.totalAmount;
    if (!totalAmount && dto.quantity && dto.unitPrice) {
      totalAmount = dto.quantity * dto.unitPrice;
    }

    const { pondId, ...restDto } = dto;
    
    const expense = await this.expenseRepo.create({
      ...restDto,
      totalAmount,
      expenseDate: new Date(dto.expenseDate),
      category: dto.category as ExpenseCategory,
      pond: { connect: { id: pondId } },
      user: { connect: { id: userId } }
    });

    const currentMonth = format(new Date(), 'yyyy-MM');
    const budgets = await this.budgetRepo.findByPondIdAndMonth(dto.pondId, currentMonth);
    const categoryBudget = budgets.find(b => b.category === dto.category);

    if (categoryBudget && categoryBudget.budgetAmount > 0) {
      const start = startOfMonth(new Date());
      const end = endOfMonth(new Date());
      const monthExpenses = await this.expenseRepo.getTotalExpensesByCategory(
        dto.pondId, dto.category as ExpenseCategory, start, end
      );

      const percentage = (monthExpenses / categoryBudget.budgetAmount) * 100;
      if (percentage >= 90) {
        await this.notificationService.checkAndCreate({
          userId,
          pondId: dto.pondId,
          title: `Budget Alert: ${EXPENSE_CATEGORY_LABELS[dto.category]}`,
          message: `${EXPENSE_CATEGORY_LABELS[dto.category]} expenses are at ${percentage.toFixed(0)}% of monthly budget.`,
          type: 'FINANCIAL_ALERT',
          priority: percentage >= 100 ? 'HIGH' : 'MEDIUM',
          actionUrl: '/financials'
        });
      }
    }

    await this.activityRepo.create({
      user: { connect: { id: userId } },
      action: 'CREATED',
      module: 'FINANCIAL_EXPENSE',
      recordId: expense.id,
      details: { amount: totalAmount, category: dto.category }
    });

    return expense;
  }

  async createAutoExpense(
    pondId: string,
    userId: string,
    data: {
      expenseDate: Date;
      category: string;
      itemName: string;
      quantity?: number;
      unit?: string;
      unitPrice?: number;
      totalAmount: number;
      sourceModule: string;
      sourceRecordId: string;
      notes?: string;
    }
  ): Promise<Expense> {
    const existing = await this.expenseRepo.findAutoGeneratedBySource(
      pondId, data.sourceModule, data.sourceRecordId
    );
    if (existing) return existing;

    return this.expenseRepo.create({
      ...data,
      isAutoGenerated: true,
      category: data.category as ExpenseCategory,
      pond: { connect: { id: pondId } },
      user: { connect: { id: userId } }
    });
  }

  async getExpenses(pondId: string, userId: string, query: FinancialQuery) {
    const pond = await this.pondRepo.findByIdAndUserId(pondId, userId);
    if (!pond) throw new AppError('Pond not found or unauthorized', 404);

    const skip = (query.page - 1) * query.limit;
    const { records, total } = await this.expenseRepo.findByPondId(pondId, {
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
      category: query.category,
      skip,
      take: query.limit
    });

    return {
      data: records,
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit)
      }
    };
  }

  async getExpenseById(id: string, pondId: string, userId: string): Promise<Expense> {
    const pond = await this.pondRepo.findByIdAndUserId(pondId, userId);
    if (!pond) throw new AppError('Pond not found', 404);
    
    const expense = await this.expenseRepo.findByIdAndPondId(id, pondId);
    if (!expense) throw new AppError('Expense not found', 404);
    return expense;
  }

  async updateExpense(id: string, pondId: string, userId: string, dto: any): Promise<Expense> {
    const expense = await this.getExpenseById(id, pondId, userId);
    if (expense.isAutoGenerated) {
      throw new AppError("Auto-generated expenses cannot be edited directly. Update the source record instead.", 400);
    }
    
    return this.expenseRepo.update(id, dto);
  }

  async deleteExpense(id: string, pondId: string, userId: string): Promise<void> {
    const expense = await this.getExpenseById(id, pondId, userId);
    if (expense.isAutoGenerated) {
      throw new AppError("Auto-generated expenses cannot be deleted directly. Update the source record instead.", 400);
    }
    await this.expenseRepo.delete(id);
  }

  async createSale(dto: CreateSaleDTO, userId: string): Promise<Sale> {
    const pond = await this.pondRepo.findByIdAndUserId(dto.pondId, userId);
    if (!pond) throw new AppError('Pond not found', 404);

    const latestStocking = await this.stockingRepo.findLatestByPondId(dto.pondId);
    if (!latestStocking) {
      throw new AppError("No fish stocked in this pond to sell.", 400);
    }

    const balancePending = dto.totalAmount - dto.advanceReceived;
    let paymentStatus = dto.paymentStatus as PaymentStatus;
    if (balancePending <= 0) paymentStatus = 'COMPLETED';
    else if (dto.advanceReceived > 0) paymentStatus = 'PARTIAL';
    else paymentStatus = 'PENDING';

    const invoiceNumber = await this.generateInvoiceNumber(dto.pondId);

    const sale = await this.saleRepo.create({
      ...dto,
      balancePending,
      paymentStatus,
      invoiceNumber,
      saleDate: new Date(dto.saleDate),
      pond: { connect: { id: dto.pondId } },
      user: { connect: { id: userId } }
    });

    await this.notificationService.checkAndCreate({
      userId,
      pondId: dto.pondId,
      title: "💰 Fish Sale Recorded",
      message: `Sale of ${dto.fishQuantityKg}kg to ${dto.buyerName} for ₹${dto.totalAmount}. ${paymentStatus === 'COMPLETED' ? 'Payment complete.' : `₹${balancePending} pending.`}`,
      type: 'INFO',
      priority: 'LOW',
      actionUrl: '/financials'
    });

    if (balancePending > 0) {
      await this.notificationService.checkAndCreate({
        userId,
        pondId: dto.pondId,
        title: "💳 Payment Pending",
        message: `₹${balancePending} pending from ${dto.buyerName} for sale on ${format(new Date(dto.saleDate), 'dd MMM yyyy')}.`,
        type: 'FINANCIAL_ALERT',
        priority: 'MEDIUM',
        actionUrl: '/financials'
      });
    }

    return sale;
  }

  async recordPayment(saleId: string, pondId: string, userId: string, dto: RecordPaymentDTO): Promise<Sale> {
    const pond = await this.pondRepo.findByIdAndUserId(pondId, userId);
    if (!pond) throw new AppError('Pond not found', 404);

    const sale = await this.saleRepo.findByIdAndPondId(saleId, pondId);
    if (!sale) throw new AppError('Sale not found', 404);

    if (dto.amountReceived > sale.balancePending) {
      throw new AppError("Payment exceeds balance pending", 400);
    }

    const newAdvance = sale.advanceReceived + dto.amountReceived;
    const newBalance = sale.totalAmount - newAdvance;
    const newStatus: PaymentStatus = newBalance <= 0 ? 'COMPLETED' : 'PARTIAL';

    return this.saleRepo.update(saleId, {
      advanceReceived: newAdvance,
      balancePending: Math.max(0, newBalance),
      paymentStatus: newStatus
    });
  }

  async getSales(pondId: string, userId: string, query: FinancialQuery) {
    const pond = await this.pondRepo.findByIdAndUserId(pondId, userId);
    if (!pond) throw new AppError('Pond not found or unauthorized', 404);

    const skip = (query.page - 1) * query.limit;
    const { records, total } = await this.saleRepo.findByPondId(pondId, {
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
      paymentStatus: query.paymentStatus,
      skip,
      take: query.limit
    });

    return {
      data: records,
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit)
      }
    };
  }

  async getSaleById(id: string, pondId: string, userId: string): Promise<Sale> {
    const pond = await this.pondRepo.findByIdAndUserId(pondId, userId);
    if (!pond) throw new AppError('Pond not found', 404);
    
    const sale = await this.saleRepo.findByIdAndPondId(id, pondId);
    if (!sale) throw new AppError('Sale not found', 404);
    return sale;
  }

  async updateSale(id: string, pondId: string, userId: string, dto: any): Promise<Sale> {
    const sale = await this.getSaleById(id, pondId, userId);
    return this.saleRepo.update(id, dto);
  }

  async deleteSale(id: string, pondId: string, userId: string): Promise<void> {
    await this.getSaleById(id, pondId, userId);
    await this.saleRepo.delete(id);
  }

  async recordMarketPrice(dto: CreateMarketPriceDTO, userId: string): Promise<MarketPrice> {
    const pond = await this.pondRepo.findByIdAndUserId(dto.pondId, userId);
    if (!pond) throw new AppError('Pond not found', 404);

    return this.marketPriceRepo.create({
      ...dto,
      priceDate: new Date(dto.priceDate),
      pond: { connect: { id: dto.pondId } },
      user: { connect: { id: userId } }
    });
  }

  async getMarketPrices(pondId: string, userId: string): Promise<MarketPrice[]> {
    const pond = await this.pondRepo.findByIdAndUserId(pondId, userId);
    if (!pond) throw new AppError('Pond not found', 404);
    return this.marketPriceRepo.findByPondId(pondId);
  }

  async setBudget(dto: SetBudgetDTO, userId: string): Promise<Budget> {
    const pond = await this.pondRepo.findByIdAndUserId(dto.pondId, userId);
    if (!pond) throw new AppError('Pond not found', 404);

    return this.budgetRepo.upsert(
      dto.pondId,
      userId,
      dto.monthYear,
      dto.category as ExpenseCategory,
      dto.budgetAmount
    );
  }

  async getBudgets(pondId: string, userId: string, monthYear: string): Promise<Budget[]> {
    const pond = await this.pondRepo.findByIdAndUserId(pondId, userId);
    if (!pond) throw new AppError('Pond not found', 404);
    return this.budgetRepo.findByPondIdAndMonth(pondId, monthYear);
  }

  async getFinancialStats(pondId: string, userId: string, query: FinancialStatsQuery): Promise<FinancialStats> {
    const pond = await this.pondRepo.findByIdAndUserId(pondId, userId);
    if (!pond) throw new AppError('Pond not found', 404);

    let startDate: Date | undefined;
    let endDate = new Date();
    let periodDays = 30;

    switch (query.period) {
      case 'current_month':
        startDate = startOfMonth(new Date());
        break;
      case '3months':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 3);
        periodDays = 90;
        break;
      case '6months':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 6);
        periodDays = 180;
        break;
      case 'year':
        startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1);
        periodDays = 365;
        break;
      case 'all':
      default:
        startDate = undefined;
        periodDays = 365;
        break;
    }

    const currentMonthMonthYear = format(new Date(), 'yyyy-MM');
    const monthStartDate = startOfMonth(new Date());
    const monthEndDate = endOfMonth(new Date());

    const [
      totalExpenses,
      totalRevenue,
      expensesByCategory,
      monthlyExpenses,
      monthlySales,
      pendingPayments,
      totalPendingAmount,
      totalFishSold,
      allExpenses,
      allSales,
      latestGrowth,
      latestStocking,
      totalMortality,
      marketPrices,
      currentMonthBudgets,
      currentMonthExpensesByCategory
    ] = await Promise.all([
      this.expenseRepo.getTotalExpenses(pondId, startDate, endDate),
      this.saleRepo.getTotalRevenue(pondId, startDate, endDate),
      this.expenseRepo.getExpensesByCategory(pondId, startDate, endDate),
      this.expenseRepo.getMonthlyExpenses(pondId, 12),
      this.saleRepo.getMonthlySales(pondId, 12),
      this.saleRepo.getPendingPayments(pondId),
      this.saleRepo.getTotalPendingAmount(pondId),
      this.saleRepo.getTotalFishSoldKg(pondId),
      this.expenseRepo.findAllByPondId(pondId),
      this.saleRepo.findAllByPondId(pondId),
      this.growthRepo.findLatestByPondId(pondId),
      this.stockingRepo.findLatestByPondId(pondId),
      this.mortalityRepo.getTotalMortality(pondId),
      this.marketPriceRepo.findByPondId(pondId),
      this.budgetRepo.findByPondIdAndMonth(pondId, currentMonthMonthYear),
      this.expenseRepo.getExpensesByCategory(pondId, monthStartDate, monthEndDate)
    ]);

    const netProfitLoss = totalRevenue - totalExpenses;
    const isProfitable = netProfitLoss > 0;
    const costPerKg = totalFishSold > 0 ? totalExpenses / totalFishSold : null;

    // Cash flow
    const cashFlow: MonthlyCashFlow[] = [];
    let cumulative = 0;
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const mLabel = format(d, 'yyyy-MM');
      const dispLabel = format(d, 'MMM yyyy');
      
      const mExp = monthlyExpenses.find(e => e.month === mLabel)?.total ?? 0;
      const mRev = monthlySales.find(s => s.month === mLabel)?.totalRevenue ?? 0;
      const net = mRev - mExp;
      cumulative += net;
      
      cashFlow.push({
        month: mLabel,
        displayMonth: dispLabel,
        expenses: mExp,
        revenue: mRev,
        netCashFlow: net,
        cumulativeCashFlow: cumulative
      });
    }

    // Budget vs Actual
    const budgetVsActual: BudgetVsActual[] = [];
    let totalBudgeted = 0;
    let totalActual = 0;
    
    currentMonthBudgets.forEach(b => {
      const actual = currentMonthExpensesByCategory.find(c => c.category === b.category)?.total ?? 0;
      const variance = b.budgetAmount - actual;
      const variancePercent = b.budgetAmount > 0 ? (variance / b.budgetAmount) * 100 : 0;
      let status: 'under' | 'over' | 'no_budget' = 'under';
      if (b.budgetAmount === 0) status = 'no_budget';
      else if (actual > b.budgetAmount) status = 'over';

      budgetVsActual.push({
        category: b.category,
        label: EXPENSE_CATEGORY_LABELS[b.category] || b.category,
        budgeted: b.budgetAmount,
        actual,
        variance,
        variancePercent,
        status
      });

      totalBudgeted += b.budgetAmount;
    });

    currentMonthExpensesByCategory.forEach(c => {
      if (!budgetVsActual.find(b => b.category === c.category)) {
        totalActual += c.total;
      } else {
        totalActual += c.total;
      }
    });

    budgetVsActual.push({
      category: 'TOTAL',
      label: 'Total Budget',
      budgeted: totalBudgeted,
      actual: totalActual,
      variance: totalBudgeted - totalActual,
      variancePercent: totalBudgeted > 0 ? ((totalBudgeted - totalActual) / totalBudgeted) * 100 : 0,
      status: totalBudgeted === 0 ? 'no_budget' : totalActual > totalBudgeted ? 'over' : 'under'
    });

    // Break Even
    const totalExpensesAllTime = allExpenses.reduce((sum, e) => sum + e.totalAmount, 0);
    const totalRevenueAllTime = allSales.reduce((sum, s) => sum + s.totalAmount, 0);
    const avgPrice = await this.saleRepo.getAveragePricePerKg(pondId) || (marketPrices.length > 0 ? marketPrices[0].pricePerKg : 80);
    const breakEvenRevenue = totalExpensesAllTime;
    const breakEvenKg = avgPrice > 0 ? breakEvenRevenue / avgPrice : null;
    const currentRevenue = totalRevenueAllTime;
    const revenueToBreakEven = Math.max(0, breakEvenRevenue - currentRevenue);
    const percentageToBreakEven = breakEvenRevenue > 0 ? Math.min(100, (currentRevenue / breakEvenRevenue) * 100) : 0;

    const breakEven: BreakEvenAnalysis = {
      breakEvenRevenue,
      breakEvenKg,
      currentRevenue,
      revenueToBreakEven,
      percentageToBreakEven,
      isBreakEvenReached: currentRevenue >= breakEvenRevenue,
      estimatedBreakEvenDate: null
    };

    // Harvest Projection
    let harvestProjection: HarvestProjection | null = null;
    if (latestStocking) {
      const estimatedAlive = Math.max(0, latestStocking.quantity - totalMortality);
      const currentAvgWeight = latestGrowth?.averageWeightGrams ?? 10;
      const harvestWeightKg = estimatedAlive * (HARVEST_TARGET_WEIGHT_GRAMS / 1000);
      const latestPrice = marketPrices.length > 0 ? marketPrices[0].pricePerKg : 80;
      
      const projectedRevenue = harvestWeightKg * latestPrice;
      const projectedProfit = projectedRevenue - totalExpensesAllTime;
      const projectedROI = totalExpensesAllTime > 0 ? (projectedProfit / totalExpensesAllTime) * 100 : 0;

      harvestProjection = {
        estimatedAlive,
        currentAvgWeightGrams: currentAvgWeight,
        targetHarvestWeightGrams: HARVEST_TARGET_WEIGHT_GRAMS,
        estimatedHarvestKg: harvestWeightKg,
        latestMarketPricePerKg: latestPrice,
        projectedRevenue,
        projectedProfit,
        projectedROI,
        totalInvestedSoFar: totalExpensesAllTime
      };
    }

    const plStatement: PLStatement = {
      period: query.period,
      totalIncome: totalRevenue,
      totalExpenses,
      grossProfit: netProfitLoss,
      netProfit: netProfitLoss,
      profitMargin: totalRevenue > 0 ? (netProfitLoss / totalRevenue) * 100 : 0,
      isProfitable,
      incomeBySource: { fishSales: totalRevenue, otherIncome: 0 },
      expensesByCategory
    };

    return {
      period: query.period,
      periodDays,
      totalExpenses,
      totalRevenue,
      netProfitLoss,
      isProfitable,
      currentMonthExpenses: currentMonthExpensesByCategory.reduce((sum, c) => sum + c.total, 0),
      currentMonthRevenue: monthlySales.find(s => s.month === currentMonthMonthYear)?.totalRevenue ?? 0,
      totalFishSoldKg: totalFishSold,
      costPerKgProduced: costPerKg,
      avgSalePricePerKg: avgPrice,
      totalPendingAmount,
      pendingSalesCount: pendingPayments.length,
      expensesByCategory,
      monthlyExpenses,
      monthlySales,
      cashFlow,
      budgetVsActual,
      breakEven,
      harvestProjection,
      plStatement,
      marketPrices
    };
  }

  async getFinancialOverview(pondId: string, userId: string): Promise<FinancialOverview> {
    const [stats, recentExpensesRes, recentSalesRes] = await Promise.all([
      this.getFinancialStats(pondId, userId, { pondId, period: 'current_month' }),
      this.getExpenses(pondId, userId, { pondId, page: 1, limit: 10 }),
      this.getSales(pondId, userId, { pondId, page: 1, limit: 10 })
    ]);

    return {
      stats,
      recentExpenses: recentExpensesRes.data,
      recentSales: recentSalesRes.data
    };
  }

  async wireAutoExpenses(pondId: string, userId: string): Promise<void> {
    const stockings = await this.stockingRepo.findByPondId(pondId);
    for (const stocking of stockings) {
      if (stocking.totalCost && stocking.totalCost > 0) {
        await this.createAutoExpense(pondId, userId, {
          expenseDate: stocking.stockingDate,
          category: 'FINGERLINGS',
          itemName: `${stocking.species} - Batch #${stocking.batchNumber}`,
          quantity: stocking.quantity,
          unit: 'pieces',
          unitPrice: stocking.costPerFingerling ?? undefined,
          totalAmount: stocking.totalCost,
          sourceModule: 'stocking',
          sourceRecordId: stocking.id,
          notes: 'Auto-generated from fish stocking record'
        });
      }
    }
  }
}
