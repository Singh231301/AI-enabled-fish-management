import axiosInstance from '../axios';
import { ApiResponse } from '../../types/api.types';
import {
  UserSettings,
  UpdateUserSettingsDTO,
  NotificationPreference,
  BulkUpdateNotificationPrefsDTO,
  UserInvitation,
  InviteUserDTO,
  UpdateProfileDTO,
  ChangePasswordDTO,
  ExportDataDTO
} from '../../types/settings.types';

export const settingsApi = {
  // User Settings
  getUserSettings: async (): Promise<ApiResponse<UserSettings>> => {
    const response = await axiosInstance.get('/settings/user');
    return response.data;
  },

  updateUserSettings: async (data: UpdateUserSettingsDTO): Promise<ApiResponse<UserSettings>> => {
    const response = await axiosInstance.put('/settings/user', data);
    return response.data;
  },

  // Notification Preferences
  getNotificationPreferences: async (): Promise<ApiResponse<NotificationPreference[]>> => {
    const response = await axiosInstance.get('/settings/notifications');
    return response.data;
  },

  updateNotificationPreferences: async (data: BulkUpdateNotificationPrefsDTO): Promise<ApiResponse<NotificationPreference[]>> => {
    const response = await axiosInstance.put('/settings/notifications', data);
    return response.data;
  },

  // Profile & Security
  updateProfile: async (data: UpdateProfileDTO): Promise<ApiResponse<any>> => {
    const response = await axiosInstance.put('/settings/profile', data);
    return response.data;
  },

  changePassword: async (data: ChangePasswordDTO): Promise<ApiResponse<any>> => {
    const response = await axiosInstance.put('/settings/password', data);
    return response.data;
  },

  // Invitations
  getInvitations: async (): Promise<ApiResponse<UserInvitation[]>> => {
    const response = await axiosInstance.get('/settings/invitations');
    return response.data;
  },

  inviteUser: async (data: InviteUserDTO): Promise<ApiResponse<UserInvitation>> => {
    const response = await axiosInstance.post('/settings/invitations', data);
    return response.data;
  },

  revokeInvitation: async (id: string): Promise<ApiResponse<any>> => {
    const response = await axiosInstance.delete(`/settings/invitations/${id}`);
    return response.data;
  },

  // Data Management
  exportData: async (data: ExportDataDTO): Promise<ApiResponse<{ downloadUrl: string }>> => {
    const response = await axiosInstance.post('/settings/export', data);
    return response.data;
  },

  deleteAccount: async (data: { reason: string; confirmText: string }): Promise<ApiResponse<any>> => {
    const response = await axiosInstance.post('/settings/delete-account', data);
    return response.data;
  }
};
