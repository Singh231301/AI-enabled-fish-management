import React, { useState } from 'react';
import { CompleteMaintenanceDTO, MaintenanceWithItem } from '../../types/inventory.types';

interface CompleteMaintenanceProps {
  maintenance: MaintenanceWithItem;
  onSubmit: (data: CompleteMaintenanceDTO) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const CompleteMaintenance: React.FC<CompleteMaintenanceProps> = ({
  maintenance,
  onSubmit,
  onCancel,
  isLoading
}) => {
  const defaultDate = new Date().toISOString().split('T')[0];
  
  const [formData, setFormData] = useState<CompleteMaintenanceDTO>({
    completedDate: defaultDate,
    cost: maintenance.cost || undefined,
    notes: '',
    nextScheduledDate: ''
  });

  const [scheduleNext, setScheduleNext] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.completedDate) {
      onSubmit({
        ...formData,
        nextScheduledDate: scheduleNext ? formData.nextScheduledDate : undefined
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
        <h4 className="font-semibold text-slate-800">{maintenance.maintenanceType}</h4>
        <p className="text-sm text-slate-600 mt-1">Equipment: {maintenance.inventory.itemName}</p>
        {maintenance.description && (
          <p className="text-sm text-slate-500 mt-2 italic">"{maintenance.description}"</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Completion Date *</label>
          <input
            type="date"
            required
            max={defaultDate}
            value={formData.completedDate}
            onChange={e => setFormData({ ...formData, completedDate: e.target.value })}
            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Actual Cost (₹)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={formData.cost || ''}
            onChange={e => setFormData({ ...formData, cost: e.target.value ? parseFloat(e.target.value) : undefined })}
            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Completion Notes</label>
          <textarea
            rows={2}
            value={formData.notes || ''}
            onChange={e => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow resize-none"
            placeholder="Details about what was done..."
          />
        </div>

        <div className="md:col-span-2 flex flex-col space-y-3 pt-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={scheduleNext}
              onChange={e => setScheduleNext(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-slate-300"
            />
            <span className="text-sm font-medium text-slate-700">Schedule next maintenance</span>
          </label>
          
          {scheduleNext && (
            <div className="pl-6 animate-in slide-in-from-top-2">
              <label className="block text-sm text-slate-600 mb-1">Next Scheduled Date</label>
              <input
                type="date"
                required={scheduleNext}
                min={defaultDate}
                value={formData.nextScheduledDate || ''}
                onChange={e => setFormData({ ...formData, nextScheduledDate: e.target.value })}
                className="w-full md:w-1/2 px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
              />
            </div>
          )}
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
          className="px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium flex items-center shadow-lg shadow-green-600/20 disabled:opacity-70"
        >
          {isLoading ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
          ) : null}
          Mark Completed
        </button>
      </div>
    </form>
  );
};
