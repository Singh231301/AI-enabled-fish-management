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

export const FinancialsPage = () => {
  const [ponds, setPonds] = useState<any[]>([]);
  const [currentPond, setCurrentPond] = useState<any>(null);

  useEffect(() => {
    pondApi.getUserPonds().then(res => {
      setPonds(res.data);
      if(res.data.length > 0) setCurrentPond(res.data[0]);
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
    } catch (error) {
      console.error(error);
      alert('Failed to save expense');
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
    } catch (error) {
      console.error(error);
      alert('Failed to save sale');
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
    } catch (error) {
      console.error(error);
      alert('Failed to record payment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!currentPond || !window.confirm('Delete this expense?')) return;
    try {
      await financialsApi.deleteExpense(id, currentPond.id);
      await loadData();
    } catch (error) {
      alert('Cannot delete this expense (might be auto-generated).');
    }
  };

  if (!currentPond) {
    return (
      <>
        <div className="flex h-full items-center justify-center">
          <p className="text-slate-500">Please select a pond to view financials.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Financials: {currentPond.name}</h1>
            <p className="text-slate-500">Track expenses, sales, and analyze profitability.</p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => { setSelectedExpense(null); setShowExpenseForm(true); }}
              className="px-4 py-2 bg-slate-800 text-white font-medium rounded-lg hover:bg-slate-700 transition-colors shadow-sm"
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-2 rounded-xl shadow-sm border border-slate-200">
          <div className="flex space-x-1">
            {['overview', 'expenses', 'sales', 'analysis'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-2 text-sm font-medium rounded-lg capitalize transition-colors ${
                  activeTab === tab 
                    ? 'bg-sky-50 text-sky-700' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 pr-2">
            <span className="text-sm font-medium text-slate-500">Period:</span>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="text-sm border-slate-300 rounded-lg focus:ring-sky-500 focus:border-sky-500 font-medium text-slate-700"
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
            <div className="h-32 bg-slate-200 rounded-xl"></div>
            <div className="grid grid-cols-2 gap-4"><div className="h-64 bg-slate-200 rounded-xl"></div><div className="h-64 bg-slate-200 rounded-xl"></div></div>
          </div>
        ) : stats ? (
          <>
            {activeTab === 'overview' && (
              <div className="space-y-6 fade-in">
                <FinancialSummaryCards stats={stats} />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                    <h3 className="font-bold text-slate-800 text-lg mb-4">Cash Flow Trend</h3>
                    <CashFlowChart data={stats.cashFlow.slice(-6)} />
                  </div>
                  
                  <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                    <h3 className="font-bold text-slate-800 text-lg mb-4">Expenses by Category</h3>
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
                
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-800 text-lg">Expense History</h3>
                    <button 
                      onClick={() => financialsApi.wireAutoExpenses(currentPond.id).then(() => loadData())}
                      className="text-xs font-medium text-slate-600 bg-white border border-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-50"
                    >
                      🔄 Sync Auto-Expenses
                    </button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 text-slate-700 uppercase">
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
                            <tr key={expense.id} className="border-b border-slate-100 hover:bg-slate-50">
                              <td className="px-6 py-4">{format(new Date(expense.expenseDate), 'dd MMM yyyy')}</td>
                              <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${config?.bgColor} ${config?.color}`}>
                                  {config?.emoji} {config?.label}
                                </span>
                                {expense.isAutoGenerated && <span className="ml-2 text-xs text-blue-500 font-medium bg-blue-50 px-2 py-0.5 rounded">Auto</span>}
                              </td>
                              <td className="px-6 py-4">{expense.itemName}</td>
                              <td className="px-6 py-4 text-right font-medium">₹{expense.totalAmount.toLocaleString()}</td>
                              <td className="px-6 py-4 text-right">
                                <button 
                                  onClick={() => { setSelectedExpense(expense); setShowExpenseForm(true); }}
                                  className="text-sky-600 hover:text-sky-900 mr-3"
                                >
                                  Edit
                                </button>
                                <button 
                                  onClick={() => handleDeleteExpense(expense.id)}
                                  className="text-red-600 hover:text-red-900"
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
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-slate-100 bg-slate-50">
                    <h3 className="font-bold text-slate-800 text-lg">Sales & Invoices</h3>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 text-slate-700 uppercase">
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
                            <tr key={sale.id} className="border-b border-slate-100 hover:bg-slate-50">
                              <td className="px-6 py-4">
                                {format(new Date(sale.saleDate), 'dd MMM yyyy')}
                                <div className="text-xs text-slate-400 mt-1">{sale.invoiceNumber}</div>
                              </td>
                              <td className="px-6 py-4 font-medium text-slate-800">{sale.buyerName}</td>
                              <td className="px-6 py-4 text-right">
                                {sale.fishQuantityKg} kg<br/>
                                <span className="text-xs text-slate-500">@ ₹{sale.pricePerKg}</span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="font-bold text-slate-800">₹{sale.totalAmount.toLocaleString()}</div>
                                {sale.balancePending > 0 && (
                                  <div className="text-xs text-red-600 font-medium mt-1">₹{sale.balancePending.toLocaleString()} due</div>
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
                                    className="text-green-600 hover:text-green-900 font-medium"
                                  >
                                    Pay
                                  </button>
                                )}
                                <button 
                                  onClick={() => { setSelectedSale(sale); setShowInvoiceModal(true); }}
                                  className="text-sky-600 hover:text-sky-900"
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
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-semibold text-slate-800 text-lg">
                {selectedExpense ? 'Edit Expense' : 'Add New Expense'}
              </h3>
              <button onClick={() => setShowExpenseForm(false)} className="text-slate-400 hover:text-slate-600">✕</button>
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
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-semibold text-slate-800 text-lg">
                {selectedSale ? 'Edit Sale' : 'Record Fish Sale'}
              </h3>
              <button onClick={() => setShowSaleForm(false)} className="text-slate-400 hover:text-slate-600">✕</button>
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

    </>
  );
};
