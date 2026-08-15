import React from 'react';
import { EnrichedInventoryItem } from '../../types/inventory.types';
import { Calculator, ArrowRight, DollarSign } from 'lucide-react';

interface ReorderPlannerProps {
  lowStockItems: EnrichedInventoryItem[];
  onRecordPurchase: (item: EnrichedInventoryItem) => void;
}

export const ReorderPlanner: React.FC<ReorderPlannerProps> = ({ lowStockItems, onRecordPurchase }) => {
  if (lowStockItems.length === 0) return null;

  let totalEstimatedCost = 0;
  
  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl">
          <Calculator size={24} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Reorder Planner</h3>
          <p className="text-sm text-slate-400">Suggested purchases based on thresholds</p>
        </div>
      </div>

      <div className="space-y-4">
        {lowStockItems.map(item => {
          const suggestedAmount = item.reorderThreshold * 2; // Simple logic: reorder double the threshold
          const estCost = item.unitCost ? suggestedAmount * item.unitCost : 0;
          totalEstimatedCost += estCost;
          
          return (
            <div key={item.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-slate-800 rounded-xl border border-slate-700">
              <div className="mb-3 sm:mb-0">
                <p className="font-semibold text-white">{item.itemName}</p>
                <div className="flex space-x-4 text-xs text-slate-400 mt-1">
                  <span>Current: {item.currentQuantity} {item.unit}</span>
                  <span>Suggested: +{suggestedAmount} {item.unit}</span>
                </div>
              </div>
              <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end">
                <div className="text-right">
                  <p className="text-xs text-slate-400">Est. Cost</p>
                  <p className="font-medium text-slate-300">{estCost > 0 ? `₹${estCost.toLocaleString()}` : 'Unknown'}</p>
                </div>
                <button
                  onClick={() => onRecordPurchase(item)}
                  className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                >
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between items-center">
        <span className="text-slate-400 font-medium">Total Estimated Capital Required</span>
        <div className="flex items-center space-x-1 text-lg font-bold text-white">
          <DollarSign size={20} className="text-slate-500" />
          <span>{totalEstimatedCost > 0 ? totalEstimatedCost.toLocaleString() : '---'}</span>
        </div>
      </div>
    </div>
  );
};
