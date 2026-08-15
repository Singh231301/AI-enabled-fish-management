import React from 'react';
import { FeedInventoryStatus, EnrichedInventoryItem } from '../../types/inventory.types';
import { Fish, AlertTriangle } from 'lucide-react';

interface FeedStockTrackerProps {
  feedData: FeedInventoryStatus;
  onRestock: (item: EnrichedInventoryItem) => void;
}

export const FeedStockTracker: React.FC<FeedStockTrackerProps> = ({ feedData, onRestock }) => {
  if (feedData.items.length === 0) {
    return (
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 text-center text-slate-400">
        No feed inventory found. Add feed items to track usage and get AI insights.
      </div>
    );
  }

  const isLowStock = feedData.lowStockItems.length > 0;
  
  return (
    <div className="bg-gradient-to-br from-blue-900/20 to-indigo-900/20 border border-blue-900/30 rounded-2xl p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl">
          <Fish size={24} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Feed Stock Intelligence</h3>
          <p className="text-sm text-slate-400">Based on recent feeding patterns</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
          <p className="text-sm text-slate-400 mb-1">Total Feed in Stock</p>
          <div className="flex items-baseline">
            <span className="text-2xl font-bold text-white">{feedData.totalStockKg.toLocaleString()}</span>
            <span className="text-sm text-slate-400 ml-1">kg</span>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
          <p className="text-sm text-slate-400 mb-1">Estimated Runway</p>
          <div className="flex items-baseline">
            <span className={`text-2xl font-bold ${feedData.estimatedDaysRemaining !== null && feedData.estimatedDaysRemaining <= 14 ? 'text-orange-400' : 'text-white'}`}>
              {feedData.estimatedDaysRemaining !== null ? feedData.estimatedDaysRemaining : 'N/A'}
            </span>
            <span className="text-sm text-slate-400 ml-1">days</span>
          </div>
          {feedData.estimatedDaysRemaining !== null && feedData.estimatedDaysRemaining <= 14 && (
            <p className="text-xs text-orange-400 mt-1 font-medium">Reorder soon</p>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-semibold text-white mb-2">Detailed Breakdown</h4>
        {feedData.items.map(item => {
          const ratio = item.reorderThreshold > 0 ? item.currentQuantity / item.reorderThreshold : 1;
          const isCritical = ratio < 0.5 || item.currentQuantity === 0;
          
          return (
            <div key={item.id} className="bg-slate-900 rounded-xl p-4 border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-white">{item.itemName}</span>
                  {item.currentQuantity <= item.reorderThreshold && (
                    <AlertTriangle size={14} className={isCritical ? 'text-red-500' : 'text-orange-500'} />
                  )}
                </div>
                <div className="flex space-x-4 mt-2 text-sm">
                  <div>
                    <span className="text-slate-400 text-xs block">Current</span>
                    <span className="font-medium text-slate-300">{item.currentQuantity} {item.unit}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs block">Avg Usage</span>
                    <span className="font-medium text-slate-300">{item.avgDailyUsageKg > 0 ? `${item.avgDailyUsageKg.toFixed(2)} ${item.unit}/day` : 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs block">Runway</span>
                    <span className={`font-medium ${item.daysRemaining !== null && item.daysRemaining <= 7 ? 'text-orange-400' : 'text-slate-300'}`}>
                      {item.daysRemaining !== null ? `${item.daysRemaining} days` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => onRestock(item)}
                className="mt-3 md:mt-0 px-3 py-1.5 bg-blue-500/20 text-blue-400 text-sm font-medium rounded-lg hover:bg-blue-500/30 transition-colors"
              >
                Restock
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
