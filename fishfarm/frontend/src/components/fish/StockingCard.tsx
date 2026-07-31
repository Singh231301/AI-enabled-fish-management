import React from 'react';
import { FishStocking } from '../../types/fish.types';
import { format } from 'date-fns';
import { Edit2, Trash2 } from 'lucide-react';

interface StockingCardProps {
  stocking: FishStocking;
  onEdit: (stocking: FishStocking) => void;
  onDelete: (id: string) => void;
}

export const StockingCard: React.FC<StockingCardProps> = ({ stocking, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-2">
            Batch #{stocking.batchNumber}
          </span>
          <h3 className="text-lg font-bold text-gray-900">
            {stocking.species} {stocking.localName && <span className="text-gray-500 font-normal">({stocking.localName})</span>}
          </h3>
          <p className="text-sm text-gray-500">
            Stocked on {format(new Date(stocking.stockingDate), 'MMM d, yyyy')}
          </p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => onEdit(stocking)}
            className="p-1.5 text-gray-400 hover:text-blue-600 rounded-md hover:bg-gray-100 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onDelete(stocking.id)}
            className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-gray-100 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 p-3 rounded-md border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Quantity</p>
          <p className="text-lg font-semibold text-gray-900">{stocking.quantity.toLocaleString()}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-md border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Avg Size</p>
          <p className="text-lg font-semibold text-gray-900">{stocking.fingerlingSize_cm} cm</p>
        </div>
      </div>

      {stocking.sourceSupplier && (
        <div className="text-sm mb-3">
          <span className="text-gray-500">Supplier:</span> <span className="text-gray-900">{stocking.sourceSupplier}</span>
        </div>
      )}

      {stocking.totalCost && (
        <div className="text-sm mb-3">
          <span className="text-gray-500">Total Cost:</span> <span className="text-gray-900 font-medium">₹{stocking.totalCost.toLocaleString()}</span>
          {stocking.costPerFingerling && <span className="text-xs text-gray-500 ml-1">(₹{stocking.costPerFingerling}/ea)</span>}
        </div>
      )}

      {stocking.notes && (
        <div className="mt-3 text-sm text-gray-600 border-t pt-3">
          <p className="italic">{stocking.notes}</p>
        </div>
      )}
    </div>
  );
};
