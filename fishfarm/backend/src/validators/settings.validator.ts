import { z } from 'zod';

export const updateUserSettingsSchema = z.object({
  defaultPondId: z.string().uuid().optional().nullable(),

  language: z.enum(['en', 'hi', 'hinglish']).default('en'),

  dateFormat: z.enum([
    'dd MMM yyyy',
    'dd/MM/yyyy',
    'MM/dd/yyyy',
    'yyyy-MM-dd'
  ]).default('dd MMM yyyy'),

  weightUnit: z.enum(['grams', 'kilograms']).default('grams'),

  currency: z.string().length(3, "Currency must be 3-letter code").default('INR'),

  theme: z.enum(['dark', 'light', 'system']).default('dark'),

  dashboardRefreshMinutes: z.number().int().min(1).max(60).default(5),

  showWeatherWidget: z.boolean().default(true),
  showAIBriefing: z.boolean().default(true),

  defaultFeedType: z.enum([
    'FLOATING_PELLET',
    'SINKING_PELLET',
    'MIXED',
    'POWDER',
    'NATURAL',
    'OTHER'
  ]).default('FLOATING_PELLET'),

  feedingRemindersEnabled: z.boolean().default(true),
  emailNotificationsEnabled: z.boolean().default(false),
  inAppNotificationsEnabled: z.boolean().default(true),
  notificationSound: z.boolean().default(false),
  shareAnonymousData: z.boolean().default(false),
});

export const updateNotificationPreferenceSchema = z.object({
  notificationType: z.enum([
    'TASK_DUE',
    'TASK_OVERDUE',
    'AI_ALERT',
    'LOW_STOCK',
    'FEEDING_REMINDER',
    'MORTALITY_ALERT',
    'WATER_QUALITY_ALERT',
    'FINANCIAL_ALERT',
    'WEATHER_ALERT',
    'GROWTH_MILESTONE',
    'INFO'
  ]),
  inAppEnabled: z.boolean(),
  emailEnabled: z.boolean(),
  minimumPriority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('LOW'),
});

export const bulkUpdateNotificationPrefsSchema = z.object({
  preferences: z.array(updateNotificationPreferenceSchema).min(1).max(20)
});

export const updateProfileSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters").max(100).trim(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password required"),
  newPassword: z.string()
    .min(8, "Minimum 8 characters")
    .regex(/[A-Z]/, "Must contain uppercase letter")
    .regex(/[0-9]/, "Must contain a number"),
  confirmPassword: z.string().min(1, "Please confirm your new password"),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

export const inviteUserSchema = z.object({
  email: z.string().email("Valid email required"),
  role: z.enum(['ADMIN', 'VIEWER', 'HELPER']).default('VIEWER'),
  pondId: z.string().uuid("Valid pond ID").optional().nullable(),
  message: z.string().max(300).optional().nullable().transform(val => val === '' ? null : val),
});

export const updateUserRoleSchema = z.object({
  role: z.enum(['ADMIN', 'VIEWER', 'HELPER'])
});

export const exportDataSchema = z.object({
  includeModules: z.array(
    z.enum([
      'profile', 'ponds', 'fish', 'feeding',
      'water', 'financials', 'inventory', 'tasks',
      'ai_history', 'activity_log'
    ])
  ).default([
    'profile', 'ponds', 'fish', 'feeding',
    'water', 'financials', 'inventory', 'tasks'
  ]),
  format: z.enum(['json', 'csv']).default('json'),
});

export const deleteAccountSchema = z.object({
  confirmText: z.string().refine(val => val === 'DELETE MY ACCOUNT', {
    message: "Type exactly: DELETE MY ACCOUNT"
  }),
  reason: z.string().min(10, "Please provide a reason (min 10 characters)").max(500),
});

export type UpdateUserSettingsDTO = z.infer<typeof updateUserSettingsSchema>;
export type UpdateNotificationPreferenceDTO = z.infer<typeof updateNotificationPreferenceSchema>;
export type BulkUpdateNotificationPrefsDTO = z.infer<typeof bulkUpdateNotificationPrefsSchema>;
export type UpdateProfileDTO = z.infer<typeof updateProfileSchema>;
export type ChangePasswordDTO = z.infer<typeof changePasswordSchema>;
export type InviteUserDTO = z.infer<typeof inviteUserSchema>;
export type UpdateUserRoleDTO = z.infer<typeof updateUserRoleSchema>;
export type ExportDataDTO = z.infer<typeof exportDataSchema>;
export type DeleteAccountDTO = z.infer<typeof deleteAccountSchema>;
