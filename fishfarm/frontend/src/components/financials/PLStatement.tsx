import React from 'react';
import { PLStatement as PLStatementType } from '../../types/financials.types';
import { generatePLStatement } from '../../utils/pdf-generator';

interface PLStatementProps {
  data: PLStatementType;
  farmDetails?: { name: string };
}

export const PLStatement: React.FC<PLStatementProps> = ({ 
  data, 
  farmDetails = { name: "AquaManager Farm" } 
}) => {
  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-sm">
      <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
        <h3 className="font-bold text-white text-lg">Profit & Loss Statement</h3>
        <button 
          onClick={() => generatePLStatement(data, farmDetails)}
          className="text-sm font-medium text-sky-400 hover:text-sky-300 bg-sky-500/20 px-3 py-1.5 rounded-lg transition-colors"
        >
          Download PDF
        </button>
      </div>
      
      <div className="p-6">
        <div className="text-center mb-6">
          <h4 className="font-semibold text-slate-300">{farmDetails.name}</h4>
          <p className="text-sm text-slate-400 uppercase tracking-wider mt-1">{data.period.replace('_', ' ')}</p>
        </div>

        <div className="space-y-6">
          {/* INCOME SECTION */}
          <div>
            <h5 className="font-bold text-white mb-3 uppercase tracking-wider text-sm border-b pb-1 border-slate-800">Income</h5>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Fish Sales</span>
                <span className="font-medium text-white">₹{data.incomeBySource.fishSales.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Other Income</span>
                <span className="font-medium text-white">₹{data.incomeBySource.otherIncome.toLocaleString()}</span>
              </div>
            </div>
            <div className="flex justify-between font-bold text-white bg-slate-800/50 p-2 mt-3 rounded-lg border border-slate-800">
              <span>Total Income</span>
              <span>₹{data.totalIncome.toLocaleString()}</span>
            </div>
          </div>

          {/* EXPENSES SECTION */}
          <div>
            <h5 className="font-bold text-white mb-3 uppercase tracking-wider text-sm border-b pb-1 border-slate-800">Expenses</h5>
            <div className="space-y-2">
              {data.expensesByCategory.length === 0 ? (
                <p className="text-sm text-slate-400 italic">No expenses recorded for this period.</p>
              ) : (
                data.expensesByCategory.map((expense) => (
                  <div key={expense.category} className="flex justify-between text-sm">
                    <span className="text-slate-400">{expense.label}</span>
                    <span className="font-medium text-white">₹{expense.total.toLocaleString()}</span>
                  </div>
                ))
              )}
            </div>
            <div className="flex justify-between font-bold text-white bg-slate-800/50 p-2 mt-3 rounded-lg border border-slate-800">
              <span>Total Expenses</span>
              <span>₹{data.totalExpenses.toLocaleString()}</span>
            </div>
          </div>

          {/* NET PROFIT SECTION */}
          <div className={`p-4 rounded-xl border ${data.isProfitable ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
            <div className="flex justify-between items-center">
              <span className={`font-bold text-lg ${data.isProfitable ? 'text-green-400' : 'text-red-400'}`}>
                Net {data.isProfitable ? 'Profit' : 'Loss'}
              </span>
              <span className={`font-bold text-xl ${data.isProfitable ? 'text-green-400' : 'text-red-400'}`}>
                {data.isProfitable ? '+' : ''}₹{data.netProfit.toLocaleString()}
              </span>
            </div>
            <div className="mt-1 flex justify-between items-center text-sm">
              <span className={data.isProfitable ? 'text-green-500/80' : 'text-red-500/80'}>Profit Margin</span>
              <span className={`font-medium ${data.isProfitable ? 'text-green-400' : 'text-red-400'}`}>
                {data.profitMargin.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
