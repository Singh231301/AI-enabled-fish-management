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
    <div className="bg-slate-800 rounded-lg  border border-slate-700 p-5 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-500/20 text-sky-300 mb-2">
            Batch #{stocking.batchNumber}
          </span>
          <h3 className="text-lg font-bold text-white">
            {stocking.species} {stocking.localName && <span className="text-slate-400 font-normal">({stocking.localName})</span>}
          </h3>
          <p className="text-sm text-slate-400">
            Stocked on {format(new Date(stocking.stockingDate), 'MMM d, yyyy')}
          </p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => onEdit(stocking)}
            className="p-1.5 text-slate-500 hover:text-sky-400 rounded-md hover:bg-slate-700 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onDelete(stocking.id)}
            className="p-1.5 text-slate-500 hover:text-red-600 rounded-md hover:bg-slate-700 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-slate-750 p-3 rounded-md border border-slate-700/50">
          <p className="text-xs text-slate-400 mb-1">Quantity</p>
          <p className="text-lg font-semibold text-white">{stocking.quantity.toLocaleString()}</p>
        </div>
        <div className="bg-slate-750 p-3 rounded-md border border-slate-700/50">
          <p className="text-xs text-slate-400 mb-1">Avg Size</p>
          <p className="text-lg font-semibold text-white">{stocking.fingerlingSize_cm} cm</p>
        </div>
      </div>

      {stocking.sourceSupplier && (
        <div className="text-sm mb-3">
          <span className="text-slate-400">Supplier:</span> <span className="text-white">{stocking.sourceSupplier}</span>
        </div>
      )}

      {stocking.totalCost && (
        <div className="text-sm mb-3">
          <span className="text-slate-400">Total Cost:</span> <span className="text-white font-medium">₹{stocking.totalCost.toLocaleString()}</span>
          {stocking.costPerFingerling && <span className="text-xs text-slate-400 ml-1">(₹{stocking.costPerFingerling}/ea)</span>}
        </div>
      )}

      {stocking.notes && (
        <div className="mt-3 text-sm text-slate-300 border-t pt-3">
          <p className="italic">{stocking.notes}</p>
        </div>
      )}
    </div>
  );
};
