import { PrismaClient, Prisma, Expense, ExpenseCategory } from '@prisma/client';
import { BaseRepository } from './base.repository';
import { CategoryBreakdown, MonthlyExpense } from '../types/financials.types';
import { startOfMonth, endOfMonth, format, subMonths } from 'date-fns';

export class ExpenseRepository extends BaseRepository<Expense> {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  async findById(id: string): Promise<Expense | null> {
    return this.prisma.expense.findUnique({ where: { id } });
  }

  async findByPondId(
    pondId: string,
    filters: {
      startDate?: Date;
      endDate?: Date;
      category?: string;
      skip: number;
      take: number;
    }
  ): Promise<{ records: Expense[]; total: number }> {
    const where: Prisma.ExpenseWhereInput = {
      pondId,
      ...(filters.category ? { category: filters.category as ExpenseCategory } : {}),
      ...(filters.startDate || filters.endDate ? {
        expenseDate: {
          ...(filters.startDate ? { gte: filters.startDate } : {}),
          ...(filters.endDate ? { lte: filters.endDate } : {})
        }
      } : {})
    };

    const [records, total] = await Promise.all([
      this.prisma.expense.findMany({
        where,
        orderBy: { expenseDate: 'desc' },
        skip: filters.skip,
        take: filters.take
      }),
      this.prisma.expense.count({ where })
    ]);

    return { records, total };
  }

  async findAllByPondId(pondId: string): Promise<Expense[]> {
    return this.prisma.expense.findMany({
      where: { pondId },
      orderBy: { expenseDate: 'asc' }
    });
  }

  async findByPondIdAndDateRange(
    pondId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Expense[]> {
    return this.prisma.expense.findMany({
      where: {
        pondId,
        expenseDate: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { expenseDate: 'asc' }
    });
  }

  async findByIdAndPondId(id: string, pondId: string): Promise<Expense | null> {
    return this.prisma.expense.findFirst({ where: { id, pondId } });
  }

  async getTotalExpenses(
    pondId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<number> {
    const result = await this.prisma.expense.aggregate({
      where: {
        pondId,
        ...(startDate || endDate ? {
          expenseDate: {
            ...(startDate ? { gte: startDate } : {}),
            ...(endDate ? { lte: endDate } : {})
          }
        } : {})
      },
      _sum: { totalAmount: true }
    });
    return result._sum.totalAmount ?? 0;
  }

  async getExpensesByCategory(
    pondId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<CategoryBreakdown[]> {
    const results = await this.prisma.expense.groupBy({
      by: ['category'],
      where: {
        pondId,
        ...(startDate || endDate ? {
          expenseDate: {
            ...(startDate ? { gte: startDate } : {}),
            ...(endDate ? { lte: endDate } : {})
          }
        } : {})
      },
      _sum: { totalAmount: true },
      _count: { id: true },
      orderBy: { _sum: { totalAmount: 'desc' } }
    });

    const totalSpent = results.reduce((sum, r) => sum + (r._sum.totalAmount ?? 0), 0);

    return results.map(r => ({
      category: r.category as ExpenseCategory,
      label: r.category.replace(/_/g, ' '),
      total: r._sum.totalAmount ?? 0,
      count: r._count.id,
      percentage: totalSpent > 0 ? ((r._sum.totalAmount ?? 0) / totalSpent) * 100 : 0
    }));
  }

  async getTotalExpensesByCategory(
    pondId: string,
    category: ExpenseCategory,
    startDate?: Date,
    endDate?: Date
  ): Promise<number> {
    const result = await this.prisma.expense.aggregate({
      where: {
        pondId,
        category,
        ...(startDate || endDate ? {
          expenseDate: {
            ...(startDate ? { gte: startDate } : {}),
            ...(endDate ? { lte: endDate } : {})
          }
        } : {})
      },
      _sum: { totalAmount: true }
    });
    return result._sum.totalAmount ?? 0;
  }

  async getMonthlyExpenses(
    pondId: string,
    months: number
  ): Promise<MonthlyExpense[]> {
    const startDate = subMonths(new Date(), months - 1);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const expenses = await this.prisma.expense.findMany({
      where: {
        pondId,
        expenseDate: { gte: startDate }
      },
      orderBy: { expenseDate: 'asc' }
    });

    const monthlyMap = new Map<string, MonthlyExpense>();

    // Initialize all requested months to 0 to ensure continuity
    for (let i = 0; i < months; i++) {
      const d = subMonths(new Date(), i);
      const m = format(d, 'yyyy-MM');
      monthlyMap.set(m, {
        month: m,
        displayMonth: format(d, 'MMM yyyy'),
        total: 0,
        byCategory: {}
      });
    }

    expenses.forEach(expense => {
      const monthKey = format(expense.expenseDate, 'yyyy-MM');
      if (monthlyMap.has(monthKey)) {
        const monthData = monthlyMap.get(monthKey)!;
        monthData.total += expense.totalAmount;
        
        const cat = expense.category as ExpenseCategory;
        if (!monthData.byCategory[cat]) {
          monthData.byCategory[cat] = 0;
        }
        monthData.byCategory[cat]! += expense.totalAmount;
      }
    });

    return Array.from(monthlyMap.values()).sort((a, b) => a.month.localeCompare(b.month));
  }

  async getExpenseTrend(
    pondId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{ date: string; total: number; categories: Record<string, number> }[]> {
    const expenses = await this.prisma.expense.findMany({
      where: {
        pondId,
        expenseDate: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { expenseDate: 'asc' }
    });

    const dailyMap = new Map<string, { date: string; total: number; categories: Record<string, number> }>();

    expenses.forEach(expense => {
      const dateKey = format(expense.expenseDate, 'yyyy-MM-dd');
      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, { date: dateKey, total: 0, categories: {} });
      }
      const dayData = dailyMap.get(dateKey)!;
      dayData.total += expense.totalAmount;
      const cat = expense.category;
      dayData.categories[cat] = (dayData.categories[cat] || 0) + expense.totalAmount;
    });

    return Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  }

  async getCurrentMonthExpenses(pondId: string): Promise<number> {
    const startDate = startOfMonth(new Date());
    const endDate = endOfMonth(new Date());
    return this.getTotalExpenses(pondId, startDate, endDate);
  }

  async findAutoGeneratedBySource(
    pondId: string,
    sourceModule: string,
    sourceRecordId: string
  ): Promise<Expense | null> {
    return this.prisma.expense.findFirst({
      where: { pondId, sourceModule, sourceRecordId, isAutoGenerated: true }
    });
  }

  async create(data: Prisma.ExpenseCreateInput): Promise<Expense> {
    return this.prisma.expense.create({ data });
  }

  async createMany(data: Prisma.ExpenseCreateManyInput[]): Promise<{ count: number }> {
    return this.prisma.expense.createMany({ data, skipDuplicates: true });
  }

  async update(id: string, data: Prisma.ExpenseUpdateInput): Promise<Expense> {
    return this.prisma.expense.update({ where: { id }, data });
  }

  async delete(id: string): Promise<Expense> {
    return this.prisma.expense.delete({ where: { id } });
  }

  async countByPondId(pondId: string): Promise<number> {
    return this.prisma.expense.count({ where: { pondId } });
  }
}
