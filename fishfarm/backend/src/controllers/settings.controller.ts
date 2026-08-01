import { Request, Response, NextFunction } from 'express';
import { SettingsService } from '../services/settings.service';
import { sendSuccess } from '../utils/response.utils';
import {
  updateUserSettingsSchema,
  bulkUpdateNotificationPrefsSchema,
  updateProfileSchema,
  changePasswordSchema,
  inviteUserSchema,
  exportDataSchema,
  deleteAccountSchema,
  updateUserRoleSchema
} from '../validators/settings.validator';

export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  getUserSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const settings = await this.settingsService.getUserSettings(req.user!.id);
      sendSuccess(res, settings, 'User settings retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  updateUserSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = updateUserSettingsSchema.parse(req.body);
      const settings = await this.settingsService.updateUserSettings(req.user!.id, data);
      sendSuccess(res, settings, 'User settings updated successfully');
    } catch (error) {
      next(error);
    }
  };

  getNotificationPreferences = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const prefs = await this.settingsService.getNotificationPreferences(req.user!.id);
      sendSuccess(res, prefs, 'Notification preferences retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  updateNotificationPreferences = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = bulkUpdateNotificationPrefsSchema.parse(req.body);
      const prefs = await this.settingsService.updateNotificationPreferences(req.user!.id, data);
      sendSuccess(res, prefs, 'Notification preferences updated successfully');
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = updateProfileSchema.parse(req.body);
      const user = await this.settingsService.updateProfile(req.user!.id, data);
      sendSuccess(res, user, 'Profile updated successfully');
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = changePasswordSchema.parse(req.body);
      await this.settingsService.changePassword(req.user!.id, data);
      sendSuccess(res, null, 'Password changed successfully');
    } catch (error) {
      next(error);
    }
  };

  getTeam = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const team = await this.settingsService.getTeam(req.user!.id);
      sendSuccess(res, team, 'Team retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  inviteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = inviteUserSchema.parse(req.body);
      const invite = await this.settingsService.inviteUser(req.user!.id, data);
      sendSuccess(res, invite, 'User invited successfully');
    } catch (error) {
      next(error);
    }
  };

  updateUserRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = updateUserRoleSchema.parse(req.body);
      await this.settingsService.updateUserRole(req.user!.id, req.params.id, data.role);
      sendSuccess(res, null, 'User role updated successfully');
    } catch (error) {
      next(error);
    }
  };

  revokeInvitation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.settingsService.revokeInvitation(req.params.id, req.user!.id);
      sendSuccess(res, null, 'Invitation revoked successfully');
    } catch (error) {
      next(error);
    }
  };

  exportData = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = exportDataSchema.parse(req.body);
      const result = await this.settingsService.exportData(req.user!.id, data);
      sendSuccess(res, result, 'Data export initiated');
    } catch (error) {
      next(error);
    }
  };

  deleteAllData = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.settingsService.deleteAllData(req.user!.id);
      sendSuccess(res, null, 'All data deleted successfully');
    } catch (error) {
      next(error);
    }
  };

  deleteAccount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = deleteAccountSchema.parse(req.body);
      await this.settingsService.deleteAccount(req.user!.id, data.reason);
      sendSuccess(res, null, 'Account scheduled for deletion');
    } catch (error) {
      next(error);
    }
  };
}
