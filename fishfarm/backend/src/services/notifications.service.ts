import { NotificationRepository } from '../repositories/notification.repository';
import { NotificationType, NotificationPriority } from '@prisma/client';

export interface CreateNotificationDTO {
  userId: string;
  pondId?: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  actionUrl?: string;
}

export class NotificationService {
  constructor(private notificationRepository: NotificationRepository) {}

  async create(data: CreateNotificationDTO) {
    const { userId, pondId, ...rest } = data;
    const createData: any = {
      ...rest,
      user: { connect: { id: userId } }
    };
    if (pondId) {
      createData.pond = { connect: { id: pondId } };
    }
    return this.notificationRepository.create(createData);
  }

  async findRecentDuplicate(userId: string, pondId: string, type: NotificationType, hoursBack: number = 24) {
    const since = new Date(Date.now() - hoursBack * 60 * 60 * 1000);
    // Note: Assuming we add this method to NotificationRepository
    return this.notificationRepository.findRecentByTypeAndPond(userId, pondId, type, since);
  }

  async checkAndCreate(dto: CreateNotificationDTO) {
    if (dto.pondId) {
      const duplicate = await this.findRecentDuplicate(dto.userId, dto.pondId, dto.type);
      if (duplicate) {
        return; // Skip creating duplicate alert
      }
    }
    await this.create(dto);
  }
}
