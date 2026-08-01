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
      <div className="bg-white rounded-2xl border p-6 text-center text-slate-500">
        No feed inventory found. Add feed items to track usage and get AI insights.
      </div>
    );
  }

  const isLowStock = feedData.lowStockItems.length > 0;
  
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
          <Fish size={24} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-800">Feed Stock Intelligence</h3>
          <p className="text-sm text-slate-600">Based on recent feeding patterns</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white">
          <p className="text-sm text-slate-500 mb-1">Total Feed in Stock</p>
          <div className="flex items-baseline">
            <span className="text-2xl font-bold text-slate-800">{feedData.totalStockKg.toLocaleString()}</span>
            <span className="text-sm text-slate-600 ml-1">kg</span>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white">
          <p className="text-sm text-slate-500 mb-1">Estimated Runway</p>
          <div className="flex items-baseline">
            <span className={`text-2xl font-bold ${feedData.estimatedDaysRemaining !== null && feedData.estimatedDaysRemaining <= 14 ? 'text-orange-600' : 'text-slate-800'}`}>
              {feedData.estimatedDaysRemaining !== null ? feedData.estimatedDaysRemaining : 'N/A'}
            </span>
            <span className="text-sm text-slate-600 ml-1">days</span>
          </div>
          {feedData.estimatedDaysRemaining !== null && feedData.estimatedDaysRemaining <= 14 && (
            <p className="text-xs text-orange-600 mt-1 font-medium">Reorder soon</p>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-semibold text-slate-800 mb-2">Detailed Breakdown</h4>
        {feedData.items.map(item => {
          const ratio = item.reorderThreshold > 0 ? item.currentQuantity / item.reorderThreshold : 1;
          const isCritical = ratio < 0.5 || item.currentQuantity === 0;
          
          return (
            <div key={item.id} className="bg-white rounded-xl p-4 border border-white shadow-sm flex flex-col md:flex-row md:items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-slate-800">{item.itemName}</span>
                  {item.currentQuantity <= item.reorderThreshold && (
                    <AlertTriangle size={14} className={isCritical ? 'text-red-500' : 'text-orange-500'} />
                  )}
                </div>
                <div className="flex space-x-4 mt-2 text-sm">
                  <div>
                    <span className="text-slate-500 text-xs block">Current</span>
                    <span className="font-medium text-slate-700">{item.currentQuantity} {item.unit}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-xs block">Avg Usage</span>
                    <span className="font-medium text-slate-700">{item.avgDailyUsageKg > 0 ? `${item.avgDailyUsageKg.toFixed(2)} ${item.unit}/day` : 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-xs block">Runway</span>
                    <span className={`font-medium ${item.daysRemaining !== null && item.daysRemaining <= 7 ? 'text-orange-600' : 'text-slate-700'}`}>
                      {item.daysRemaining !== null ? `${item.daysRemaining} days` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => onRestock(item)}
                className="mt-3 md:mt-0 px-3 py-1.5 bg-blue-50 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors"
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
