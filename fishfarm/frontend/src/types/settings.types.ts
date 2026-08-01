export interface UserSettings {
  id: string;
  userId: string;
  defaultPondId: string | null;
  language: 'en' | 'hi' | 'hinglish';
  dateFormat: string;
  weightUnit: 'grams' | 'kilograms';
  currency: string;
  theme: 'dark' | 'light' | 'system';
  dashboardRefreshMinutes: number;
  showWeatherWidget: boolean;
  showAIBriefing: boolean;
  defaultFeedType: string;
  feedingRemindersEnabled: boolean;
  emailNotificationsEnabled: boolean;
  inAppNotificationsEnabled: boolean;
  notificationSound: boolean;
  shareAnonymousData: boolean;
  createdAt: string;
  updatedAt: string;
}

export type UpdateUserSettingsDTO = Partial<Omit<UserSettings, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>;

export interface NotificationPreference {
  id: string;
  userId: string;
  notificationType: string;
  inAppEnabled: boolean;
  emailEnabled: boolean;
  minimumPriority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

export interface BulkUpdateNotificationPrefsDTO {
  preferences: Array<{
    notificationType: string;
    inAppEnabled: boolean;
    emailEnabled: boolean;
    minimumPriority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  }>;
}

export interface UserInvitation {
  id: string;
  invitedBy: string;
  email: string;
  role: 'ADMIN' | 'VIEWER' | 'HELPER';
  token: string;
  isAccepted: boolean;
  expiresAt: string;
  acceptedAt: string | null;
  pondId: string | null;
  message: string | null;
  createdAt: string;
  pond?: {
    id: string;
    name: string;
  };
}

export interface InviteUserDTO {
  email: string;
  role: 'ADMIN' | 'VIEWER' | 'HELPER';
  pondId?: string | null;
  message?: string | null;
}

export interface UpdateProfileDTO {
  fullName: string;
}

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ExportDataDTO {
  includeModules: string[];
  format: 'json' | 'csv';
}
