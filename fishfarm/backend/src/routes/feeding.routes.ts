import { Router } from 'express';
import { feedingController } from '../container';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/overview', feedingController.getFeedingOverview);
router.get('/today', feedingController.getTodayStatus);
router.get('/stats', feedingController.getFeedingStats);
router.get('/schedule', feedingController.getSchedule);
router.post('/schedule', feedingController.upsertSchedule);

router.get('/logs', feedingController.getFeedingLogs);
router.post('/logs', feedingController.createFeedingLog);
router.get('/logs/:id', feedingController.getFeedingLogById);
router.put('/logs/:id', feedingController.updateFeedingLog);
router.delete('/logs/:id', feedingController.deleteFeedingLog);

export default router;
