import { PrismaClient, Prisma, MortalityLog } from '@prisma/client';
import { BaseRepository } from './base.repository';
import { startOfDay, endOfDay, subDays, subMonths } from 'date-fns';

export class MortalityLogRepository extends BaseRepository<MortalityLog> {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  async findById(id: string): Promise<MortalityLog | null> {
    return this.prisma.mortalityLog.findUnique({ where: { id } });
  }

  async findByPondId(
    pondId: string,
    filters: {
      startDate?: Date;
      endDate?: Date;
      reason?: string;
      skip: number;
      take: number;
    }
  ): Promise<{ records: MortalityLog[]; total: number }> {
    const where: Prisma.MortalityLogWhereInput = { pondId };
    
    if (filters.startDate) {
      where.logDate = { gte: filters.startDate };
    }
    if (filters.endDate) {
      where.logDate = { ...(where.logDate as Prisma.DateTimeFilter), lte: filters.endDate };
    }
    if (filters.reason) {
      where.probableReason = filters.reason as any;
    }

    const [records, total] = await Promise.all([
      this.prisma.mortalityLog.findMany({
        where,
        orderBy: { logDate: 'desc' },
        skip: filters.skip,
        take: filters.take
      }),
      this.prisma.mortalityLog.count({ where })
    ]);
    
    return { records, total };
  }

  async findByPondIdAndDate(pondId: string, date: Date): Promise<MortalityLog | null> {
    return this.prisma.mortalityLog.findFirst({
      where: {
        pondId,
        logDate: {
          gte: startOfDay(date),
          lte: endOfDay(date)
        }
      }
    });
  }

  async getTotalMortality(pondId: string): Promise<number> {
    const res = await this.prisma.mortalityLog.aggregate({
      where: { pondId },
      _sum: { deadCount: true }
    });
    return res._sum.deadCount ?? 0;
  }

  async getTodayMortality(pondId: string): Promise<number> {
    const today = new Date();
    const res = await this.prisma.mortalityLog.aggregate({
      where: {
        pondId,
        logDate: {
          gte: startOfDay(today),
          lte: endOfDay(today)
        }
      },
      _sum: { deadCount: true }
    });
    return res._sum.deadCount ?? 0;
  }

  async getWeeklyTrend(pondId: string): Promise<MortalityLog[]> {
    return this.prisma.mortalityLog.findMany({
      where: {
        pondId,
        logDate: { gte: subDays(new Date(), 30) }
      },
      orderBy: { logDate: 'asc' }
    });
  }

  async getMonthlyTrend(pondId: string): Promise<MortalityLog[]> {
    return this.prisma.mortalityLog.findMany({
      where: {
        pondId,
        logDate: { gte: subMonths(new Date(), 6) }
      },
      orderBy: { logDate: 'asc' }
    });
  }

  async getMortalityByReason(pondId: string): Promise<any[]> {
    return (this.prisma.mortalityLog.groupBy as any)({
      by: ['probableReason'],
      where: { pondId },
      _sum: { deadCount: true },
      _count: { id: true }
    });
  }

  async create(data: Prisma.MortalityLogCreateInput): Promise<MortalityLog> {
    return this.prisma.mortalityLog.create({ data });
  }

  async update(id: string, data: Prisma.MortalityLogUpdateInput): Promise<MortalityLog> {
    return this.prisma.mortalityLog.update({ where: { id }, data });
  }

  async delete(id: string): Promise<MortalityLog> {
    return this.prisma.mortalityLog.delete({ where: { id } });
  }
}
