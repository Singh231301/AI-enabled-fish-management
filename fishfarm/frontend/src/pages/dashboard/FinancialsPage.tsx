import React, { useState, useEffect } from 'react';
import { pondApi } from '../../api/endpoints/pond.api';
import * as financialsApi from '../../api/endpoints/financials.api';
import { 
  FinancialOverview, FinancialStats, Expense, Sale, Budget, MarketPrice, 
  ExpenseCategory, PaymentStatus 
} from '../../types/financials.types';
import { FinancialSummaryCards } from '../../components/financials/FinancialSummaryCards';
import { ExpenseForm } from '../../components/financials/ExpenseForm';
import { SaleForm } from '../../components/financials/SaleForm';
import { RecordPaymentModal } from '../../components/financials/RecordPaymentModal';
import { MarketPriceForm } from '../../components/financials/MarketPriceForm';
import { InvoiceGenerator } from '../../components/financials/InvoiceGenerator';
import { ExpensePieChart } from '../../components/financials/ExpensePieChart';

import { CashFlowChart } from '../../components/financials/CashFlowChart';
import { PLStatement } from '../../components/financials/PLStatement';
import { BudgetTracker } from '../../components/financials/BudgetTracker';
import { BreakEvenCalculator } from '../../components/financials/BreakEvenCalculator';
import { HarvestProjection } from '../../components/financials/HarvestProjection';
import { MonthlyFinancialTable } from '../../components/financials/MonthlyFinancialTable';
import { EXPENSE_CATEGORY_CONFIG, PAYMENT_STATUS_CONFIG } from '../../utils/constants';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

export const FinancialsPage = () => {
  const [ponds, setPonds] = useState<any[]>([]);
  const [currentPond, setCurrentPond] = useState<any>(null);

  useEffect(() => {
    pondApi.getUserPonds().then(res => {
      setPonds(res.data);
      if (res.data.length > 0) {
        const savedPondId = localStorage.getItem('fishfarm_selected_pond');
        const savedPond = savedPondId ? res.data.find((pond: any) => pond.id === savedPondId) : null;
        const pondToUse = savedPond || res.data[0];
        setCurrentPond(pondToUse);
        localStorage.setItem('fishfarm_selected_pond', pondToUse.id);
      }
    });
  }, []);
  const [activeTab, setActiveTab] = useState<'overview' | 'expenses' | 'sales' | 'analysis'>('overview');
  const [period, setPeriod] = useState('current_month');
  
  const [overview, setOverview] = useState<FinancialOverview | null>(null);
  const [stats, setStats] = useState<FinancialStats | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showSaleForm, setShowSaleForm] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [deleteExpenseId, setDeleteExpenseId] = useState<string | null>(null);

  useEffect(() => {
    if (currentPond) {
      loadData();
    }
  }, [currentPond, period]);

  const loadData = async () => {
    if (!currentPond) return;
    setIsLoading(true);
    try {
      const [overviewData, statsData] = await Promise.all([
        financialsApi.getFinancialOverview(currentPond.id),
        financialsApi.getFinancialStats(currentPond.id, period)
      ]);
      setOverview(overviewData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load financials:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExpenseSubmit = async (data: any) => {
    if (!currentPond) return;
    try {
      setIsLoading(true);
      if (selectedExpense) {
        await financialsApi.updateExpense(selectedExpense.id, currentPond.id, data);
      } else {
        await financialsApi.createExpense({ ...data, pondId: currentPond.id });
      }
      setShowExpenseForm(false);
      setSelectedExpense(null);
      await loadData();
      toast.success('Expense saved');
    } catch (error) {
      console.error(error);
      toast.error('Failed to save expense');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaleSubmit = async (data: any) => {
    if (!currentPond) return;
    try {
      setIsLoading(true);
      if (selectedSale) {
        await financialsApi.updateSale(selectedSale.id, currentPond.id, data);
      } else {
        await financialsApi.createSale({ ...data, pondId: currentPond.id });
      }
      setShowSaleForm(false);
      setSelectedSale(null);
      await loadData();
      toast.success('Sale recorded');
    } catch (error) {
      console.error(error);
      toast.error('Failed to save sale');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecordPayment = async (data: any) => {
    if (!currentPond || !selectedSale) return;
    try {
      setIsLoading(true);
      await financialsApi.recordPayment(selectedSale.id, currentPond.id, data);
      setShowPaymentModal(false);
      setSelectedSale(null);
      await loadData();
      toast.success('Payment recorded');
    } catch (error) {
      console.error(error);
      toast.error('Failed to record payment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteExpense = (id: string) => {
    setDeleteExpenseId(id);
  };

  const confirmDeleteExpense = async () => {
    if (!currentPond || !deleteExpenseId) return;
    try {
      await financialsApi.deleteExpense(deleteExpenseId, currentPond.id);
      await loadData();
      toast.success('Expense deleted');
    } catch (error) {
      toast.error('Cannot delete this expense (might be auto-generated).');
    } finally {
      setDeleteExpenseId(null);
    }
  };

  const handlePondChange = (pondId: string) => {
    const nextPond = ponds.find((pond) => pond.id === pondId);
    if (!nextPond) return;
    setCurrentPond(nextPond);
    localStorage.setItem('fishfarm_selected_pond', pondId);
  };

  if (!currentPond) {
    return (
      <>
        <div className="flex h-full items-center justify-center">
          <p className="text-slate-400">Please select a pond to view financials.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Financials: {currentPond.name}</h1>
            <p className="text-slate-400">Track expenses, sales, and analyze profitability.</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {ponds.length > 1 && (
              <select
                value={currentPond.id}
                onChange={(e) => handlePondChange(e.target.value)}
                className="px-3 py-2 bg-slate-800 border border-slate-700 text-white font-medium rounded-lg focus:ring-sky-500 focus:border-sky-500"
              >
                {ponds.map((pond) => (
                  <option key={pond.id} value={pond.id}>
                    {pond.name}
                  </option>
                ))}
              </select>
            )}
            <button
              onClick={() => { setSelectedExpense(null); setShowExpenseForm(true); }}
              className="px-4 py-2 bg-slate-800 border border-slate-700 text-white font-medium rounded-lg hover:bg-slate-700 transition-colors shadow-sm"
            >
              + Add Expense
            </button>
            <button
              onClick={() => { setSelectedSale(null); setShowSaleForm(true); }}
              className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm"
            >
              + Record Sale
            </button>
          </div>
        </div>

        {/* Tabs & Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 p-3 rounded-xl shadow-sm border border-slate-800">
          <div className="flex space-x-1">
            {['overview', 'expenses', 'sales', 'analysis'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-2 text-sm font-medium rounded-lg capitalize transition-colors ${
                  activeTab === tab 
                    ? 'bg-sky-500/20 text-sky-400' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 pr-2">
            <span className="text-sm font-medium text-slate-400">Period:</span>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="text-sm bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-sky-500 focus:border-sky-500 font-medium"
            >
              <option value="current_month">Current Month</option>
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="year">Past Year</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>

        {isLoading && !stats ? (
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-slate-800 rounded-xl"></div>
            <div className="grid grid-cols-2 gap-4"><div className="h-64 bg-slate-800 rounded-xl"></div><div className="h-64 bg-slate-800 rounded-xl"></div></div>
          </div>
        ) : stats ? (
          <>
            {activeTab === 'overview' && (
              <div className="space-y-6 fade-in">
                <FinancialSummaryCards stats={stats} />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-sm">
                    <h3 className="font-bold text-white text-lg mb-4">Cash Flow Trend</h3>
                    <CashFlowChart data={stats.cashFlow.slice(-6)} />
                  </div>
                  
                  <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-sm">
                    <h3 className="font-bold text-white text-lg mb-4">Expenses by Category</h3>
                    <ExpensePieChart data={stats.expensesByCategory} />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <PLStatement data={stats.plStatement} />
                  <div className="space-y-6">
                    <HarvestProjection data={stats.harvestProjection} />
                    <BreakEvenCalculator data={stats.breakEven} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'expenses' && (
              <div className="space-y-6 fade-in">
                <BudgetTracker 
                  data={stats.budgetVsActual} 
                  onSetBudget={() => alert('Budget management coming soon!')} 
                />
                
                <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
                    <h3 className="font-bold text-white text-lg">Expense History</h3>
                    <button 
                      onClick={() => financialsApi.wireAutoExpenses(currentPond.id).then(() => loadData())}
                      className="text-xs font-medium text-slate-300 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-700"
                    >
                      🔄 Sync Auto-Expenses
                    </button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-800/50 text-slate-400 uppercase border-b border-slate-700">
                        <tr>
                          <th className="px-6 py-4 font-semibold">Date</th>
                          <th className="px-6 py-4 font-semibold">Category</th>
                          <th className="px-6 py-4 font-semibold">Item</th>
                          <th className="px-6 py-4 font-semibold text-right">Amount (₹)</th>
                          <th className="px-6 py-4 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {overview?.recentExpenses.map((expense) => {
                          const config = EXPENSE_CATEGORY_CONFIG[expense.category as Exclude<ExpenseCategory, 'TOTAL'>];
                          return (
                            <tr key={expense.id} className="border-b border-slate-800 hover:bg-slate-800/30">
                              <td className="px-6 py-4 text-slate-300">{format(new Date(expense.expenseDate), 'dd MMM yyyy')}</td>
                              <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${config?.bgColor} ${config?.color}`}>
                                  {config?.emoji} {config?.label}
                                </span>
                                {expense.isAutoGenerated && <span className="ml-2 text-xs text-sky-400 font-medium bg-sky-500/20 px-2 py-0.5 rounded">Auto</span>}
                              </td>
                              <td className="px-6 py-4 text-white">{expense.itemName}</td>
                              <td className="px-6 py-4 text-right font-medium text-white">₹{expense.totalAmount.toLocaleString()}</td>
                              <td className="px-6 py-4 text-right">
                                <button 
                                  onClick={() => { setSelectedExpense(expense); setShowExpenseForm(true); }}
                                  className="text-sky-400 hover:text-sky-300 mr-3"
                                >
                                  Edit
                                </button>
                                <button 
                                  onClick={() => handleDeleteExpense(expense.id)}
                                  className="text-red-400 hover:text-red-300"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'sales' && (
              <div className="space-y-6 fade-in">
                <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-slate-800 bg-slate-800/50">
                    <h3 className="font-bold text-white text-lg">Sales & Invoices</h3>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-800/50 text-slate-400 uppercase border-b border-slate-700">
                        <tr>
                          <th className="px-6 py-4 font-semibold">Date</th>
                          <th className="px-6 py-4 font-semibold">Buyer</th>
                          <th className="px-6 py-4 font-semibold text-right">Qty/Rate</th>
                          <th className="px-6 py-4 font-semibold text-right">Total (₹)</th>
                          <th className="px-6 py-4 font-semibold">Status</th>
                          <th className="px-6 py-4 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {overview?.recentSales.map((sale) => {
                          const statusConfig = PAYMENT_STATUS_CONFIG[sale.paymentStatus];
                          return (
                            <tr key={sale.id} className="border-b border-slate-800 hover:bg-slate-800/30">
                              <td className="px-6 py-4 text-slate-300">
                                {format(new Date(sale.saleDate), 'dd MMM yyyy')}
                                <div className="text-xs text-slate-500 mt-1">{sale.invoiceNumber}</div>
                              </td>
                              <td className="px-6 py-4 font-medium text-white">{sale.buyerName}</td>
                              <td className="px-6 py-4 text-right text-slate-300">
                                {sale.fishQuantityKg} kg<br/>
                                <span className="text-xs text-slate-500">@ ₹{sale.pricePerKg}</span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="font-bold text-white">₹{sale.totalAmount.toLocaleString()}</div>
                                {sale.balancePending > 0 && (
                                  <div className="text-xs text-red-400 font-medium mt-1">₹{sale.balancePending.toLocaleString()} due</div>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
                                  {statusConfig.label}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right space-x-3">
                                {sale.balancePending > 0 && (
                                  <button 
                                    onClick={() => { setSelectedSale(sale); setShowPaymentModal(true); }}
                                    className="text-green-400 hover:text-green-300 font-medium"
                                  >
                                    Pay
                                  </button>
                                )}
                                <button 
                                  onClick={() => { setSelectedSale(sale); setShowInvoiceModal(true); }}
                                  className="text-sky-400 hover:text-sky-300"
                                >
                                  Invoice
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'analysis' && (
              <div className="space-y-6 fade-in">
                <MonthlyFinancialTable data={stats.cashFlow} />
              </div>
            )}
          </>
        ) : null}
      </div>

      {/* Modals */}
      {showExpenseForm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
              <h3 className="font-semibold text-white text-lg">
                {selectedExpense ? 'Edit Expense' : 'Add New Expense'}
              </h3>
              <button onClick={() => setShowExpenseForm(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="p-6 overflow-y-auto">
              <ExpenseForm 
                initialData={selectedExpense} 
                onSubmit={handleExpenseSubmit} 
                onCancel={() => setShowExpenseForm(false)} 
                isLoading={isLoading} 
              />
            </div>
          </div>
        </div>
      )}

      {showSaleForm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-xl w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
              <h3 className="font-semibold text-white text-lg">
                {selectedSale ? 'Edit Sale' : 'Record Fish Sale'}
              </h3>
              <button onClick={() => setShowSaleForm(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="p-6 overflow-y-auto">
              <SaleForm 
                initialData={selectedSale} 
                onSubmit={handleSaleSubmit} 
                onCancel={() => setShowSaleForm(false)} 
                isLoading={isLoading} 
              />
            </div>
          </div>
        </div>
      )}

      {showPaymentModal && selectedSale && (
        <RecordPaymentModal
          sale={selectedSale}
          onClose={() => setShowPaymentModal(false)}
          onSubmit={handleRecordPayment}
          isLoading={isLoading}
        />
      )}

      {showInvoiceModal && selectedSale && (
        <InvoiceGenerator
          sale={selectedSale}
          onClose={() => setShowInvoiceModal(false)}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteExpenseId}
        title="Delete Expense"
        message="Are you sure you want to delete this expense? This action cannot be undone."
        confirmText="Delete Expense"
        onConfirm={confirmDeleteExpense}
        onCancel={() => setDeleteExpenseId(null)}
      />

    </>
  );
};
