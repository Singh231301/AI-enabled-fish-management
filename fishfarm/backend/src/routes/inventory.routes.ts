import { Router } from 'express';
import { inventoryController } from '../container';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';

const router = Router();

router.use(authMiddleware);

// Overview & Stats
router.get('/overview', inventoryController.getOverview);
router.get('/stats', inventoryController.getStats);

router.get('/maintenance', inventoryController.getMaintenanceSchedule);
router.post('/maintenance', requireRole('ADMIN'), inventoryController.scheduleMaintenance);
router.patch('/maintenance/:id/complete', requireRole('ADMIN', 'HELPER'), inventoryController.completeMaintenance);

router.get('/transactions', inventoryController.getTransactions);
router.post('/transactions/purchase', requireRole('ADMIN'), inventoryController.recordPurchase);
router.post('/transactions/usage', requireRole('ADMIN', 'HELPER'), inventoryController.recordUsage);
router.post('/transactions/adjust', requireRole('ADMIN'), inventoryController.adjustStock);
router.delete('/transactions/:id', requireRole('ADMIN'), inventoryController.deleteTransaction);

// Items
router.get('/', inventoryController.getItems);
router.post('/', requireRole('ADMIN'), inventoryController.createItem);
router.get('/:id', inventoryController.getItemById);
router.patch('/:id', requireRole('ADMIN'), inventoryController.updateItem);
router.delete('/:id', requireRole('ADMIN'), inventoryController.deactivateItem);

export const inventoryRoutes = router;
