import React from 'react';
import { MaintenanceWithItem } from '../../types/inventory.types';
import { MAINTENANCE_STATUS_CONFIG } from '../../utils/constants';
import { format, differenceInDays } from 'date-fns';
import { Clock, Wrench as Tool, CheckCircle } from 'lucide-react';

interface EquipmentCardProps {
  maintenance: MaintenanceWithItem;
  onComplete: (maintenance: MaintenanceWithItem) => void;
}

export const EquipmentCard: React.FC<EquipmentCardProps> = ({ maintenance, onComplete }) => {
  const statusConfig = MAINTENANCE_STATUS_CONFIG[maintenance.status];
  const scheduledDate = new Date(maintenance.scheduledDate);
  const daysDiff = differenceInDays(scheduledDate, new Date());
  
  const isOverdue = daysDiff < 0;
  const isDueSoon = daysDiff >= 0 && daysDiff <= 7;
  
  let urgencyColor = 'text-slate-500 bg-slate-100';
  let urgencyText = `In ${daysDiff} days`;
  
  if (isOverdue) {
    urgencyColor = 'text-red-700 bg-red-100';
    urgencyText = `Overdue by ${Math.abs(daysDiff)} days`;
  } else if (daysDiff === 0) {
    urgencyColor = 'text-orange-700 bg-orange-100';
    urgencyText = 'Due Today';
  } else if (isDueSoon) {
    urgencyColor = 'text-orange-600 bg-orange-100';
  }

  return (
    <div className="bg-white rounded-2xl border p-5 transition-shadow hover:shadow-md">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-orange-50 text-orange-600">
            <Tool size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 line-clamp-1">{maintenance.inventory.itemName}</h3>
            <p className="text-xs text-slate-500">{maintenance.maintenanceType}</p>
          </div>
        </div>
        <div className={`px-2 py-1 rounded-full text-[10px] font-medium bg-${statusConfig.color}-100 text-${statusConfig.color}-700`}>
          {statusConfig.label}
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex items-center text-sm mb-2">
          <Clock size={16} className="text-slate-400 mr-2" />
          <span className="text-slate-700">{format(scheduledDate, 'dd MMM yyyy')}</span>
          <span className={`ml-2 px-2 py-0.5 rounded text-[10px] font-medium ${urgencyColor}`}>
            {urgencyText}
          </span>
        </div>
        
        {maintenance.description && (
          <p className="text-xs text-slate-500 mt-2 line-clamp-2">
            "{maintenance.description}"
          </p>
        )}
      </div>

      <div className="pt-4 border-t border-slate-100 flex justify-end">
        <button
          onClick={() => onComplete(maintenance)}
          className="flex items-center px-4 py-2 bg-green-50 text-green-700 text-sm font-medium rounded-lg hover:bg-green-100 transition-colors"
        >
          <CheckCircle size={16} className="mr-2" />
          Mark Complete
        </button>
      </div>
    </div>
  );
};
