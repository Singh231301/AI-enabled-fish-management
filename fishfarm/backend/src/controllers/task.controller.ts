import { Request, Response, NextFunction } from 'express';
import { TaskService } from '../services/task.service';
import { 
  createTaskSchema, 
  updateTaskSchema, 
  completeTaskSchema, 
  skipTaskSchema, 
  taskListQuerySchema,
  aiSuggestTasksQuerySchema
} from '../validators/tasks.validator';
import { z } from 'zod';
import { AppError } from '../utils/app-error';

export class TaskController {
  constructor(private taskService: TaskService) {}

  createTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = createTaskSchema.parse(req.body);
      const task = await this.taskService.createTask(validatedData, req.user!.id);
      res.status(201).json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  };

  getTasks = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = taskListQuerySchema.parse(req.query);
      const result = await this.taskService.getTasks(req.user!.id, query);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  };

  getTaskById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const task = await this.taskService.getTaskById(req.params.id, req.user!.id);
      res.json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  };

  updateTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = updateTaskSchema.parse(req.body);
      const task = await this.taskService.updateTask(req.params.id, req.user!.id, validatedData);
      res.json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  };

  deleteTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.taskService.deleteTask(req.params.id, req.user!.id);
      res.json({ success: true, message: 'Task deleted successfully' });
    } catch (error) {
      next(error);
    }
  };

  completeTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = completeTaskSchema.parse(req.body);
      const result = await this.taskService.completeTask(req.params.id, req.user!.id, validatedData);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  skipTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = skipTaskSchema.parse(req.body);
      const result = await this.taskService.skipTask(req.params.id, req.user!.id, validatedData);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  getTaskStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pondId = req.query.pondId as string | undefined;
      const stats = await this.taskService.getTaskStats(req.user!.id, pondId);
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  };

  getOverview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pondId = req.query.pondId as string | undefined;
      const overview = await this.taskService.getTasksOverview(req.user!.id, pondId);
      res.json({ success: true, data: overview });
    } catch (error) {
      next(error);
    }
  };

  getCalendarData = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const year = parseInt(req.query.year as string);
      const month = parseInt(req.query.month as string);
      
      if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
        throw new AppError("Valid year and month (1-12) are required", 400);
      }
      
      const calendar = await this.taskService.getCalendarData(req.user!.id, year, month);
      res.json({ success: true, data: calendar });
    } catch (error) {
      next(error);
    }
  };

  generateAISuggestions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = aiSuggestTasksQuerySchema.parse(req.query);
      const suggestions = await this.taskService.generateAITaskSuggestions(query.pondId, req.user!.id);
      res.json({ success: true, data: suggestions });
    } catch (error) {
      next(error);
    }
  };
}
