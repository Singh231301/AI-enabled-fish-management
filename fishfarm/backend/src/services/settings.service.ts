import { UserSettingsRepository } from '../repositories/user-settings.repository';
import { NotificationPreferenceRepository } from '../repositories/notification-preference.repository';
import { UserInvitationRepository } from '../repositories/user-invitation.repository';
import { UserRepository } from '../repositories/user.repository';
import { AppError } from '../utils/app-error';
import {
  UpdateUserSettingsDTO,
  BulkUpdateNotificationPrefsDTO,
  UpdateProfileDTO,
  ChangePasswordDTO,
  InviteUserDTO,
  ExportDataDTO
} from '../validators/settings.validator';
import * as crypto from 'crypto';

export class SettingsService {
  constructor(
    private userSettingsRepo: UserSettingsRepository,
    private notificationPrefRepo: NotificationPreferenceRepository,
    private userInvitationRepo: UserInvitationRepository,
    private userRepo: UserRepository
  ) {}

  async getUserSettings(userId: string) {
    let settings = await this.userSettingsRepo.findByUserId(userId);
    if (!settings) {
      settings = await this.userSettingsRepo.upsert(userId, {});
    }
    return settings;
  }

  async updateUserSettings(userId: string, data: UpdateUserSettingsDTO) {
    return this.userSettingsRepo.upsert(userId, data);
  }

  async getNotificationPreferences(userId: string) {
    return this.notificationPrefRepo.findByUserId(userId);
  }

  async updateNotificationPreferences(userId: string, dto: BulkUpdateNotificationPrefsDTO) {
    await this.notificationPrefRepo.bulkUpsert(userId, dto.preferences);
    return this.getNotificationPreferences(userId);
  }

  async updateProfile(userId: string, data: UpdateProfileDTO) {
    return this.userRepo.update(userId, { fullName: data.fullName });
  }

  async changePassword(userId: string, data: ChangePasswordDTO) {
    // Note: Assuming userRepo handles hashing internally or we hash it here
    const user = await this.userRepo.findById(userId);
    if (!user) throw new AppError("User not found", 404);
    
    // In a real app, compare hashed currentPassword
    // ...
    // Update new password
    // await this.userRepo.updatePassword(userId, await hash(data.newPassword));
    return { success: true };
  }

  async getTeam(userId: string) {
    const user = await this.userRepo.findById(userId);
    if (user?.role !== 'ADMIN') throw new AppError('Forbidden', 403);
    
    // Using prisma via userRepo would be ideal, but for now we'll fetch via userRepo and userInvitationRepo
    const members = await this.userRepo.findAll();
    const invites = await this.userInvitationRepo.findByInviter(userId);
    return { members, pendingInvitations: invites };
  }

  async inviteUser(inviterId: string, data: InviteUserDTO) {
    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    return this.userInvitationRepo.create({
      invitedBy: inviterId,
      email: data.email,
      role: data.role,
      token,
      expiresAt,
      pondId: data.pondId ?? undefined,
      message: data.message ?? undefined
    });
  }

  async updateUserRole(adminId: string, targetUserId: string, newRole: 'ADMIN' | 'VIEWER' | 'HELPER') {
    if (adminId === targetUserId) {
      throw new AppError('Cannot change your own role', 400);
    }
    const admin = await this.userRepo.findById(adminId);
    if (admin?.role !== 'ADMIN') throw new AppError('Forbidden', 403);
    
    return this.userRepo.update(targetUserId, { role: newRole as any });
  }

  async revokeInvitation(id: string, inviterId: string) {
    const invite = await this.userInvitationRepo.delete(id);
    return invite;
  }

  async exportData(userId: string, dto: ExportDataDTO) {
    // Return a mock URL for now
    return {
      downloadUrl: `/api/v1/settings/export/download?format=${dto.format}&token=${crypto.randomUUID()}`
    };
  }

  async deleteAllData(userId: string) {
    // A real implementation would cascade delete data or soft delete
    return { success: true };
  }

  async deleteAccount(userId: string, reason: string) {
    // In a real app, this would delete or anonymize the user's data
    // await this.userRepo.delete(userId);
    return { success: true };
  }
}
