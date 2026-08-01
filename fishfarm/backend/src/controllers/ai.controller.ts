import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/response.utils';
import { AiService } from '../services/ai.service';
import {
  sendMessageSchema,
  generateBriefingSchema,
  getInsightsSchema,
  getChatHistorySchema,
  getDailyBriefingSchema,
  getWeeklyReportSchema
} from '../validators/ai.validator';

export class AiController {
  constructor(private readonly aiService: AiService) {}

  sendMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = sendMessageSchema.parse(req.body);
      const result = await this.aiService.sendMessage(body, req.user!.id);
      return sendSuccess(res, result, "Message sent");
    } catch (error) {
      next(error);
    }
  };

  sendMessageStream = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = sendMessageSchema.parse(req.body);
      
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.flushHeaders();
      
      let fullText = '';
      
      await this.aiService.sendMessageStream(
        body,
        req.user!.id,
        (chunk: string) => {
          res.write(`data: ${JSON.stringify({ type: 'chunk', text: chunk })}\n\n`);
        },
        (text: string, sessionId: string) => {
          fullText = text;
          res.write(`data: ${JSON.stringify({ type: 'done', text, sessionId })}\n\n`);
          res.end();
        },
        (error: Error) => {
          res.write(`data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`);
          res.end();
        }
      );
      
      req.on('close', () => {
        res.end();
      });
      
    } catch (error) {
      if (!res.headersSent) {
        next(error);
      } else {
        res.write(`data: ${JSON.stringify({ type: 'error', message: 'Internal server error' })}\n\n`);
        res.end();
      }
    }
  };

  getDailyBriefing = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = getDailyBriefingSchema.parse(req.query);
      const briefing = await this.aiService.getDailyBriefing(query.pondId, req.user!.id);
      if (!briefing) {
        return sendSuccess(res, null, "No briefing yet");
      }
      return sendSuccess(res, briefing, "Briefing retrieved");
    } catch (error) {
      next(error);
    }
  };

  generateDailyBriefing = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = generateBriefingSchema.parse(req.body);
      const briefing = await this.aiService.generateDailyBriefing(body.pondId, req.user!.id, body.forceRegenerate);
      return sendSuccess(res, briefing, "Briefing generated");
    } catch (error) {
      next(error);
    }
  };

  getWeeklyReport = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = getWeeklyReportSchema.parse(req.query);
      const report = await this.aiService.generateWeeklyReport(query.pondId, req.user!.id);
      return sendSuccess(res, report, "Weekly report retrieved");
    } catch (error) {
      next(error);
    }
  };

  getInsights = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = getInsightsSchema.parse(req.query);
      const insights = await this.aiService.generateInsights(query.pondId, req.user!.id, query.module);
      return sendSuccess(res, insights, "Insights generated");
    } catch (error) {
      next(error);
    }
  };

  getSuggestedQuestions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { pondId } = req.query;
      if (!pondId || typeof pondId !== 'string') {
        throw new Error("Pond ID is required");
      }
      const questions = await this.aiService.getSuggestedQuestions(pondId, req.user!.id);
      return sendSuccess(res, questions, "Questions generated");
    } catch (error) {
      next(error);
    }
  };

  getChatHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = getChatHistorySchema.parse(req.query);
      const result = await this.aiService.getChatHistory(req.user!.id, query);
      return sendSuccess(res, result, "Chat history retrieved");
    } catch (error) {
      next(error);
    }
  };

  clearSession = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { sessionId } = req.params;
      await this.aiService['chatHistoryRepo'].deleteSession(sessionId, req.user!.id);
      return sendSuccess(res, null, "Session cleared");
    } catch (error) {
      next(error);
    }
  };

  getFarmHealthScore = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { pondId } = req.query;
      if (!pondId || typeof pondId !== 'string') {
        throw new Error("Pond ID is required");
      }
      const score = await this.aiService.calculateFarmHealthScore(pondId, req.user!.id);
      return sendSuccess(res, score, "Farm health score calculated");
    } catch (error) {
      next(error);
    }
  };
}
