import { Router } from 'express';
import { SettingsController } from '../controllers/settings.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

export function createSettingsRouter(settingsController: SettingsController): Router {
  const router = Router();

  router.use(authMiddleware);

  // User Settings
  router.get('/user', settingsController.getUserSettings);
  router.put('/user', settingsController.updateUserSettings);

  // Notification Preferences
  router.get('/notifications', settingsController.getNotificationPreferences);
  router.put('/notifications', settingsController.updateNotificationPreferences);

  // Profile and Security
  router.put('/profile', settingsController.updateProfile);
  router.post('/change-password', settingsController.changePassword);

  // User Management (Team)
  router.get('/team', settingsController.getTeam);
  router.post('/team/invite', settingsController.inviteUser);
  router.put('/team/:id/role', settingsController.updateUserRole);
  router.delete('/team/invitations/:id', settingsController.revokeInvitation);

  // Data Management
  router.post('/data/export', settingsController.exportData);
  router.delete('/data/all', settingsController.deleteAllData);
  router.delete('/account', settingsController.deleteAccount);

  return router;
}
