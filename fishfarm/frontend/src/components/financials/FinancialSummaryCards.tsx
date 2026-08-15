import React from 'react';
import { FinancialStats } from '../../types/financials.types';

interface FinancialSummaryCardsProps {
  stats: FinancialStats;
}

export const FinancialSummaryCards: React.FC<FinancialSummaryCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-red-500/10 p-2 rounded-lg text-red-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="font-medium text-slate-400">Total Expenses</h3>
        </div>
        <p className="text-2xl font-bold text-white">₹{stats.totalExpenses.toLocaleString()}</p>
        <p className="text-xs text-slate-500 mt-1">This month: ₹{stats.currentMonthExpenses.toLocaleString()}</p>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-green-500/10 p-2 rounded-lg text-green-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <h3 className="font-medium text-slate-400">Total Revenue</h3>
        </div>
        <p className="text-2xl font-bold text-white">₹{stats.totalRevenue.toLocaleString()}</p>
        <p className="text-xs text-slate-500 mt-1">This month: ₹{stats.currentMonthRevenue.toLocaleString()}</p>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className={`p-2 rounded-lg ${stats.isProfitable ? 'bg-sky-500/10 text-sky-400' : 'bg-orange-500/10 text-orange-400'}`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="font-medium text-slate-400">Net {stats.isProfitable ? 'Profit' : 'Loss'}</h3>
        </div>
        <p className={`text-2xl font-bold ${stats.isProfitable ? 'text-green-400' : 'text-red-400'}`}>
          {stats.isProfitable ? '+' : ''}₹{stats.netProfitLoss.toLocaleString()}
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Cost to Produce: {stats.costPerKgProduced ? `₹${stats.costPerKgProduced.toFixed(2)}/kg` : 'N/A'}
        </p>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-amber-500/10 p-2 rounded-lg text-amber-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="font-medium text-slate-400">Pending Payments</h3>
        </div>
        <p className="text-2xl font-bold text-white">₹{stats.totalPendingAmount.toLocaleString()}</p>
        <p className="text-xs text-slate-500 mt-1">From {stats.pendingSalesCount} invoices</p>
      </div>
    </div>
  );
};
