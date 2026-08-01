import { Router } from 'express';
import { authRouter } from './auth.routes';

import { dashboardRouter } from './dashboard.routes';
import { aiRouter } from './ai.routes';
import { pondRouter } from './pond.routes';
import fishRouter from './fish.routes';
import feedingRouter from './feeding.routes';
import waterRouter from './water.routes';
import { financialsRoutes } from './financials.routes';
import { inventoryRoutes } from './inventory.routes';
import { tasksRoutes } from './tasks.routes';
import { createReportsRouter } from './reports.routes';
import { createSettingsRouter } from './settings.routes';
import { reportsController, settingsController } from '../container';

export const routes = Router();

routes.use('/auth', authRouter);
routes.use('/dashboard', dashboardRouter);
routes.use('/ai', aiRouter);
routes.use('/ponds', pondRouter);
routes.use('/fish', fishRouter);
routes.use('/feeding', feedingRouter);
routes.use('/water', waterRouter);
routes.use('/financials', financialsRoutes);
routes.use('/inventory', inventoryRoutes);
routes.use('/tasks', tasksRoutes);
routes.use('/reports', createReportsRouter(reportsController));
routes.use('/settings', createSettingsRouter(settingsController));
