import { Router } from 'express';
import { pondController } from '../container';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

// Pond CRUD
router.get('/', pondController.getUserPonds);
router.post('/', pondController.createPond);
router.get('/:pondId', pondController.getPondById);
router.put('/:pondId', pondController.updatePond);
router.delete('/:pondId', pondController.deletePond);

// Infrastructure Checklist
router.get('/:pondId/infrastructure/stats', pondController.getInfrastructureStats);
router.get('/:pondId/infrastructure', pondController.getInfrastructureItems);
router.post('/:pondId/infrastructure', pondController.addInfrastructureItem);
router.put('/:pondId/infrastructure/:itemId', pondController.updateInfrastructureItem);
router.delete('/:pondId/infrastructure/:itemId', pondController.deleteInfrastructureItem);

export const pondRouter = router;
