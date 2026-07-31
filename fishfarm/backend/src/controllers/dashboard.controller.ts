import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { PondRepository } from '../repositories/pond.repository';
import { AppError } from '../utils/app-error';
import { sendSuccess } from '../utils/response.utils';
import { z } from 'zod';

const uuidSchema = z.string().uuid();

export class DashboardController {
  constructor(
    private dashboardService: DashboardService,
    private pondRepository: PondRepository
  ) {}

  getDashboard = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pondId = req.params.pondId;
      
      try {
        uuidSchema.parse(pondId);
      } catch (err) {
        throw new AppError('Invalid pondId format', 400);
      }

      const pond = await this.pondRepository.findById(pondId);
      
      if (!pond) {
        throw new AppError('Pond not found', 404);
      }

      if (pond.userId !== req.user!.id) {
        throw new AppError('Forbidden access to this pond', 403);
      }

      const data = await this.dashboardService.getDashboardData(pondId, req.user!.id, pond);
      
      return sendSuccess(res, data, 'Dashboard loaded');
    } catch (error) {
      next(error);
    }
  };
}
