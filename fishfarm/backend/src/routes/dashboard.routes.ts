import { Router } from 'express';
import { dashboardController } from '../container';
import { authMiddleware } from '../middlewares/auth.middleware';

export const dashboardRouter = Router();

dashboardRouter.get('/:pondId', authMiddleware, dashboardController.getDashboard);
