import { PrismaClient, Prisma, MarketPrice } from '@prisma/client';
import { BaseRepository } from './base.repository';
import { subMonths } from 'date-fns';

export class MarketPriceRepository extends BaseRepository<MarketPrice> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'marketPrice');
  }

  async findByPondId(pondId: string): Promise<MarketPrice[]> {
    return this.prisma.marketPrice.findMany({
      where: { pondId },
      orderBy: { priceDate: 'desc' }
    });
  }

  async findLatestBySpecies(
    pondId: string,
    species: string
  ): Promise<MarketPrice | null> {
    return this.prisma.marketPrice.findFirst({
      where: { pondId, species },
      orderBy: { priceDate: 'desc' }
    });
  }

  async getPriceTrend(
    pondId: string,
    species: string,
    months: number
  ): Promise<MarketPrice[]> {
    return this.prisma.marketPrice.findMany({
      where: {
        pondId,
        species,
        priceDate: { gte: subMonths(new Date(), months) }
      },
      orderBy: { priceDate: 'asc' }
    });
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
}
