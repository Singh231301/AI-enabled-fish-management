import { Router } from 'express';
import { financialsController } from '../container';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/overview', financialsController.getFinancialOverview);
router.get('/stats', financialsController.getFinancialStats);
router.post('/wire-auto-expenses', financialsController.wireAutoExpenses);

router.get('/expenses', financialsController.getExpenses);
router.post('/expenses', financialsController.createExpense);
router.get('/expenses/:id', financialsController.getExpenseById);
router.put('/expenses/:id', financialsController.updateExpense);
router.delete('/expenses/:id', financialsController.deleteExpense);

router.get('/sales', financialsController.getSales);
router.post('/sales', financialsController.createSale);
router.get('/sales/:id', financialsController.getSaleById);
router.put('/sales/:id', financialsController.updateSale);
router.delete('/sales/:id', financialsController.deleteSale);
router.post('/sales/:id/payment', financialsController.recordPayment);

router.get('/market-prices', financialsController.getMarketPrices);
router.post('/market-prices', financialsController.recordMarketPrice);

router.get('/budgets', financialsController.getBudgets);
router.post('/budgets', financialsController.setBudget);

export const financialsRoutes = router;
