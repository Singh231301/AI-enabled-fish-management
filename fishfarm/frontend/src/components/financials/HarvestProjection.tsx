import React, { useState } from 'react';
import { HarvestProjection as HarvestProjectionType } from '../../types/financials.types';
import { Edit2, Check, X } from 'lucide-react';

interface HarvestProjectionProps {
  data: HarvestProjectionType | null;
}

export const HarvestProjection: React.FC<HarvestProjectionProps> = ({ data }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [priceType, setPriceType] = useState<'kg' | 'fish'>('kg');
  const [customPrice, setCustomPrice] = useState<number | ''>('');

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

  // Calculate overridden values if custom price is set
  const currentPrice = customPrice !== '' ? customPrice : data.latestMarketPricePerKg;
  const currentType = customPrice !== '' ? priceType : 'kg';

  let projectedRevenue = data.projectedRevenue;
  if (customPrice !== '') {
    if (priceType === 'kg') {
      projectedRevenue = data.estimatedHarvestKg * customPrice;
    } else {
      projectedRevenue = data.estimatedAlive * customPrice;
    }
  }

  const projectedProfit = projectedRevenue - data.totalInvestedSoFar;
  const projectedROI = data.totalInvestedSoFar > 0 ? (projectedProfit / data.totalInvestedSoFar) * 100 : 0;

  const handleSavePrice = () => {
    setIsEditing(false);
  };

  const handleCancelPrice = () => {
    setIsEditing(false);
    setCustomPrice('');
    setPriceType('kg');
  };

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
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-800 relative group">
            {!isEditing && (
              <button 
                onClick={() => { setIsEditing(true); setCustomPrice(data.latestMarketPricePerKg); setPriceType('kg'); }} 
                className="absolute top-2 right-2 p-1 text-slate-500 hover:text-sky-400 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 rounded-md"
              >
                <Edit2 size={12} />
              </button>
            )}
            
            <p className="text-xs text-slate-400 mb-1">Market Price</p>
            
            {isEditing ? (
              <div className="mt-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="relative flex-1">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                    <input 
                      type="number"
                      value={customPrice}
                      onChange={(e) => setCustomPrice(e.target.value ? Number(e.target.value) : '')}
                      className="w-full bg-slate-900 border border-slate-600 rounded px-6 py-1 text-sm text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <select
                    value={priceType}
                    onChange={(e) => setPriceType(e.target.value as 'kg' | 'fish')}
                    className="bg-slate-900 border border-slate-600 rounded px-1 py-1 text-xs text-slate-300 outline-none flex-1"
                  >
                    <option value="kg">per kg</option>
                    <option value="fish">per fish</option>
                  </select>
                  <div className="flex gap-1">
                    <button onClick={handleSavePrice} className="p-1 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30"><Check size={14}/></button>
                    <button onClick={handleCancelPrice} className="p-1 bg-slate-700 text-slate-300 rounded hover:bg-slate-600"><X size={14}/></button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <p className="font-bold text-white">
                  ₹{customPrice !== '' ? customPrice : data.latestMarketPricePerKg}
                  {customPrice !== '' && <span className="text-[10px] text-sky-400 ml-1 font-normal text-xs align-top">*</span>}
                </p>
                <p className="text-xs text-slate-500 mt-1">per {currentType}</p>
              </>
            )}
          </div>
        </div>

        <div className="bg-sky-900/20 rounded-xl p-5 border border-sky-500/20">
          <h4 className="font-semibold text-sky-400 mb-4 text-center">Projected Financials</h4>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-sky-300">Projected Revenue</span>
              <span className="font-bold text-sky-400">₹{Math.round(projectedRevenue).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-sky-300">Total Investment So Far</span>
              <span className="font-medium text-sky-300">₹{data.totalInvestedSoFar.toLocaleString()}</span>
            </div>
            
            <div className="border-t border-sky-500/30 my-2 pt-2 flex justify-between">
              <span className="font-semibold text-sky-400">Projected Profit</span>
              <span className={`font-bold ${projectedProfit > 0 ? 'text-green-400' : 'text-red-400'}`}>
                ₹{Math.round(projectedProfit).toLocaleString()}
              </span>
            </div>
            
            <div className="flex justify-between text-sm bg-slate-900/50 rounded-lg p-2 mt-2 border border-sky-500/20">
              <span className="font-medium text-slate-300">Expected ROI</span>
              <span className={`font-bold ${projectedROI > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {projectedROI.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
