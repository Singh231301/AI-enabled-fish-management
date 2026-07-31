export type NotificationType =
  | 'TASK_DUE' | 'TASK_OVERDUE' | 'AI_ALERT' | 'LOW_STOCK'
  | 'FEEDING_REMINDER' | 'MORTALITY_ALERT' | 'WATER_QUALITY_ALERT'
  | 'FINANCIAL_ALERT' | 'WEATHER_ALERT' | 'GROWTH_MILESTONE' | 'INFO';

export type NotificationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Notification {
  id: string;
  userId: string;
  pondId?: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  isRead: boolean;
  isDismissed: boolean;
  actionUrl?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}
