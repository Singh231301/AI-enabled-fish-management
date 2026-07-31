import { PrismaClient, Prisma, Sale } from '@prisma/client';
import { BaseRepository } from './base.repository';

export class SaleRepository extends BaseRepository<Sale> {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  async findById(id: string): Promise<Sale | null> {
    return this.prisma.sale.findUnique({ where: { id } });
  }

  async create(data: Prisma.SaleCreateInput): Promise<Sale> {
    return this.prisma.sale.create({ data });
  }

  async update(id: string, data: Prisma.SaleUpdateInput): Promise<Sale> {
    return this.prisma.sale.update({ where: { id }, data });
  }

  async delete(id: string): Promise<Sale> {
    return this.prisma.sale.delete({ where: { id } });
  }

  async findAll(filters?: Partial<Sale>): Promise<Sale[]> {
    return this.prisma.sale.findMany({ where: filters as any });
  }
}
