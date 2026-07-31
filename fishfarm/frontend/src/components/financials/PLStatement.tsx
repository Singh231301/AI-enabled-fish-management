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
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <h3 className="font-bold text-slate-800 text-lg">Profit & Loss Statement</h3>
        <button 
          onClick={() => generatePLStatement(data, farmDetails)}
          className="text-sm font-medium text-sky-600 hover:text-sky-700 bg-sky-50 px-3 py-1.5 rounded-lg transition-colors"
        >
          Download PDF
        </button>
      </div>
      
      <div className="p-6">
        <div className="text-center mb-6">
          <h4 className="font-semibold text-slate-700">{farmDetails.name}</h4>
          <p className="text-sm text-slate-500 uppercase tracking-wider mt-1">{data.period.replace('_', ' ')}</p>
        </div>

        <div className="space-y-6">
          {/* INCOME SECTION */}
          <div>
            <h5 className="font-bold text-slate-800 mb-3 uppercase tracking-wider text-sm border-b pb-1 border-slate-200">Income</h5>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Fish Sales</span>
                <span className="font-medium">₹{data.incomeBySource.fishSales.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Other Income</span>
                <span className="font-medium">₹{data.incomeBySource.otherIncome.toLocaleString()}</span>
              </div>
            </div>
            <div className="flex justify-between font-bold text-slate-800 bg-slate-50 p-2 mt-3 rounded-lg border border-slate-100">
              <span>Total Income</span>
              <span>₹{data.totalIncome.toLocaleString()}</span>
            </div>
          </div>

          {/* EXPENSES SECTION */}
          <div>
            <h5 className="font-bold text-slate-800 mb-3 uppercase tracking-wider text-sm border-b pb-1 border-slate-200">Expenses</h5>
            <div className="space-y-2">
              {data.expensesByCategory.length === 0 ? (
                <p className="text-sm text-slate-500 italic">No expenses recorded for this period.</p>
              ) : (
                data.expensesByCategory.map((expense) => (
                  <div key={expense.category} className="flex justify-between text-sm">
                    <span className="text-slate-600">{expense.label}</span>
                    <span className="font-medium">₹{expense.total.toLocaleString()}</span>
                  </div>
                ))
              )}
            </div>
            <div className="flex justify-between font-bold text-slate-800 bg-slate-50 p-2 mt-3 rounded-lg border border-slate-100">
              <span>Total Expenses</span>
              <span>₹{data.totalExpenses.toLocaleString()}</span>
            </div>
          </div>

          {/* NET PROFIT SECTION */}
          <div className={`p-4 rounded-xl border ${data.isProfitable ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex justify-between items-center">
              <span className={`font-bold text-lg ${data.isProfitable ? 'text-green-800' : 'text-red-800'}`}>
                Net {data.isProfitable ? 'Profit' : 'Loss'}
              </span>
              <span className={`font-bold text-xl ${data.isProfitable ? 'text-green-700' : 'text-red-700'}`}>
                {data.isProfitable ? '+' : ''}₹{data.netProfit.toLocaleString()}
              </span>
            </div>
            <div className="mt-1 flex justify-between items-center text-sm">
              <span className={data.isProfitable ? 'text-green-600/80' : 'text-red-600/80'}>Profit Margin</span>
              <span className={`font-medium ${data.isProfitable ? 'text-green-700' : 'text-red-700'}`}>
                {data.profitMargin.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
