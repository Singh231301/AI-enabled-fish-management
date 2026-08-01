import { Router } from 'express';
import { aiController } from '../container';
import { authMiddleware } from '../middlewares/auth.middleware';

export const aiRouter = Router();

// Chat
aiRouter.post('/chat', authMiddleware, aiController.sendMessage);
aiRouter.post('/chat/stream', authMiddleware, aiController.sendMessageStream);
aiRouter.get('/chat/history', authMiddleware, aiController.getChatHistory);
aiRouter.delete('/chat/session/:sessionId', authMiddleware, aiController.clearSession);

// Briefings
aiRouter.get('/briefing/daily', authMiddleware, aiController.getDailyBriefing);
aiRouter.post('/briefing/generate', authMiddleware, aiController.generateDailyBriefing);
aiRouter.get('/briefing/weekly', authMiddleware, aiController.getWeeklyReport);

// Insights & Suggestions
aiRouter.get('/insights', authMiddleware, aiController.getInsights);
aiRouter.get('/suggestions', authMiddleware, aiController.getSuggestedQuestions);
aiRouter.get('/health-score', authMiddleware, aiController.getFarmHealthScore);
