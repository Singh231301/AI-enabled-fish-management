import React from 'react';
import { PondWithCounts } from '../../types/pond.types';
import { MapPin, Edit3 } from 'lucide-react';

interface PondCardProps {
  pond: PondWithCounts;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
}

export const PondCard: React.FC<PondCardProps> = ({ pond, isSelected, onSelect, onEdit }) => {
  const totalFish = pond._count?.fishStockings > 0 
    ? pond.fishStockings?.[0]?.quantity || 0 
    : 0;
    
  const species = pond._count?.fishStockings > 0 
    ? pond.fishStockings?.[0]?.species || 'Fish' 
    : 'No fish stocked';
    
  const stockingDate = pond._count?.fishStockings > 0
    ? new Date(pond.fishStockings[0].stockingDate)
    : null;
    
  let ageString = '';
  if (stockingDate) {
    const diff = Math.floor((new Date().getTime() - stockingDate.getTime()) / (1000 * 3600 * 24));
    ageString = ` · ${diff} days old`;
  }

  return (
    <div 
      onClick={onSelect}
      className={`
        rounded-xl p-4 transition-all
        ${isSelected 
          ? 'ring-2 ring-sky-500 bg-slate-800 shadow-lg' 
          : 'bg-slate-800 border border-slate-700 hover:border-sky-600 cursor-pointer hover:shadow-md'}
      `}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-white text-lg flex items-center gap-2 truncate">
          🏞️ <span className="truncate">{pond.name}</span>
        </h3>
        
        {isSelected ? (
          <span className="bg-sky-500/20 text-sky-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shrink-0">
            Selected
          </span>
        ) : (
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            <Edit3 size={16} />
          </button>
        )}
      </div>

      <div className="flex items-center gap-1.5 text-sm text-slate-400 mb-4 truncate">
        <MapPin size={14} className="shrink-0" />
        <span className="truncate">{pond.location}</span>
      </div>

      <div className="flex items-center gap-3 text-xs text-slate-300 mb-4 bg-slate-700/30 p-2 rounded-lg justify-between">
        <div className="flex flex-col">
          <span className="text-slate-500 mb-0.5">Area</span>
          <span className="font-medium">{pond.areaAcres.toFixed(2)} ac</span>
        </div>
        <div className="w-px h-6 bg-slate-600/50"></div>
        <div className="flex flex-col">
          <span className="text-slate-500 mb-0.5">Depth</span>
          <span className="font-medium">{pond.maxDepthFt} ft</span>
        </div>
        <div className="w-px h-6 bg-slate-600/50"></div>
        <div className="flex flex-col">
          <span className="text-slate-500 mb-0.5">Type</span>
          <span className="font-medium">{pond.pondType}</span>
        </div>
      </div>

      <div className={`text-sm font-medium mb-3 ${totalFish > 0 ? 'text-sky-200' : 'text-slate-500'}`}>
        🐟 {totalFish > 0 ? `${new Intl.NumberFormat('en-IN').format(totalFish)} ${species}${ageString}` : 'No fish stocked'}
      </div>

      <div className="text-xs text-slate-400 pt-3 border-t border-slate-700/50 flex justify-between">
        <span>{pond._count?.feedingLogs || 0} feedings</span>
        <span>·</span>
        <span>{pond._count?.mortalityLogs || 0} mortality logs</span>
        <span>·</span>
        <span>{pond._count?.tasks || 0} tasks</span>
      </div>
    </div>
  );
};
