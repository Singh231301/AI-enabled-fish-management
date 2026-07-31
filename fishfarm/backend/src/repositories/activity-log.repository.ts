import { PrismaClient, Prisma, ActivityLog } from '@prisma/client';
import { BaseRepository } from './base.repository';

export class ActivityLogRepository extends BaseRepository<ActivityLog> {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  async findById(id: string): Promise<ActivityLog | null> {
    return this.prisma.activityLog.findUnique({ where: { id } });
  }

  async create(data: Prisma.ActivityLogCreateInput): Promise<ActivityLog> {
    return this.prisma.activityLog.create({ data });
  }

  async update(id: string, data: Prisma.ActivityLogUpdateInput): Promise<ActivityLog> {
    return this.prisma.activityLog.update({ where: { id }, data });
  }

  async delete(id: string): Promise<ActivityLog> {
    return this.prisma.activityLog.delete({ where: { id } });
  }

  async findAll(filters?: Partial<ActivityLog>): Promise<ActivityLog[]> {
    return this.prisma.activityLog.findMany({ where: filters as any });
  }
}
