import React from 'react';
import { BudgetVsActual } from '../../types/financials.types';
import { EXPENSE_CATEGORY_CONFIG } from '../../utils/constants';

interface BudgetTrackerProps {
  data: BudgetVsActual[];
  onSetBudget: (category: string) => void;
}

export const BudgetTracker: React.FC<BudgetTrackerProps> = ({ data, onSetBudget }) => {
  const totals = data.find(d => d.category === 'TOTAL');
  const categories = data.filter(d => d.category !== 'TOTAL');

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-sm">
      <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
        <h3 className="font-bold text-white text-lg">Monthly Budget Tracker</h3>
        <button 
          onClick={() => onSetBudget('TOTAL')}
          className="text-sm font-medium text-sky-400 hover:text-sky-300 bg-sky-500/20 px-3 py-1.5 rounded-lg transition-colors"
        >
          Manage Budgets
        </button>
      </div>

      <div className="p-6 space-y-6">
        {totals && (
          <div className="mb-8">
            <div className="flex justify-between items-end mb-2">
              <div>
                <h4 className="font-semibold text-white text-lg">Overall Budget</h4>
                <p className="text-sm text-slate-400">₹{totals.actual.toLocaleString()} spent of ₹{totals.budgeted.toLocaleString()}</p>
              </div>
              <div className={`font-bold ${totals.status === 'over' ? 'text-red-400' : 'text-green-400'}`}>
                {Math.min(100, totals.budgeted > 0 ? (totals.actual / totals.budgeted) * 100 : 0).toFixed(1)}% Used
              </div>
            </div>
            <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full ${totals.status === 'over' ? 'bg-red-500' : totals.actual / totals.budgeted > 0.9 ? 'bg-amber-500' : 'bg-green-500'}`}
                style={{ width: `${Math.min(100, totals.budgeted > 0 ? (totals.actual / totals.budgeted) * 100 : 0)}%` }}
              ></div>
            </div>
          </div>
        )}
        <div className="space-y-4">
          <h5 className="font-semibold text-slate-300 text-sm uppercase tracking-wider">By Category</h5>
          {categories.map(cat => {
            const config = EXPENSE_CATEGORY_CONFIG[cat.category as keyof typeof EXPENSE_CATEGORY_CONFIG];
            const usedPercent = cat.budgeted > 0 ? (cat.actual / cat.budgeted) * 100 : 0;
            const isOver = cat.status === 'over';
            const isNear = usedPercent >= 90 && !isOver;

            return (
              <div key={cat.category} className="group">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{config?.emoji || '💰'}</span>
                    <span className="font-medium text-slate-300 text-sm">{cat.label}</span>
                  </div>
                  <div className="text-sm flex items-center gap-2">
                    <span className="font-medium text-white">₹{cat.actual.toLocaleString()}</span>
                    <span className="text-slate-500">/</span>
                    <span className="text-slate-400">
                      {cat.budgeted > 0 ? `₹${cat.budgeted.toLocaleString()}` : 'Not set'}
                    </span>
                    <button 
                      onClick={() => onSetBudget(cat.category)}
                      className="opacity-0 group-hover:opacity-100 text-sky-400 text-xs ml-2 transition-opacity"
                    >
                      Edit
                    </button>
                  </div>
                </div>
                {cat.budgeted > 0 && (
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${isOver ? 'bg-red-500' : isNear ? 'bg-amber-500' : config?.color.replace('text', 'bg') || 'bg-slate-400'}`}
                      style={{ width: `${Math.min(100, usedPercent)}%` }}
                    ></div>
                  </div>
                )}
                {isOver && (
                  <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                    <span>⚠️</span> Over budget by ₹{Math.abs(cat.variance).toLocaleString()}
                  </p>
                )}
                {isNear && (
                  <p className="text-xs text-amber-400 mt-1 flex items-center gap-1">
                    <span>⚠️</span> Warning: {usedPercent.toFixed(1)}% of budget used
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
