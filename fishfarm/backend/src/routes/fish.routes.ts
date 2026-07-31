import { Router } from 'express';
import { fishController } from '../container';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

// Overview
router.get('/overview', fishController.getFishOverview);

// Stocking
router.get('/stocking', fishController.getStockings);
router.post('/stocking', fishController.createStocking);
router.get('/stocking/:id', fishController.getStockingById);
router.put('/stocking/:id', fishController.updateStocking);
router.delete('/stocking/:id', fishController.deleteStocking);

// Mortality
router.get('/mortality/summary', fishController.getMortalitySummary);
router.get('/mortality', fishController.getMortalityLogs);
router.post('/mortality', fishController.createMortality);
router.get('/mortality/:id', fishController.getMortalityById);
router.put('/mortality/:id', fishController.updateMortality);
router.delete('/mortality/:id', fishController.deleteMortality);

// Growth Samples
router.get('/growth/summary', fishController.getGrowthSummary);
router.get('/growth', fishController.getGrowthSamples);
router.post('/growth', fishController.createGrowthSample);
router.put('/growth/:id', fishController.updateGrowthSample);
router.delete('/growth/:id', fishController.deleteGrowthSample);

export default router;
