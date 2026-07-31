import React from 'react';
import { PondWithCounts } from '../../types/pond.types';
import { Plus, MapPin } from 'lucide-react';

interface PondSelectorProps {
  ponds: PondWithCounts[];
  selectedPondId: string | null;
  onSelect: (pondId: string) => void;
  onCreateNew: () => void;
  isLoading?: boolean;
}

export const PondSelector: React.FC<PondSelectorProps> = ({
  ponds,
  selectedPondId,
  onSelect,
  onCreateNew,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {[1, 2, 3].map(i => (
          <div key={i} className="min-w-[200px] h-20 bg-slate-800 rounded-xl animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (ponds.length === 0) {
    return (
      <button 
        onClick={onCreateNew}
        className="flex items-center gap-2 px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl transition-colors font-semibold"
      >
        <Plus size={20} /> Create Your First Pond
      </button>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x">
      {ponds.map(pond => {
        const isSelected = pond.id === selectedPondId;
        const totalFish = pond._count?.fishStockings > 0 
          ? pond.fishStockings?.[0]?.quantity || 0 
          : 0;
        const species = pond._count?.fishStockings > 0 
          ? pond.fishStockings?.[0]?.species || 'Fish' 
          : 'No fish stocked';

        return (
          <button
            key={pond.id}
            onClick={() => onSelect(pond.id)}
            className={`
              flex-shrink-0 w-[240px] p-3 rounded-xl border text-left transition-all snap-start
              ${isSelected 
                ? 'bg-sky-600 border-sky-500 shadow-lg shadow-sky-900/20' 
                : 'bg-slate-800 border-slate-700 hover:border-sky-500/50 hover:bg-slate-750'}
            `}
          >
            <div className="flex justify-between items-start mb-1">
              <h3 className={`font-semibold truncate max-w-[170px] ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                {pond.name}
              </h3>
              {totalFish > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${isSelected ? 'bg-sky-500 text-white' : 'bg-slate-700 text-slate-300'}`}>
                  {totalFish}
                </span>
              )}
            </div>
            
            <div className={`flex items-center gap-1 text-xs truncate mb-2 ${isSelected ? 'text-sky-100' : 'text-slate-400'}`}>
              <MapPin size={12} className="shrink-0" />
              <span className="truncate">{pond.location}</span>
            </div>
            
            <div className={`text-xs font-medium truncate ${isSelected ? 'text-sky-200' : 'text-slate-500'}`}>
              {species}
            </div>
          </button>
        );
      })}

      <button
        onClick={onCreateNew}
        title={ponds.length >= 5 ? "Maximum 5 ponds allowed" : "Add new pond"}
        disabled={ponds.length >= 5}
        className={`
          flex-shrink-0 flex items-center justify-center gap-2 w-[160px] p-3 
          rounded-xl border-2 border-dashed transition-all snap-start
          ${ponds.length >= 5 
            ? 'border-slate-700 text-slate-600 cursor-not-allowed' 
            : 'border-slate-600 text-slate-400 hover:border-sky-500 hover:text-sky-400 hover:bg-slate-800/50'}
        `}
      >
        <Plus size={18} /> 
        <span className="font-medium text-sm">Add Pond</span>
      </button>
    </div>
  );
};
