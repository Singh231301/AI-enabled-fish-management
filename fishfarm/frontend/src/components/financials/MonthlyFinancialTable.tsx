import React from 'react';
import { MonthlyCashFlow } from '../../types/financials.types';

interface MonthlyFinancialTableProps {
  data: MonthlyCashFlow[];
}

export const MonthlyFinancialTable: React.FC<MonthlyFinancialTableProps> = ({ data }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="p-5 border-b border-slate-100 bg-slate-50">
        <h3 className="font-bold text-slate-800 text-lg">Monthly Breakdown</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-700 uppercase">
            <tr>
              <th className="px-6 py-4 font-semibold border-b border-slate-200">Month</th>
              <th className="px-6 py-4 font-semibold border-b border-slate-200 text-right">Revenue</th>
              <th className="px-6 py-4 font-semibold border-b border-slate-200 text-right">Expenses</th>
              <th className="px-6 py-4 font-semibold border-b border-slate-200 text-right">Net Cash Flow</th>
              <th className="px-6 py-4 font-semibold border-b border-slate-200 text-right">Cumulative</th>
            </tr>
          </thead>
          <tbody>
            {data.slice().reverse().map((row, index) => (
              <tr key={row.month} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-700">{row.displayMonth}</td>
                <td className="px-6 py-4 text-right text-green-700 font-medium">
                  {row.revenue > 0 ? `₹${row.revenue.toLocaleString()}` : '-'}
                </td>
                <td className="px-6 py-4 text-right text-red-700 font-medium">
                  {row.expenses > 0 ? `₹${row.expenses.toLocaleString()}` : '-'}
                </td>
                <td className={`px-6 py-4 text-right font-bold ${row.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {row.netCashFlow >= 0 ? '+' : ''}₹{row.netCashFlow.toLocaleString()}
                </td>
                <td className={`px-6 py-4 text-right font-medium ${row.cumulativeCashFlow >= 0 ? 'text-sky-700' : 'text-orange-700'}`}>
                  ₹{row.cumulativeCashFlow.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
