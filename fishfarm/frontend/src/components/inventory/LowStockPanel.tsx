import React from 'react';
import { EnrichedInventoryItem } from '../../types/inventory.types';
import { AlertTriangle, ShoppingCart, ArrowRight } from 'lucide-react';

interface LowStockPanelProps {
  items: EnrichedInventoryItem[];
  onRestock: (item: EnrichedInventoryItem) => void;
}

export const LowStockPanel: React.FC<LowStockPanelProps> = ({ items, onRestock }) => {
  if (items.length === 0) return null;

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 mb-8">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
          <AlertTriangle size={24} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-orange-800">Attention Required</h3>
          <p className="text-sm text-orange-600">{items.length} items need restocking</p>
        </div>
      </div>

      <div className="space-y-3">
        {items.map(item => (
          <div key={item.id} className="bg-white rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between border border-orange-100 shadow-sm">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-slate-800">{item.itemName}</span>
                {item.currentQuantity === 0 && (
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-md">OUT OF STOCK</span>
                )}
              </div>
              <div className="text-sm text-slate-500 mt-1 flex flex-wrap gap-x-4">
                <span>Current: <strong className="text-slate-700">{item.currentQuantity} {item.unit}</strong></span>
                <span>Threshold: {item.reorderThreshold} {item.unit}</span>
                {item.daysRemaining !== null && (
                  <span className="text-orange-600 font-medium">Est. {item.daysRemaining} days left</span>
                )}
              </div>
            </div>
            
            <button
              onClick={() => onRestock(item)}
              className="mt-3 md:mt-0 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ShoppingCart size={16} />
              <span>Record Purchase</span>
              <ArrowRight size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
