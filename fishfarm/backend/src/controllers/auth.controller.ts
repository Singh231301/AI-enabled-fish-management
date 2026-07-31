import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { registerSchema, loginSchema, updateProfileSchema, changePasswordSchema } from '../validators/auth.validator';
import { sendSuccess } from '../utils/response.utils';

export class AuthController {
  constructor(private authService: AuthService) {}

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = registerSchema.parse(req.body);
      const result = await this.authService.register(body);
      return sendSuccess(res, result, 'Registered successfully', 201);
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = loginSchema.parse(req.body);
      const result = await this.authService.login(body);
      return sendSuccess(res, result, 'Login successful', 200);
    } catch (error) {
      next(error);
    }
  };

  getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const result = await this.authService.getMe(userId);
      return sendSuccess(res, result, 'User profile fetched', 200);
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const body = updateProfileSchema.parse(req.body);
      const result = await this.authService.updateProfile(userId, body);
      return sendSuccess(res, result, 'Profile updated', 200);
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const body = changePasswordSchema.parse(req.body);
      await this.authService.changePassword(userId, body);
      return sendSuccess(res, null, 'Password changed successfully', 200);
    } catch (error) {
      next(error);
    }
  };
}
