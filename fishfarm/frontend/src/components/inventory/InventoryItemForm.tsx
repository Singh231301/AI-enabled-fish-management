import React, { useState } from 'react';
import { CreateInventoryItemDTO, InventoryCategory } from '../../types/inventory.types';
import { INVENTORY_CATEGORY_CONFIG } from '../../utils/constants';

interface InventoryItemFormProps {
  initialData?: Partial<CreateInventoryItemDTO>;
  onSubmit: (data: CreateInventoryItemDTO) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const InventoryItemForm: React.FC<InventoryItemFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading
}) => {
  const [formData, setFormData] = useState<Partial<CreateInventoryItemDTO>>({
    itemName: '',
    category: 'FEED' as InventoryCategory,
    currentQuantity: 0,
    unit: 'kg',
    reorderThreshold: 0,
    unitCost: undefined,
    supplier: '',
    location: '',
    description: '',
    ...initialData
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.itemName) newErrors.itemName = 'Item name is required';
    if (formData.currentQuantity === undefined || formData.currentQuantity < 0) newErrors.currentQuantity = 'Valid quantity is required';
    if (!formData.unit) newErrors.unit = 'Unit is required';
    if (formData.reorderThreshold === undefined || formData.reorderThreshold < 0) newErrors.reorderThreshold = 'Valid threshold is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData as CreateInventoryItemDTO);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Item Name *</label>
          <input
            type="text"
            required
            value={formData.itemName}
            onChange={e => setFormData({ ...formData, itemName: e.target.value })}
            className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow ${errors.itemName ? 'border-red-500' : 'border-slate-200'}`}
            placeholder="e.g., Pangasius Starter Feed"
          />
          {errors.itemName && <p className="text-red-500 text-xs mt-1">{errors.itemName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
          <select
            value={formData.category}
            onChange={e => setFormData({ ...formData, category: e.target.value as InventoryCategory })}
            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow bg-white"
          >
            {Object.entries(INVENTORY_CATEGORY_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Initial Quantity *</label>
          <div className="flex space-x-2">
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.currentQuantity}
              onChange={e => setFormData({ ...formData, currentQuantity: parseFloat(e.target.value) })}
              className="flex-1 px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
            />
            <input
              type="text"
              required
              placeholder="Unit (kg, L)"
              value={formData.unit}
              onChange={e => setFormData({ ...formData, unit: e.target.value })}
              className="w-24 px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
            />
          </div>
          {(errors.currentQuantity || errors.unit) && (
            <p className="text-red-500 text-xs mt-1">Both quantity and unit are required</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Low Stock Alert Threshold *</label>
          <div className="relative">
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.reorderThreshold}
              onChange={e => setFormData({ ...formData, reorderThreshold: parseFloat(e.target.value) })}
              className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow ${errors.reorderThreshold ? 'border-red-500' : 'border-slate-200'}`}
            />
            <span className="absolute right-4 top-2 text-slate-400">{formData.unit}</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Unit Cost (₹)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={formData.unitCost || ''}
            onChange={e => setFormData({ ...formData, unitCost: e.target.value ? parseFloat(e.target.value) : undefined })}
            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
            placeholder="Cost per unit"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Supplier</label>
          <input
            type="text"
            value={formData.supplier || ''}
            onChange={e => setFormData({ ...formData, supplier: e.target.value })}
            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
            placeholder="Supplier name"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Storage Location</label>
          <input
            type="text"
            value={formData.location || ''}
            onChange={e => setFormData({ ...formData, location: e.target.value })}
            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
            placeholder="e.g., Main Store Room A"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea
            rows={2}
            value={formData.description || ''}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow resize-none"
            placeholder="Any additional details..."
          />
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
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center shadow-lg shadow-blue-600/20 disabled:opacity-70"
        >
          {isLoading ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
          ) : null}
          {initialData?.itemName ? 'Update Item' : 'Add Item'}
        </button>
      </div>
    </form>
  );
};
