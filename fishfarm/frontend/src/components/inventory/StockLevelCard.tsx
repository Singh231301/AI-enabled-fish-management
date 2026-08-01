import React from 'react';
import { EnrichedInventoryItem } from '../../types/inventory.types';
import { STOCK_LEVEL_CONFIG, INVENTORY_CATEGORY_CONFIG } from '../../utils/constants';
import * as Icons from 'lucide-react';

interface StockLevelCardProps {
  item: EnrichedInventoryItem;
  onClick?: (item: EnrichedInventoryItem) => void;
  onRecordUsage?: (item: EnrichedInventoryItem) => void;
  onRecordPurchase?: (item: EnrichedInventoryItem) => void;
}

export const StockLevelCard: React.FC<StockLevelCardProps> = ({
  item,
  onClick,
  onRecordUsage,
  onRecordPurchase
}) => {
  const stockConfig = STOCK_LEVEL_CONFIG[item.stockStatus];
  const catConfig = INVENTORY_CATEGORY_CONFIG[item.category];
  
  // @ts-ignore
  const IconComponent = Icons[catConfig.icon] || Icons.Box;
  
  const percentage = item.reorderThreshold > 0 
    ? Math.min(100, Math.round((item.currentQuantity / (item.reorderThreshold * 2)) * 100))
    : 100;

  return (
    <div 
      className={`bg-white rounded-2xl border p-5 transition-all duration-200 ${onClick ? 'cursor-pointer hover:shadow-md hover:border-slate-300' : ''}`}
      onClick={() => onClick && onClick(item)}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg bg-${catConfig.color}-50 text-${catConfig.color}-600`}>
            <IconComponent size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 line-clamp-1" title={item.itemName}>{item.itemName}</h3>
            <p className="text-xs text-slate-500">{catConfig.label}</p>
          </div>
        </div>
        <div className={`px-2 py-1 rounded-full text-[10px] font-medium bg-${stockConfig.color}-100 text-${stockConfig.color}-700 whitespace-nowrap`}>
          {stockConfig.label}
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between items-end mb-1">
          <span className="text-2xl font-bold text-slate-800">
            {item.currentQuantity.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            <span className="text-sm font-normal text-slate-500 ml-1">{item.unit}</span>
          </span>
          <span className="text-xs text-slate-500">
            Threshold: {item.reorderThreshold} {item.unit}
          </span>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mt-2">
          <div 
            className={`bg-${stockConfig.color}-500 h-2 rounded-full transition-all duration-500`} 
            style={{ width: `${Math.max(2, percentage)}%` }}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-sm border-t border-slate-100 pt-3 mb-4">
        <div>
          <p className="text-slate-500 text-xs">Avg Daily Usage</p>
          <p className="font-medium text-slate-700">
            {item.avgDailyUsageKg > 0 
              ? `${item.avgDailyUsageKg.toFixed(2)} ${item.unit}/day` 
              : 'N/A'}
          </p>
        </div>
        <div>
          <p className="text-slate-500 text-xs">Est. Days Left</p>
          <p className={`font-medium ${item.daysRemaining && item.daysRemaining <= 7 ? 'text-orange-600' : 'text-slate-700'}`}>
            {item.daysRemaining !== null 
              ? `${item.daysRemaining} days` 
              : 'Unknown'}
          </p>
        </div>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={(e) => { e.stopPropagation(); onRecordUsage && onRecordUsage(item); }}
          className="flex-1 px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-medium rounded-lg hover:bg-slate-200 transition-colors"
        >
          Use Stock
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onRecordPurchase && onRecordPurchase(item); }}
          className="flex-1 px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-medium rounded-lg hover:bg-blue-100 transition-colors"
        >
          Restock
        </button>
      </div>
    </div>
  );
};
