import axiosInstance from '../axios';
import { 
  FinancialOverview, FinancialStats, Expense, Sale, MarketPrice, Budget 
} from '../../types/financials.types';

export const getFinancialOverview = async (pondId: string): Promise<FinancialOverview> => {
  const { data } = await axiosInstance.get('/financials/overview', { params: { pondId } });
  return data.data;
};

export const getFinancialStats = async (pondId: string, period: string): Promise<FinancialStats> => {
  const { data } = await axiosInstance.get('/financials/stats', { params: { pondId, period } });
  return data.data;
};

export const getExpenses = async (pondId: string, page = 1, limit = 20, filters?: any) => {
  const { data } = await axiosInstance.get('/financials/expenses', { 
    params: { pondId, page, limit, ...filters } 
  });
  return data;
};

export const createExpense = async (expenseData: any): Promise<Expense> => {
  const { data } = await axiosInstance.post('/financials/expenses', expenseData);
  return data.data;
};

export const updateExpense = async (id: string, pondId: string, expenseData: any): Promise<Expense> => {
  const { data } = await axiosInstance.put(`/financials/expenses/${id}`, expenseData, { params: { pondId } });
  return data.data;
};

export const deleteExpense = async (id: string, pondId: string): Promise<void> => {
  await axiosInstance.delete(`/financials/expenses/${id}`, { params: { pondId } });
};

export const getSales = async (pondId: string, page = 1, limit = 20, filters?: any) => {
  const { data } = await axiosInstance.get('/financials/sales', { 
    params: { pondId, page, limit, ...filters } 
  });
  return data;
};

export const createSale = async (saleData: any): Promise<Sale> => {
  const { data } = await axiosInstance.post('/financials/sales', saleData);
  return data.data;
};

export const updateSale = async (id: string, pondId: string, saleData: any): Promise<Sale> => {
  const { data } = await axiosInstance.put(`/financials/sales/${id}`, saleData, { params: { pondId } });
  return data.data;
};

export const deleteSale = async (id: string, pondId: string): Promise<void> => {
  await axiosInstance.delete(`/financials/sales/${id}`, { params: { pondId } });
};

export const recordPayment = async (id: string, pondId: string, paymentData: any): Promise<Sale> => {
  const { data } = await axiosInstance.post(`/financials/sales/${id}/payment`, paymentData, { params: { pondId } });
  return data.data;
};

export const getMarketPrices = async (pondId: string): Promise<MarketPrice[]> => {
  const { data } = await axiosInstance.get('/financials/market-prices', { params: { pondId } });
  return data.data;
};

export const recordMarketPrice = async (priceData: any): Promise<MarketPrice> => {
  const { data } = await axiosInstance.post('/financials/market-prices', priceData);
  return data.data;
};

export const getBudgets = async (pondId: string, monthYear: string): Promise<Budget[]> => {
  const { data } = await axiosInstance.get('/financials/budgets', { params: { pondId, monthYear } });
  return data.data;
};

export const setBudget = async (budgetData: any): Promise<Budget> => {
  const { data } = await axiosInstance.post('/financials/budgets', budgetData);
  return data.data;
};

export const wireAutoExpenses = async (pondId: string): Promise<void> => {
  await axiosInstance.post('/financials/wire-auto-expenses', null, { params: { pondId } });
};
