import React, { useState, useEffect } from 'react';
import { RecordPurchaseDTO, EnrichedInventoryItem } from '../../types/inventory.types';

interface PurchaseFormProps {
  items: EnrichedInventoryItem[];
  selectedItemId?: string;
  onSubmit: (data: RecordPurchaseDTO) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const PurchaseForm: React.FC<PurchaseFormProps> = ({
  items,
  selectedItemId,
  onSubmit,
  onCancel,
  isLoading
}) => {
  const defaultDate = new Date().toISOString().split('T')[0];
  
  const [formData, setFormData] = useState<Partial<RecordPurchaseDTO>>({
    inventoryId: selectedItemId || (items.length > 0 ? items[0].id : ''),
    quantity: 0,
    unitCost: undefined,
    totalCost: undefined,
    purchaseDate: defaultDate,
    supplier: '',
    invoiceNumber: '',
    notes: '',
    createExpenseRecord: true
  });

  const [selectedItem, setSelectedItem] = useState<EnrichedInventoryItem | null>(null);

  useEffect(() => {
    if (formData.inventoryId) {
      const item = items.find(i => i.id === formData.inventoryId);
      setSelectedItem(item || null);
      if (item && !formData.unitCost && item.unitCost) {
        setFormData(prev => ({ ...prev, unitCost: item.unitCost || undefined }));
      }
    }
  }, [formData.inventoryId, items]);

  useEffect(() => {
    if (formData.quantity && formData.unitCost && formData.totalCost === undefined) {
      setFormData(prev => ({ ...prev, totalCost: (prev.quantity || 0) * (prev.unitCost || 0) }));
    }
  }, [formData.quantity, formData.unitCost]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.inventoryId && formData.quantity && formData.purchaseDate) {
      onSubmit(formData as RecordPurchaseDTO);
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
              <option key={item.id} value={item.id}>
                {item.itemName} (Current: {item.currentQuantity} {item.unit})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Purchase Date *</label>
          <input
            type="date"
            required
            value={formData.purchaseDate}
            onChange={e => setFormData({ ...formData, purchaseDate: e.target.value })}
            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Quantity Purchased *</label>
          <div className="relative">
            <input
              type="number"
              required
              min="0.01"
              step="0.01"
              value={formData.quantity || ''}
              onChange={e => setFormData({ ...formData, quantity: parseFloat(e.target.value) })}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
            />
            <span className="absolute right-4 top-2 text-slate-400">
              {selectedItem?.unit || 'units'}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Unit Cost (₹)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={formData.unitCost || ''}
            onChange={e => {
              const val = parseFloat(e.target.value);
              setFormData({ 
                ...formData, 
                unitCost: isNaN(val) ? undefined : val,
                totalCost: (formData.quantity && !isNaN(val)) ? formData.quantity * val : formData.totalCost 
              });
            }}
            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Total Cost (₹)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={formData.totalCost || ''}
            onChange={e => setFormData({ ...formData, totalCost: e.target.value ? parseFloat(e.target.value) : undefined })}
            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow bg-slate-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Supplier</label>
          <input
            type="text"
            value={formData.supplier || ''}
            onChange={e => setFormData({ ...formData, supplier: e.target.value })}
            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
            placeholder={selectedItem?.supplier || "Supplier name"}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Invoice Number</label>
          <input
            type="text"
            value={formData.invoiceNumber || ''}
            onChange={e => setFormData({ ...formData, invoiceNumber: e.target.value })}
            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
            placeholder="INV-12345"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
          <input
            type="text"
            value={formData.notes || ''}
            onChange={e => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
            placeholder="Any additional details..."
          />
        </div>

        <div className="md:col-span-2 flex items-center mt-2 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
          <input
            type="checkbox"
            id="createExpense"
            checked={formData.createExpenseRecord}
            onChange={e => setFormData({ ...formData, createExpenseRecord: e.target.checked })}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-slate-300"
          />
          <label htmlFor="createExpense" className="ml-2 block text-sm text-slate-700 font-medium">
            Automatically create an Expense record in Financials for this purchase
          </label>
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
          disabled={isLoading || !formData.inventoryId}
          className="px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium flex items-center shadow-lg shadow-green-600/20 disabled:opacity-70"
        >
          {isLoading ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
          ) : null}
          Record Purchase
        </button>
      </div>
    </form>
  );
};
