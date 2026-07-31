import { PrismaClient, Budget, ExpenseCategory } from '@prisma/client';
import { BaseRepository } from './base.repository';

export class BudgetRepository extends BaseRepository<Budget> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'budget');
  }

  async findByPondIdAndMonth(
    pondId: string,
    monthYear: string
  ): Promise<Budget[]> {
    return this.prisma.budget.findMany({
      where: { pondId, monthYear }
    });
  }

  async upsert(
    pondId: string,
    userId: string,
    monthYear: string,
    category: ExpenseCategory,
    amount: number
  ): Promise<Budget> {
    return this.prisma.budget.upsert({
      where: {
        pondId_monthYear_category: { pondId, monthYear, category }
      },
      create: {
        pondId,
        userId,
        monthYear,
        category: category as ExpenseCategory,
        budgetAmount: amount
      },
      update: { budgetAmount: amount }
    });
  }

  async findOrCreateMonthlyBudget(
    pondId: string,
    userId: string,
    monthYear: string
  ): Promise<Budget[]> {
    const existing = await this.findByPondIdAndMonth(pondId, monthYear);
    if (existing.length > 0) return existing;

    const defaultCategories: ExpenseCategory[] = [
      'FINGERLINGS', 'FEED', 'CHEMICALS_LIME', 'EQUIPMENT',
      'LABOR', 'FENCING_INFRASTRUCTURE', 'TRANSPORT', 'MISCELLANEOUS'
    ];

    await this.prisma.budget.createMany({
      data: defaultCategories.map(cat => ({
        pondId,
        userId,
        monthYear,
        category: cat,
        budgetAmount: 0
      }))
    });

    return this.findByPondIdAndMonth(pondId, monthYear);
  }
}
