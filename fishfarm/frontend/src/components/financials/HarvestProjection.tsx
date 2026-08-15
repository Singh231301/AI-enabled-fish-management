import React from 'react';
import { HarvestProjection as HarvestProjectionType } from '../../types/financials.types';

interface HarvestProjectionProps {
  data: HarvestProjectionType | null;
}

export const HarvestProjection: React.FC<HarvestProjectionProps> = ({ data }) => {
  if (!data) {
    return (
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-sm h-full flex flex-col items-center justify-center p-8 text-center text-slate-400">
        <span className="text-4xl mb-3">📈</span>
        <h3 className="font-semibold text-slate-300 mb-1">No Projection Available</h3>
        <p className="text-sm">Add a fish stocking record to unlock harvest projections and ROI estimates.</p>
      </div>
    );
  }

  const progress = Math.min(100, (data.currentAvgWeightGrams / data.targetHarvestWeightGrams) * 100);

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-sm">
      <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
        <h3 className="font-bold text-white text-lg">Harvest Projection & ROI</h3>
      </div>
      
      <div className="p-6">
        <div className="mb-6">
          <div className="flex justify-between items-end mb-2">
            <div>
              <p className="text-sm font-medium text-slate-400">Growth Progress</p>
              <p className="text-xs text-slate-500 mt-0.5">Target: {data.targetHarvestWeightGrams}g / fish</p>
            </div>
            <div className="text-right">
              <span className="font-bold text-lg text-white">{data.currentAvgWeightGrams}g</span>
              <span className="text-sm text-slate-400 ml-1">avg</span>
            </div>
          </div>
          <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-sky-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-800">
            <p className="text-xs text-slate-400 mb-1">Est. Harvest Vol.</p>
            <p className="font-bold text-white">{data.estimatedHarvestKg.toLocaleString()} kg</p>
            <p className="text-xs text-slate-500 mt-1">From {data.estimatedAlive.toLocaleString()} fish</p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-800">
            <p className="text-xs text-slate-400 mb-1">Current Market Price</p>
            <p className="font-bold text-white">₹{data.latestMarketPricePerKg}</p>
            <p className="text-xs text-slate-500 mt-1">per kg</p>
          </div>
        </div>

        <div className="bg-sky-900/20 rounded-xl p-5 border border-sky-500/20">
          <h4 className="font-semibold text-sky-400 mb-4 text-center">Projected Financials</h4>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-sky-300">Projected Revenue</span>
              <span className="font-bold text-sky-400">₹{data.projectedRevenue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-sky-300">Total Investment So Far</span>
              <span className="font-medium text-sky-300">₹{data.totalInvestedSoFar.toLocaleString()}</span>
            </div>
            
            <div className="border-t border-sky-500/30 my-2 pt-2 flex justify-between">
              <span className="font-semibold text-sky-400">Projected Profit</span>
              <span className={`font-bold ${data.projectedProfit > 0 ? 'text-green-400' : 'text-red-400'}`}>
                ₹{data.projectedProfit.toLocaleString()}
              </span>
            </div>
            
            <div className="flex justify-between text-sm bg-slate-900/50 rounded-lg p-2 mt-2 border border-sky-500/20">
              <span className="font-medium text-slate-300">Expected ROI</span>
              <span className={`font-bold ${data.projectedROI > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {data.projectedROI.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
