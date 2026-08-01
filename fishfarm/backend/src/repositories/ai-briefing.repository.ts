import { PrismaClient, Prisma, AiBriefing } from '@prisma/client';
import { BaseRepository } from './base.repository';
import { startOfDay, endOfDay, subDays } from 'date-fns';

export class AiBriefingRepository extends BaseRepository<AiBriefing> {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  async findById(id: string): Promise<AiBriefing | null> {
    return this.prisma.aiBriefing.findUnique({ where: { id } });
  }

  async findTodaysByPondId(pondId: string, briefingType: string): Promise<AiBriefing | null> {
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());
    return this.prisma.aiBriefing.findFirst({
      where: {
        pondId,
        briefingType: briefingType as any,
        briefingDate: { gte: todayStart, lte: todayEnd }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findLatestByPondId(pondId: string, briefingType?: string): Promise<AiBriefing | null> {
    return this.prisma.aiBriefing.findFirst({
      where: {
        pondId,
        ...(briefingType ? { briefingType: briefingType as any } : {})
      },
      orderBy: { briefingDate: 'desc' }
    });
  }

  async findByPondId(pondId: string, limit: number): Promise<AiBriefing[]> {
    return this.prisma.aiBriefing.findMany({
      where: { pondId },
      orderBy: { briefingDate: 'desc' },
      take: limit
    });
  }

  async findWeeklyByPondId(pondId: string): Promise<AiBriefing | null> {
    const weekAgo = startOfDay(subDays(new Date(), 7));
    return this.prisma.aiBriefing.findFirst({
      where: {
        pondId,
        briefingType: 'WEEKLY',
        briefingDate: { gte: weekAgo }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async create(data: Prisma.AiBriefingCreateInput): Promise<AiBriefing> {
    return this.prisma.aiBriefing.create({ data });
  }

  async update(id: string, data: Prisma.AiBriefingUpdateInput): Promise<AiBriefing> {
    return this.prisma.aiBriefing.update({ where: { id }, data });
  }

  async delete(id: string): Promise<AiBriefing> {
    return this.prisma.aiBriefing.delete({ where: { id } });
  }

  async findAll(filters?: Partial<AiBriefing>): Promise<AiBriefing[]> {
    return this.prisma.aiBriefing.findMany({ where: filters as any });
  }
}
