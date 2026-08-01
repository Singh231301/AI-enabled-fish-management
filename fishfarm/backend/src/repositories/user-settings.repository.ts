import { PrismaClient, UserSettings, Prisma } from '@prisma/client';

export class UserSettingsRepository {
  constructor(private prisma: PrismaClient) {}

  async findByUserId(userId: string): Promise<UserSettings | null> {
    return this.prisma.userSettings.findUnique({
      where: { userId }
    });
  }

  async upsert(userId: string, data: Partial<Omit<UserSettings, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>): Promise<UserSettings> {
    const defaultData = {
      defaultPondId: null,
      language: 'en',
      dateFormat: 'dd MMM yyyy',
      weightUnit: 'grams',
      currency: 'INR',
      theme: 'dark',
      dashboardRefreshMinutes: 5,
      showWeatherWidget: true,
      showAIBriefing: true,
      defaultFeedType: 'FLOATING_PELLET',
      feedingRemindersEnabled: true,
      emailNotificationsEnabled: false,
      inAppNotificationsEnabled: true,
      notificationSound: false,
      shareAnonymousData: false,
      ...data
    };

    return this.prisma.userSettings.upsert({
      where: { userId },
      create: {
        userId,
        ...defaultData
      },
      update: data
    });
  }
}
