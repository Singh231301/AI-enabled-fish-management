import { PrismaClient, Prisma, InfrastructureChecklist, InfrastructureStatus } from '@prisma/client';
import { BaseRepository } from './base.repository';
import { InfrastructureStats } from '../types/pond.types';

export class InfrastructureChecklistRepository extends BaseRepository<InfrastructureChecklist> {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  async findById(id: string): Promise<InfrastructureChecklist | null> {
    return this.prisma.infrastructureChecklist.findUnique({ where: { id } });
  }

  async findByPondId(pondId: string): Promise<InfrastructureChecklist[]> {
    return this.prisma.infrastructureChecklist.findMany({
      where: { pondId },
      orderBy: [
        { status: 'asc' },    // NOT_STARTED first, COMPLETED last
        { createdAt: 'asc' }
      ]
    });
  }

  async findByPondIdAndStatus(pondId: string, status: InfrastructureStatus): Promise<InfrastructureChecklist[]> {
    return this.prisma.infrastructureChecklist.findMany({
      where: { pondId, status }
    });
  }

  async create(data: Prisma.InfrastructureChecklistCreateInput | any): Promise<InfrastructureChecklist> {
    return this.prisma.infrastructureChecklist.create({ data });
  }

  async update(id: string, data: Prisma.InfrastructureChecklistUpdateInput | any): Promise<InfrastructureChecklist> {
    return this.prisma.infrastructureChecklist.update({ where: { id }, data });
  }

  async delete(id: string): Promise<InfrastructureChecklist> {
    return this.prisma.infrastructureChecklist.delete({ where: { id } });
  }

  async getCompletionStats(pondId: string): Promise<InfrastructureStats> {
    const counts = await this.prisma.infrastructureChecklist.groupBy({
      by: ['status'],
      where: { pondId },
      _count: { status: true }
    });

    let completed = 0;
    let inProgress = 0;
    let notStarted = 0;

    for (const group of counts) {
      if (group.status === 'COMPLETED') completed = group._count.status;
      if (group.status === 'IN_PROGRESS') inProgress = group._count.status;
      if (group.status === 'NOT_STARTED') notStarted = group._count.status;
    }

    const total = completed + inProgress + notStarted;
    const completionPercent = total > 0 ? (completed / total) * 100 : 0;

    return {
      total,
      completed,
      inProgress,
      notStarted,
      completionPercent
    };
  }

  async bulkCreate(items: Prisma.InfrastructureChecklistCreateManyInput[]): Promise<{ count: number }> {
    return this.prisma.infrastructureChecklist.createMany({ data: items });
  }
}
