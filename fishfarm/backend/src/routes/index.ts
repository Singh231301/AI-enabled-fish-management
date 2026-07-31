import { Router } from 'express';
import { authRouter } from './auth.routes';
import { dashboardRouter } from './dashboard.routes';
import { aiRouter } from './ai.routes';
import { pondRouter } from './pond.routes';
import fishRouter from './fish.routes';
import feedingRouter from './feeding.routes';
import waterRouter from './water.routes';
import { financialsRoutes } from './financials.routes';

export const routes = Router();

routes.use('/auth', authRouter);
routes.use('/dashboard', dashboardRouter);
routes.use('/ai', aiRouter);
routes.use('/ponds', pondRouter);
routes.use('/fish', fishRouter);
routes.use('/feeding', feedingRouter);
routes.use('/water', waterRouter);
routes.use('/financials', financialsRoutes);
