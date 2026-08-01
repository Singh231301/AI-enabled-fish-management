import { Router } from 'express';
import { waterController } from '../container';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

// Overview and Stats (Must be before /logs/:id)
router.get('/overview', waterController.getWaterOverview);
router.get('/stats', waterController.getWaterStats);

// Water Quality Logs
router.get('/logs', waterController.getWaterQualityLogs);
router.post('/logs', waterController.createWaterQualityLog);
router.get('/logs/:id', waterController.getWaterQualityLogById);
router.put('/logs/:id', waterController.updateWaterQualityLog);
router.delete('/logs/:id', waterController.deleteWaterQualityLog);

// Treatment Logs
router.get('/treatments', waterController.getTreatmentLogs);
router.post('/treatments', waterController.createWaterTreatment);
router.put('/treatments/:id', waterController.updateWaterTreatment);
router.delete('/treatments/:id', waterController.deleteWaterTreatment);

export default router;
