import { Router } from 'express';
import { taskController } from '../container';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';

const router = Router();

router.use(authMiddleware);

// Stats & Analytics
router.get('/overview', taskController.getOverview);
router.get('/stats', taskController.getTaskStats);
router.get('/calendar', taskController.getCalendarData);
router.get('/ai-suggestions', taskController.generateAISuggestions);

// CRUD
router.post('/', requireRole('ADMIN', 'HELPER'), taskController.createTask);
router.get('/', taskController.getTasks);
router.get('/:id', taskController.getTaskById);
router.put('/:id', requireRole('ADMIN', 'HELPER'), taskController.updateTask);
router.delete('/:id', requireRole('ADMIN'), taskController.deleteTask);

// Actions
router.post('/:id/complete', requireRole('ADMIN', 'HELPER'), taskController.completeTask);
router.post('/:id/skip', requireRole('ADMIN', 'HELPER'), taskController.skipTask);

export const tasksRoutes = router;
