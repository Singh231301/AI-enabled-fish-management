import { PrismaClient, Prisma, FishGrowthSample } from '@prisma/client';
import { BaseRepository } from './base.repository';

export class FishGrowthSampleRepository extends BaseRepository<FishGrowthSample> {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  async findById(id: string): Promise<FishGrowthSample | null> {
    return this.prisma.fishGrowthSample.findUnique({ where: { id } });
  }

  async findByPondId(
    pondId: string,
    filters: { startDate?: Date; endDate?: Date; skip: number; take: number }
  ): Promise<{ records: FishGrowthSample[]; total: number }> {
    const where: Prisma.FishGrowthSampleWhereInput = { pondId };
    
    if (filters.startDate) {
      where.sampleDate = { gte: filters.startDate };
    }
    if (filters.endDate) {
      where.sampleDate = { ...(where.sampleDate as Prisma.DateTimeFilter), lte: filters.endDate };
    }

    const [records, total] = await Promise.all([
      this.prisma.fishGrowthSample.findMany({
        where,
        orderBy: { sampleDate: 'desc' },
        skip: filters.skip,
        take: filters.take
      }),
      this.prisma.fishGrowthSample.count({ where })
    ]);

    return { records, total };
  }

  async findAllByPondId(pondId: string): Promise<FishGrowthSample[]> {
    return this.prisma.fishGrowthSample.findMany({
      where: { pondId },
      orderBy: { sampleDate: 'asc' }
    });
  }

  async findLatestByPondId(pondId: string): Promise<FishGrowthSample | null> {
    return this.prisma.fishGrowthSample.findFirst({
      where: { pondId },
      orderBy: { sampleDate: 'desc' }
    });
  }

  async findByIdAndPondId(id: string, pondId: string): Promise<FishGrowthSample | null> {
    return this.prisma.fishGrowthSample.findFirst({ where: { id, pondId } });
  }

  async create(data: Prisma.FishGrowthSampleCreateInput): Promise<FishGrowthSample> {
    return this.prisma.fishGrowthSample.create({ data });
  }

  async update(id: string, data: Prisma.FishGrowthSampleUpdateInput): Promise<FishGrowthSample> {
    return this.prisma.fishGrowthSample.update({ where: { id }, data });
  }

  async delete(id: string): Promise<FishGrowthSample> {
    return this.prisma.fishGrowthSample.delete({ where: { id } });
  }

  async countByPondId(pondId: string): Promise<number> {
    return this.prisma.fishGrowthSample.count({ where: { pondId } });
  }
}
