import { Router } from 'express';
import { authController } from '../container';
import { authMiddleware } from '../middlewares/auth.middleware';

export const authRouter = Router();

authRouter.post('/register', authController.register);
authRouter.post('/login', authController.login);
authRouter.get('/me', authMiddleware, authController.getMe);
authRouter.put('/me', authMiddleware, authController.updateProfile);
authRouter.post('/change-password', authMiddleware, authController.changePassword);
