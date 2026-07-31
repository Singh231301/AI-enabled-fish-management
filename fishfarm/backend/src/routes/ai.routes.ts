import { Router } from 'express';
import { aiController } from '../container';
import { authMiddleware } from '../middlewares/auth.middleware';

export const aiRouter = Router();

aiRouter.get('/daily-briefing/:pondId', authMiddleware, aiController.getDailyBriefing);
aiRouter.post('/daily-briefing', authMiddleware, aiController.generateDailyBriefing);
