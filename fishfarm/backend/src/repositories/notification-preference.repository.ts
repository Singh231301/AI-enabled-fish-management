import { PrismaClient, NotificationPreference } from '@prisma/client';

export class NotificationPreferenceRepository {
  constructor(private prisma: PrismaClient) {}

  async findByUserId(userId: string): Promise<NotificationPreference[]> {
    return this.prisma.notificationPreference.findMany({
      where: { userId }
    });
  }

  async findByUserAndType(userId: string, notificationType: string): Promise<NotificationPreference | null> {
    return this.prisma.notificationPreference.findUnique({
      where: {
        userId_notificationType: {
          userId,
          notificationType
        }
      }
    });
  }

  async upsert(userId: string, notificationType: string, data: { inAppEnabled: boolean, emailEnabled: boolean, minimumPriority: string }): Promise<NotificationPreference> {
    return this.prisma.notificationPreference.upsert({
      where: {
        userId_notificationType: {
          userId,
          notificationType
        }
      },
      create: {
        userId,
        notificationType,
        ...data
      },
      update: data
    });
  }

  async bulkUpsert(userId: string, preferences: Array<{ notificationType: string, inAppEnabled: boolean, emailEnabled: boolean, minimumPriority: string }>): Promise<void> {
    // Perform bulk update in a transaction
    await this.prisma.$transaction(
      preferences.map(pref =>
        this.prisma.notificationPreference.upsert({
          where: {
            userId_notificationType: {
              userId,
              notificationType: pref.notificationType
            }
          },
          create: {
            userId,
            ...pref
          },
          update: {
            inAppEnabled: pref.inAppEnabled,
            emailEnabled: pref.emailEnabled,
            minimumPriority: pref.minimumPriority
          }
        })
      )
    );
  }
}
