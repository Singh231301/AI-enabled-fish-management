import React from 'react';
import { HarvestProjection as HarvestProjectionType } from '../../types/financials.types';

interface HarvestProjectionProps {
  data: HarvestProjectionType | null;
}

export const HarvestProjection: React.FC<HarvestProjectionProps> = ({ data }) => {
  if (!data) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm h-full flex flex-col items-center justify-center p-8 text-center text-slate-500">
        <span className="text-4xl mb-3">📈</span>
        <h3 className="font-semibold text-slate-700 mb-1">No Projection Available</h3>
        <p className="text-sm">Add a fish stocking record to unlock harvest projections and ROI estimates.</p>
      </div>
    );
  }

  const progress = Math.min(100, (data.currentAvgWeightGrams / data.targetHarvestWeightGrams) * 100);

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <h3 className="font-bold text-slate-800 text-lg">Harvest Projection & ROI</h3>
      </div>
      
      <div className="p-6">
        <div className="mb-6">
          <div className="flex justify-between items-end mb-2">
            <div>
              <p className="text-sm font-medium text-slate-600">Growth Progress</p>
              <p className="text-xs text-slate-400 mt-0.5">Target: {data.targetHarvestWeightGrams}g / fish</p>
            </div>
            <div className="text-right">
              <span className="font-bold text-lg text-slate-800">{data.currentAvgWeightGrams}g</span>
              <span className="text-sm text-slate-500 ml-1">avg</span>
            </div>
          </div>
          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-sky-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
            <p className="text-xs text-slate-500 mb-1">Est. Harvest Vol.</p>
            <p className="font-bold text-slate-800">{data.estimatedHarvestKg.toLocaleString()} kg</p>
            <p className="text-xs text-slate-400 mt-1">From {data.estimatedAlive.toLocaleString()} fish</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
            <p className="text-xs text-slate-500 mb-1">Current Market Price</p>
            <p className="font-bold text-slate-800">₹{data.latestMarketPricePerKg}</p>
            <p className="text-xs text-slate-400 mt-1">per kg</p>
          </div>
        </div>

        <div className="bg-sky-50 rounded-xl p-5 border border-sky-100">
          <h4 className="font-semibold text-sky-900 mb-4 text-center">Projected Financials</h4>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-sky-700">Projected Revenue</span>
              <span className="font-bold text-sky-900">₹{data.projectedRevenue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-sky-700">Total Investment So Far</span>
              <span className="font-medium text-sky-800">₹{data.totalInvestedSoFar.toLocaleString()}</span>
            </div>
            
            <div className="border-t border-sky-200 my-2 pt-2 flex justify-between">
              <span className="font-semibold text-sky-900">Projected Profit</span>
              <span className={`font-bold ${data.projectedProfit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₹{data.projectedProfit.toLocaleString()}
              </span>
            </div>
            
            <div className="flex justify-between text-sm bg-white rounded-lg p-2 mt-2 border border-sky-100">
              <span className="font-medium text-slate-700">Expected ROI</span>
              <span className={`font-bold ${data.projectedROI > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {data.projectedROI.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
