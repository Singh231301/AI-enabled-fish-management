import React, { useState, useEffect } from 'react';
import { FeedingStats } from '../../types/feeding.types';
import { inventoryApi } from '../../api/endpoints/inventory.api';
import { EnrichedInventoryItem } from '../../types/inventory.types';
import { Package, AlertTriangle, Plus, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

interface FeedInventoryPanelProps {
  pondId: string;
  currentStats: FeedingStats;
  isLoading: boolean;
}

export const FeedInventoryPanel: React.FC<FeedInventoryPanelProps> = ({
  pondId, currentStats, isLoading
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [feedItems, setFeedItems] = useState<EnrichedInventoryItem[]>([]);
  const [formData, setFormData] = useState({
    inventoryId: '',
    brand: '', // fallback for new item if inventoryId is empty
    quantityKg: '',
    cost: '',
    purchaseDate: new Date().toISOString().split('T')[0]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (pondId && showAddForm) {
      inventoryApi.getItems(pondId, { category: 'FEED', limit: 100 }).then(res => {
        setFeedItems(res.data);
      }).catch(err => {
        console.error("Failed to fetch feed inventory items", err);
      });
    }
  }, [pondId, showAddForm]);

  if (isLoading) {
    return <div className="bg-slate-800 animate-pulse rounded-xl h-64 border border-slate-700 w-full mb-6"></div>;
  }

  const { totalFeedKg, averageDailyGrams, dailyTrend } = currentStats;

  // Calculate this month and this week feed from dailyTrend
  const thisMonth = new Date().getMonth();
  const monthFeedKg = dailyTrend
    .filter(d => new Date(d.date).getMonth() === thisMonth)
    .reduce((sum, d) => sum + d.totalGrams, 0) / 1000;
  
  const weekFeedKg = dailyTrend.slice(-7)
    .reduce((sum, d) => sum + d.totalGrams, 0) / 1000;

  // Estimates
  const bag10kgDays = averageDailyGrams > 0 ? Math.round(10000 / averageDailyGrams) : 0;
  const bag25kgDays = averageDailyGrams > 0 ? Math.round(25000 / averageDailyGrams) : 0;
  
  // Fake inventory for Phase 3A
  const daysEstimate = 14; 

  const handleRecordPurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!formData.inventoryId && !formData.brand) || !formData.quantityKg || !formData.cost) {
      toast.error("Please fill all required fields");
      return;
    }
    
    setIsSubmitting(true);
    try {
      let invId = formData.inventoryId;
      if (!invId && formData.brand) {
        // Create new item first if brand is provided instead of selecting
        const newItem = await inventoryApi.createItem({
          pondId,
          itemName: formData.brand,
          category: 'FEED',
          currentQuantity: 0,
          unit: 'kg',
          reorderThreshold: 100
        });
        invId = newItem.id;
      }

      await inventoryApi.recordPurchase({
        inventoryId: invId,
        pondId: pondId,
        quantity: Number(formData.quantityKg),
        totalCost: Number(formData.cost),
        purchaseDate: formData.purchaseDate,
        createExpenseRecord: true
      });

      toast.success("Purchase recorded and expense added to Financials");
      setShowAddForm(false);
      setFormData({
        inventoryId: '',
        brand: '',
        quantityKg: '',
        cost: '',
        purchaseDate: new Date().toISOString().split('T')[0]
      });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to record purchase");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 shadow-lg h-full flex flex-col mb-6">
      <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-700">
        <h3 className="text-white font-bold flex items-center gap-2">
          <Package size={18} className="text-purple-400" />
          Feed Consumption & Inventory
        </h3>
        {!showAddForm && (
          <button 
            onClick={() => setShowAddForm(true)}
            className="p-1 bg-slate-700 hover:bg-slate-600 rounded text-slate-300 transition-colors flex items-center gap-1 text-xs px-2"
          >
            <Plus size={14} /> Record Purchase
          </button>
        )}
      </div>

      {showAddForm ? (
        <form onSubmit={handleRecordPurchase} className="flex-grow flex flex-col gap-3">
          <h4 className="text-sm font-medium text-white mb-1">Record Feed Purchase</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs text-slate-400 mb-1">Feed Item / Brand</label>
              {feedItems.length > 0 ? (
                <div className="flex flex-col gap-1">
                  <select 
                    value={formData.inventoryId} 
                    onChange={e => setFormData({...formData, inventoryId: e.target.value, brand: ''})} 
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-sm"
                  >
                    <option value="">-- Create New Feed --</option>
                    {feedItems.map(item => (
                      <option key={item.id} value={item.id}>{item.itemName} (Stock: {item.currentQuantity}kg)</option>
                    ))}
                  </select>
                  {!formData.inventoryId && (
                    <input type="text" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-sm mt-1" placeholder="New brand name (e.g. CP, Growel)" />
                  )}
                </div>
              ) : (
                <input type="text" required value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-sm" placeholder="e.g. CP, Growel" />
              )}
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Quantity (kg)</label>
              <input type="number" required value={formData.quantityKg} onChange={e => setFormData({...formData, quantityKg: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-sm" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Cost (₹)</label>
              <input type="number" required value={formData.cost} onChange={e => setFormData({...formData, cost: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-sm" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Date</label>
              <input type="date" required value={formData.purchaseDate} onChange={e => setFormData({...formData, purchaseDate: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-sm" />
            </div>
          </div>
          <div className="flex gap-2 mt-2">
            <button type="button" onClick={() => setShowAddForm(false)} className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium" disabled={isSubmitting}>Cancel</button>
            <button type="submit" className="flex-1 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium disabled:opacity-50" disabled={isSubmitting}>
              {isSubmitting ? 'Recording...' : 'Record'}
            </button>
          </div>
        </form>
      ) : (
        <div className="flex-grow flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-700">
              <div className="text-xs text-slate-400 mb-1">Total Consumed</div>
              <div className="text-xl font-bold text-white">{totalFeedKg.toFixed(1)} <span className="text-sm font-normal text-slate-500">kg</span></div>
            </div>
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-700">
              <div className="text-xs text-slate-400 mb-1">Avg Per Day</div>
              <div className="text-xl font-bold text-sky-400">{averageDailyGrams} <span className="text-sm font-normal text-slate-500">g</span></div>
            </div>
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-700">
              <div className="text-xs text-slate-400 mb-1">This Month</div>
              <div className="text-lg font-bold text-white">{monthFeedKg.toFixed(1)} <span className="text-sm font-normal text-slate-500">kg</span></div>
            </div>
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-700">
              <div className="text-xs text-slate-400 mb-1">This Week</div>
              <div className="text-lg font-bold text-white">{weekFeedKg.toFixed(1)} <span className="text-sm font-normal text-slate-500">kg</span></div>
            </div>
          </div>

          <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm text-slate-300 font-medium">
              <Activity size={16} className="text-purple-400" />
              Consumption Estimates
            </div>
            <div className="text-xs text-slate-400 flex justify-between">
              <span>At current rate, 10kg bag lasts:</span>
              <span className="text-white font-medium">{bag10kgDays} days</span>
            </div>
            <div className="text-xs text-slate-400 flex justify-between border-t border-slate-800 pt-1">
              <span>A 25kg bag would last:</span>
              <span className="text-white font-medium">{bag25kgDays} days</span>
            </div>
          </div>

          <div className="mt-auto bg-amber-900/20 border border-amber-700/50 p-3 rounded-lg flex items-start gap-3">
            <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-200/80 leading-relaxed">
              Based on consumption, consider restocking feed within <span className="font-bold text-amber-400">{daysEstimate} days</span>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
