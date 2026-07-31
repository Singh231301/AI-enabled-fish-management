import React from 'react';
import { BreakEvenAnalysis } from '../../types/financials.types';

interface BreakEvenCalculatorProps {
  data: BreakEvenAnalysis;
}

export const BreakEvenCalculator: React.FC<BreakEvenCalculatorProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <h3 className="font-bold text-slate-800 text-lg">Break-Even Analysis</h3>
      </div>
      
      <div className="p-6">
        <div className="text-center mb-6">
          <div className="inline-block p-4 rounded-full bg-slate-50 border-4 border-slate-100 mb-2">
            <span className="text-3xl">{data.isBreakEvenReached ? '🎉' : '⚖️'}</span>
          </div>
          <h4 className="font-semibold text-slate-700 text-lg">
            {data.isBreakEvenReached ? "Break-Even Reached!" : "Path to Break-Even"}
          </h4>
          <p className="text-sm text-slate-500 max-w-xs mx-auto mt-1">
            {data.isBreakEvenReached 
              ? "Your sales have surpassed total investments. You are now operating in profit."
              : "Track how much more revenue is needed to cover your total costs."
            }
          </p>
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium text-slate-600">Progress</span>
            <span className="font-bold text-sky-600">{data.percentageToBreakEven.toFixed(1)}%</span>
          </div>
          <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex">
            <div 
              className={`h-full transition-all duration-1000 ${data.isBreakEvenReached ? 'bg-green-500' : 'bg-sky-500'}`}
              style={{ width: `${data.percentageToBreakEven}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Costs</p>
            <p className="font-bold text-slate-800 text-lg">₹{data.breakEvenRevenue.toLocaleString()}</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Current Revenue</p>
            <p className="font-bold text-green-700 text-lg">₹{data.currentRevenue.toLocaleString()}</p>
          </div>
        </div>

        {!data.isBreakEvenReached && (
          <div className="mt-4 bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3">
            <span className="text-blue-500 mt-0.5">ℹ️</span>
            <div>
              <p className="text-sm text-blue-900 font-medium">Remaining to Break-Even: <span className="font-bold">₹{data.revenueToBreakEven.toLocaleString()}</span></p>
              {data.breakEvenKg && (
                <p className="text-xs text-blue-700 mt-1">
                  At current market prices, you need to sell approximately <span className="font-bold">{Math.ceil(data.revenueToBreakEven / (data.currentRevenue / data.percentageToBreakEven * 100 || 80)).toLocaleString()} kg</span> more fish.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
