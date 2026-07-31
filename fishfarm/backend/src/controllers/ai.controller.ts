import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/response.utils';

export class AiController {
  getDailyBriefing = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Stub: return null to force generation
      return sendSuccess(res, { briefing: null, generatedAt: null }, "OK");
    } catch (error) {
      next(error);
    }
  };

  generateDailyBriefing = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Stub: return a hardcoded briefing
      const { pondId, fishAgeDays, expectedWeight, recommendedFeed } = req.body;
      
      const age = fishAgeDays || 45;
      const weight = expectedWeight || 350;
      const feed = recommendedFeed || 850;

      const briefing = `🐟 Fish Update: Your Pangasius fingerlings are ${age} days old today. 
Based on their age, they should be averaging around ${weight}g. 
📊 Feeding: Recommended feed today is ${feed}g split into 2 sessions.
💧 Water: Check pH if not done in last 2 days.
✅ Priority: Complete any overdue tasks in your task list.
📅 This week: Focus on monitoring feeding response and water clarity.`;

      return sendSuccess(res, { briefing, generatedAt: new Date().toISOString() }, "Generated");
    } catch (error) {
      next(error);
    }
  };
}
