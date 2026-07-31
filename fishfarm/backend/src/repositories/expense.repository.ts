import { PrismaClient, Prisma, Expense } from '@prisma/client';
import { BaseRepository } from './base.repository';

export class ExpenseRepository extends BaseRepository<Expense> {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  async findById(id: string): Promise<Expense | null> {
    return this.prisma.expense.findUnique({ where: { id } });
  }

  async create(data: Prisma.ExpenseCreateInput): Promise<Expense> {
    return this.prisma.expense.create({ data });
  }

  async update(id: string, data: Prisma.ExpenseUpdateInput): Promise<Expense> {
    return this.prisma.expense.update({ where: { id }, data });
  }

  async delete(id: string): Promise<Expense> {
    return this.prisma.expense.delete({ where: { id } });
  }

  async findAll(filters?: Partial<Expense>): Promise<Expense[]> {
    return this.prisma.expense.findMany({ where: filters as any });
  }
}
