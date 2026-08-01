import { PrismaClient, Prisma, WaterTreatmentLog } from '@prisma/client';
import { BaseRepository } from './base.repository';
import { ChemicalUsageSummary } from '../types/water.types';
import { addDays } from 'date-fns';

export class WaterTreatmentLogRepository extends BaseRepository<WaterTreatmentLog> {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  async findByPondId(
    pondId: string,
    filters: { skip: number; take: number; chemicalType?: string }
  ): Promise<{ records: WaterTreatmentLog[]; total: number }> {
    const where: Prisma.WaterTreatmentLogWhereInput = { pondId };

    if (filters.chemicalType) {
      where.chemicalType = filters.chemicalType as any;
    }

    const [records, total] = await Promise.all([
      this.prisma.waterTreatmentLog.findMany({
        where,
        skip: filters.skip,
        take: filters.take,
        orderBy: { treatmentDate: 'desc' },
      }),
      this.prisma.waterTreatmentLog.count({ where }),
    ]);

    return { records, total };
  }

  async findAllByPondId(pondId: string): Promise<WaterTreatmentLog[]> {
    return this.prisma.waterTreatmentLog.findMany({
      where: { pondId },
      orderBy: { treatmentDate: 'desc' },
    });
  }

  async findLatestByPondId(pondId: string): Promise<WaterTreatmentLog | null> {
    return this.prisma.waterTreatmentLog.findFirst({
      where: { pondId },
      orderBy: { treatmentDate: 'desc' },
    });
  }

  async findLatestLimeApplication(pondId: string): Promise<WaterTreatmentLog | null> {
    return this.prisma.waterTreatmentLog.findFirst({
      where: {
        pondId,
        chemicalType: 'AGRICULTURAL_LIME',
      },
      orderBy: { treatmentDate: 'desc' },
    });
  }

  async findUpcomingTreatments(pondId: string): Promise<WaterTreatmentLog[]> {
    return this.prisma.waterTreatmentLog.findMany({
      where: {
        pondId,
        nextTreatmentDate: {
          gte: new Date(),
          lte: addDays(new Date(), 7),
        },
      },
      orderBy: { nextTreatmentDate: 'asc' },
    });
  }

  async getTotalLimeUsedKg(pondId: string): Promise<number> {
    const result = await this.prisma.waterTreatmentLog.aggregate({
      where: {
        pondId,
        chemicalType: 'AGRICULTURAL_LIME',
      },
      _sum: { quantityKg: true },
    });
    return result._sum.quantityKg ?? 0;
  }

  async getChemicalUsageSummary(pondId: string): Promise<ChemicalUsageSummary[]> {
    const groupBy = await this.prisma.waterTreatmentLog.groupBy({
      by: ['chemicalType', 'chemicalName'],
      where: { pondId },
      _sum: { quantityKg: true },
      _count: { id: true },
    });

    return groupBy.map((item) => ({
      chemicalType: item.chemicalType as string,
      chemicalName: item.chemicalName,
      totalKg: item._sum.quantityKg ?? 0,
      applicationCount: item._count.id,
    }));
  }

  async findByIdAndPondId(id: string, pondId: string): Promise<WaterTreatmentLog | null> {
    return this.prisma.waterTreatmentLog.findFirst({
      where: { id, pondId },
    });
  }

  async create(data: Prisma.WaterTreatmentLogCreateInput): Promise<WaterTreatmentLog> {
    return this.prisma.waterTreatmentLog.create({ data });
  }

  async update(id: string, data: Prisma.WaterTreatmentLogUpdateInput): Promise<WaterTreatmentLog> {
    return this.prisma.waterTreatmentLog.update({ where: { id }, data });
  }

  async delete(id: string): Promise<WaterTreatmentLog> {
    return this.prisma.waterTreatmentLog.delete({ where: { id } });
  }
}
