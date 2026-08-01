import React from 'react';
import { InventoryStats } from '../../types/inventory.types';
import { Package, AlertTriangle, IndianRupee, Activity } from 'lucide-react';

interface InventorySummaryCardsProps {
  stats: InventoryStats;
}

export const InventorySummaryCards: React.FC<InventorySummaryCardsProps> = ({ stats }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Total Items</p>
            <h3 className="text-2xl font-bold text-slate-800">{stats.stockSummary.totalItems}</h3>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Package size={24} />
          </div>
        </div>
        <div className="mt-4 flex items-center text-xs text-slate-500 space-x-2">
          <span>{stats.stockSummary.feedItems} Feed</span>
          <span>•</span>
          <span>{stats.stockSummary.chemicalItems} Chemical</span>
          <span>•</span>
          <span>{stats.stockSummary.equipmentItems} Equip</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Low Stock Alerts</p>
            <h3 className="text-2xl font-bold text-slate-800">{stats.stockSummary.lowStockCount}</h3>
          </div>
          <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
            <AlertTriangle size={24} />
          </div>
        </div>
        <div className="mt-4 flex items-center text-xs">
          {stats.stockSummary.outOfStockCount > 0 ? (
            <span className="text-red-600 font-medium">{stats.stockSummary.outOfStockCount} items out of stock</span>
          ) : (
            <span className="text-green-600 font-medium">No items out of stock</span>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Total Value</p>
            <h3 className="text-2xl font-bold text-slate-800">{formatCurrency(stats.totalInventoryValue)}</h3>
          </div>
          <div className="p-3 bg-green-50 text-green-600 rounded-xl">
            <IndianRupee size={24} />
          </div>
        </div>
        <div className="mt-4 text-xs text-slate-500">
          Estimated value of current stock
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Pending Maintenance</p>
            <h3 className="text-2xl font-bold text-slate-800">{stats.upcomingMaintenance.length}</h3>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Activity size={24} />
          </div>
        </div>
        <div className="mt-4 text-xs text-slate-500">
          Tasks due in next 7 days
        </div>
      </div>
    </div>
  );
};
