import React, { useState, useEffect } from 'react';
import { CreateMaintenanceDTO, EnrichedInventoryItem } from '../../types/inventory.types';

interface MaintenanceFormProps {
  items: EnrichedInventoryItem[];
  selectedItemId?: string;
  onSubmit: (data: CreateMaintenanceDTO) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const MaintenanceForm: React.FC<MaintenanceFormProps> = ({
  items,
  selectedItemId,
  onSubmit,
  onCancel,
  isLoading
}) => {
  const equipmentItems = items.filter(i => i.category === 'EQUIPMENT' || i.category === 'TOOL');
  
  const [formData, setFormData] = useState<Partial<CreateMaintenanceDTO>>({
    inventoryId: selectedItemId || (equipmentItems.length > 0 ? equipmentItems[0].id : ''),
    scheduledDate: '',
    maintenanceType: '',
    description: '',
    cost: undefined,
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.inventoryId && formData.scheduledDate && formData.maintenanceType) {
      onSubmit(formData as CreateMaintenanceDTO);
    }
  };

  if (equipmentItems.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p>No equipment or tools available in inventory to schedule maintenance.</p>
        <button
          onClick={onCancel}
          className="mt-4 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Select Equipment/Tool *</label>
          <select
            required
            value={formData.inventoryId}
            onChange={e => setFormData({ ...formData, inventoryId: e.target.value })}
            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow bg-white"
          >
            <option value="" disabled>Select equipment...</option>
            {equipmentItems.map(item => (
              <option key={item.id} value={item.id}>
                {item.itemName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Scheduled Date *</label>
          <input
            type="date"
            required
            min={new Date().toISOString().split('T')[0]}
            value={formData.scheduledDate}
            onChange={e => setFormData({ ...formData, scheduledDate: e.target.value })}
            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Maintenance Type *</label>
          <input
            type="text"
            required
            value={formData.maintenanceType}
            onChange={e => setFormData({ ...formData, maintenanceType: e.target.value })}
            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
            placeholder="e.g., Oil Change, Filter Replacement"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Estimated Cost (₹)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={formData.cost || ''}
            onChange={e => setFormData({ ...formData, cost: e.target.value ? parseFloat(e.target.value) : undefined })}
            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
            placeholder="Optional"
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea
            rows={2}
            value={formData.description || ''}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow resize-none"
            placeholder="Details about the required maintenance..."
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
          disabled={isLoading || !formData.inventoryId}
          className="px-6 py-2 bg-yellow-600 text-white rounded-xl hover:bg-yellow-700 transition-colors font-medium flex items-center shadow-lg shadow-yellow-600/20 disabled:opacity-70"
        >
          {isLoading ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
          ) : null}
          Schedule Maintenance
        </button>
      </div>
    </form>
  );
};
