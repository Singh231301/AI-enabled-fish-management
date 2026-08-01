import React, { useState, useEffect } from 'react';
import { RecordUsageDTO, EnrichedInventoryItem } from '../../types/inventory.types';

interface UsageFormProps {
  items: EnrichedInventoryItem[];
  selectedItemId?: string;
  onSubmit: (data: RecordUsageDTO) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const UsageForm: React.FC<UsageFormProps> = ({
  items,
  selectedItemId,
  onSubmit,
  onCancel,
  isLoading
}) => {
  const defaultDate = new Date().toISOString().split('T')[0];
  
  const [formData, setFormData] = useState<Partial<RecordUsageDTO>>({
    inventoryId: selectedItemId || (items.length > 0 ? items[0].id : ''),
    quantity: 0,
    usageDate: defaultDate,
    sourceType: 'MANUAL',
    notes: ''
  });

  const [selectedItem, setSelectedItem] = useState<EnrichedInventoryItem | null>(null);

  useEffect(() => {
    if (formData.inventoryId) {
      const item = items.find(i => i.id === formData.inventoryId);
      setSelectedItem(item || null);
    }
  }, [formData.inventoryId, items]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.inventoryId && formData.quantity && formData.usageDate) {
      if (selectedItem && formData.quantity > selectedItem.currentQuantity) {
        alert('Cannot use more than current stock level');
        return;
      }
      onSubmit(formData as RecordUsageDTO);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Select Item *</label>
          <select
            required
            value={formData.inventoryId}
            onChange={e => setFormData({ ...formData, inventoryId: e.target.value })}
            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow bg-white"
          >
            <option value="" disabled>Select an inventory item...</option>
            {items.map(item => (
              <option key={item.id} value={item.id} disabled={item.currentQuantity === 0}>
                {item.itemName} (Available: {item.currentQuantity} {item.unit}) {item.currentQuantity === 0 ? '- OUT OF STOCK' : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Usage Date *</label>
          <input
            type="date"
            required
            max={defaultDate}
            value={formData.usageDate}
            onChange={e => setFormData({ ...formData, usageDate: e.target.value })}
            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Quantity Used *</label>
          <div className="relative">
            <input
              type="number"
              required
              min="0.01"
              step="0.01"
              max={selectedItem?.currentQuantity}
              value={formData.quantity || ''}
              onChange={e => setFormData({ ...formData, quantity: parseFloat(e.target.value) })}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
            />
            <span className="absolute right-4 top-2 text-slate-400">
              {selectedItem?.unit || 'units'}
            </span>
          </div>
          {selectedItem && (formData.quantity || 0) > selectedItem.currentQuantity && (
            <p className="text-red-500 text-xs mt-1">Exceeds available stock ({selectedItem.currentQuantity} {selectedItem.unit})</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
          <input
            type="text"
            value={formData.notes || ''}
            onChange={e => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
            placeholder="Reason for usage (optional)..."
          />
        </div>
        
        <div className="md:col-span-2 text-sm text-slate-500 bg-slate-50 p-3 rounded-lg flex gap-2">
          <span className="text-blue-500">ℹ️</span>
          <p>
            For daily feeding or water treatments, prefer logging them directly in the <b>Feeding</b> or <b>Water Quality</b> modules. 
            The system will automatically deduct the used inventory. Use this form only for manual, unlogged, or adjusted usages.
          </p>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-6 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading || !formData.inventoryId || (selectedItem ? (formData.quantity || 0) > selectedItem.currentQuantity : false)}
          className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center shadow-lg shadow-blue-600/20 disabled:opacity-70"
        >
          {isLoading ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
          ) : null}
          Record Usage
        </button>
      </div>
    </form>
  );
};
