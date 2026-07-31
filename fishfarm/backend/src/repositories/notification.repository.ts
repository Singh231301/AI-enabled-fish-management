import { PrismaClient, Prisma, Notification, NotificationType } from '@prisma/client';
import { BaseRepository } from './base.repository';

export class NotificationRepository extends BaseRepository<Notification> {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  async findRecentByTypeAndPond(userId: string, pondId: string, type: NotificationType, since: Date): Promise<Notification | null> {
    return this.prisma.notification.findFirst({
      where: { userId, pondId, type, createdAt: { gte: since } },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findById(id: string): Promise<Notification | null> {
    return this.prisma.notification.findUnique({ where: { id } });
  }

  async create(data: Prisma.NotificationCreateInput): Promise<Notification> {
    return this.prisma.notification.create({ data });
  }

  async update(id: string, data: Prisma.NotificationUpdateInput): Promise<Notification> {
    return this.prisma.notification.update({ where: { id }, data });
  }

  async delete(id: string): Promise<Notification> {
    return this.prisma.notification.delete({ where: { id } });
  }

  async findAll(filters?: Partial<Notification>): Promise<Notification[]> {
    return this.prisma.notification.findMany({ where: filters as any });
  }
}
