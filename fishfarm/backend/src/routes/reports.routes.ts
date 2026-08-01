import { Router } from 'express';
import { ReportsController } from '../controllers/reports.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

export const createReportsRouter = (reportsController: ReportsController): Router => {
  const router = Router();

  router.use(authMiddleware);

  router.get('/scorecard', reportsController.getScorecard);
  router.get('/harvest-readiness', reportsController.getHarvestReadiness);
  router.get('/growth-analytics', reportsController.getGrowthAnalytics);
  router.get('/feeding-analytics', reportsController.getFeedingAnalytics);
  router.get('/water-quality', reportsController.getWaterQuality);
  router.get('/full', reportsController.getFullFarmReport);
  router.get('/export', reportsController.exportData);

  return router;
};
