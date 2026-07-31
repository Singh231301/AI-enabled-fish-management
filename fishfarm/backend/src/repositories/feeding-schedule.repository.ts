import { PrismaClient, FeedingSchedule, Prisma, Pond, User } from '@prisma/client';
import { BaseRepository } from './base.repository';

export type FeedingScheduleWithPond = FeedingSchedule & {
  pond: Pond;
  user: { id: string; email: string; fullName: string };
};

export class FeedingScheduleRepository extends BaseRepository<FeedingSchedule> {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  async findByPondId(pondId: string): Promise<FeedingSchedule | null> {
    return this.prisma.feedingSchedule.findUnique({ where: { pondId } });
  }

  async findByUserId(userId: string): Promise<FeedingSchedule[]> {
    return this.prisma.feedingSchedule.findMany({
      where: { userId, isActive: true },
      include: { pond: true }
    });
  }

  async upsert(pondId: string, userId: string, data: Prisma.FeedingScheduleCreateInput): Promise<FeedingSchedule> {
    const safeData: any = { ...data };
    delete safeData.pondId; // Remove if exists to avoid conflict
    delete safeData.userId; // Remove if exists to avoid conflict

    return this.prisma.feedingSchedule.upsert({
      where: { pondId },
      create: { ...safeData, pondId, userId },
      update: { ...safeData, updatedAt: new Date() }
    });
  }

  async deactivate(pondId: string): Promise<FeedingSchedule> {
    return this.prisma.feedingSchedule.update({
      where: { pondId },
      data: { isActive: false, reminderEnabled: false }
    });
  }

  async findAllActiveWithReminders(): Promise<FeedingScheduleWithPond[]> {
    return this.prisma.feedingSchedule.findMany({
      where: { isActive: true, reminderEnabled: true },
      include: {
        pond: true,
        user: { select: { id: true, email: true, fullName: true } }
      }
    });
  }
}
