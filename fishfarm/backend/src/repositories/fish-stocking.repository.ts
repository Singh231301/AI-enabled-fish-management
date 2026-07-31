import { PrismaClient, Prisma, FishStocking } from '@prisma/client';
import { BaseRepository } from './base.repository';

export class FishStockingRepository extends BaseRepository<FishStocking> {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  async findById(id: string): Promise<FishStocking | null> {
    return this.prisma.fishStocking.findUnique({ where: { id } });
  }

  async findByPondId(pondId: string): Promise<FishStocking[]> {
    return this.prisma.fishStocking.findMany({
      where: { pondId },
      orderBy: { stockingDate: 'desc' }
    });
  }

  async findLatestByPondId(pondId: string): Promise<FishStocking | null> {
    return this.prisma.fishStocking.findFirst({
      where: { pondId },
      orderBy: { stockingDate: 'desc' }
    });
  }

  async findByIdAndPondId(id: string, pondId: string): Promise<FishStocking | null> {
    return this.prisma.fishStocking.findFirst({
      where: { id, pondId }
    });
  }

  async create(data: Prisma.FishStockingCreateInput): Promise<FishStocking> {
    return this.prisma.fishStocking.create({ data });
  }

  async update(id: string, data: Prisma.FishStockingUpdateInput): Promise<FishStocking> {
    return this.prisma.fishStocking.update({ where: { id }, data });
  }

  async delete(id: string): Promise<FishStocking> {
    return this.prisma.fishStocking.delete({ where: { id } });
  }

  async getTotalStockedByPondId(pondId: string): Promise<number> {
    const res = await this.prisma.fishStocking.aggregate({
      where: { pondId },
      _sum: { quantity: true }
    });
    return res._sum.quantity ?? 0;
  }

  async getNextBatchNumber(pondId: string): Promise<number> {
    const res = await this.prisma.fishStocking.aggregate({
      where: { pondId },
      _max: { batchNumber: true }
    });
    return (res._max.batchNumber ?? 0) + 1;
  }

  async countByPondId(pondId: string): Promise<number> {
    return this.prisma.fishStocking.count({ where: { pondId } });
  }
}
