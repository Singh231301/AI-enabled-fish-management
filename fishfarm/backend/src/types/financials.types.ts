import { Expense, Sale, MarketPrice, Budget, ExpenseCategory, PaymentMethod, PaymentStatus, PriceType } from '@prisma/client';

export type { Expense, Sale, MarketPrice, Budget, ExpenseCategory, PaymentMethod, PaymentStatus, PriceType };

export interface CategoryBreakdown {
  category: ExpenseCategory
  label: string
  total: number
  count: number
  percentage: number
}

export interface MonthlyExpense {
  month: string         // "2026-07"
  displayMonth: string  // "Jul 2026"
  total: number
  byCategory: Partial<Record<ExpenseCategory, number>>
}

export interface MonthlySale {
  month: string
  displayMonth: string
  totalRevenue: number
  totalKg: number
  avgPricePerKg: number
  saleCount: number
}

export interface MonthlyCashFlow {
  month: string
  displayMonth: string
  expenses: number
  revenue: number
  netCashFlow: number
  cumulativeCashFlow: number
}

export interface BudgetVsActual {
  category: string
  label: string
  budgeted: number
  actual: number
  variance: number
  variancePercent: number
  status: 'under' | 'over' | 'no_budget'
}

export interface BreakEvenAnalysis {
  breakEvenRevenue: number
  breakEvenKg: number | null
  currentRevenue: number
  revenueToBreakEven: number
  percentageToBreakEven: number
  isBreakEvenReached: boolean
  estimatedBreakEvenDate: string | null
}

export interface HarvestProjection {
  estimatedAlive: number
  currentAvgWeightGrams: number
  targetHarvestWeightGrams: number
  estimatedHarvestKg: number
  latestMarketPricePerKg: number
  projectedRevenue: number
  projectedProfit: number
  projectedROI: number
  totalInvestedSoFar: number
  remainingInvestmentNeeded?: number
}

export interface PLStatement {
  period: string
  totalIncome: number
  totalExpenses: number
  grossProfit: number
  netProfit: number
  profitMargin: number
  isProfitable: boolean
  incomeBySource: {
    fishSales: number
    otherIncome: number
  }
  expensesByCategory: CategoryBreakdown[]
}

export interface FinancialStats {
  period: string
  periodDays: number
  totalExpenses: number
  totalRevenue: number
  netProfitLoss: number
  isProfitable: boolean
  currentMonthExpenses: number
  currentMonthRevenue: number
  totalFishSoldKg: number
  costPerKgProduced: number | null
  avgSalePricePerKg: number | null
  totalPendingAmount: number
  pendingSalesCount: number
  expensesByCategory: CategoryBreakdown[]
  monthlyExpenses: MonthlyExpense[]
  monthlySales: MonthlySale[]
  cashFlow: MonthlyCashFlow[]
  budgetVsActual: BudgetVsActual[]
  breakEven: BreakEvenAnalysis
  harvestProjection: HarvestProjection | null
  plStatement: PLStatement
  marketPrices: MarketPrice[]
}

export interface FinancialOverview {
  stats: FinancialStats
  recentExpenses: Expense[]
  recentSales: Sale[]
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}
