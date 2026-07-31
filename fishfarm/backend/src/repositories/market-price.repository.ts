import { PrismaClient, Prisma, MarketPrice } from '@prisma/client';
import { BaseRepository } from './base.repository';

export class MarketPriceRepository extends BaseRepository<MarketPrice> {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  async findById(id: string): Promise<MarketPrice | null> {
    return this.prisma.marketPrice.findUnique({ where: { id } });
  }

  async create(data: Prisma.MarketPriceCreateInput): Promise<MarketPrice> {
    return this.prisma.marketPrice.create({ data });
  }

  async update(id: string, data: Prisma.MarketPriceUpdateInput): Promise<MarketPrice> {
    return this.prisma.marketPrice.update({ where: { id }, data });
  }

  async delete(id: string): Promise<MarketPrice> {
    return this.prisma.marketPrice.delete({ where: { id } });
  }

  async findAll(filters?: Partial<MarketPrice>): Promise<MarketPrice[]> {
    return this.prisma.marketPrice.findMany({ where: filters as any });
  }
}
