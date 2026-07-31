import React from 'react';
import { PondWithFullDetails } from '../../types/pond.types';

interface PondStatsPanelProps {
  pond: PondWithFullDetails;
  isLoading: boolean;
}

export const PondStatsPanel: React.FC<PondStatsPanelProps> = ({ pond, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 animate-pulse">
        <div className="h-6 w-32 bg-slate-700 rounded mb-4"></div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-10 bg-slate-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  const areaBigha = pond.areaAcres * 4.84;
  const establishedDate = pond.constructionDate 
    ? new Date(pond.constructionDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : "Not recorded";

  const latestStocking = pond.fishStockings?.[0];
  let ageString = '';
  if (latestStocking) {
    const diff = Math.floor((new Date().getTime() - new Date(latestStocking.stockingDate).getTime()) / (1000 * 3600 * 24));
    ageString = `${diff} days`;
  }

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 sticky top-6">
      <h2 className="text-lg font-bold text-white mb-5">📊 Pond Overview</h2>
      
      {/* MEASUREMENTS GRID */}
      <div className="grid grid-cols-2 gap-y-4 gap-x-2 mb-6">
        <div>
          <p className="text-xs text-slate-400 mb-0.5">Area</p>
          <p className="font-semibold text-white">{new Intl.NumberFormat('en-IN').format(pond.areaSqft)} sq ft</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 mb-0.5">Acres</p>
          <p className="font-semibold text-white">{pond.areaAcres.toFixed(3)} acres</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 mb-0.5">Bigha</p>
          <p className="font-semibold text-white">{areaBigha.toFixed(2)} bigha</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 mb-0.5">Length</p>
          <p className="font-semibold text-white">{pond.lengthFt} ft</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 mb-0.5">Width</p>
          <p className="font-semibold text-white">{pond.widthFt} ft</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 mb-0.5">Max Depth</p>
          <p className="font-semibold text-white">{pond.maxDepthFt} ft</p>
        </div>
      </div>

      {/* POND DETAILS */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between items-center pb-2 border-b border-slate-700/50">
          <span className="text-sm text-slate-400">Soil Type</span>
          <span className="text-sm font-medium text-white">{pond.soilType}</span>
        </div>
        <div className="flex justify-between items-center pb-2 border-b border-slate-700/50">
          <span className="text-sm text-slate-400">Water Source</span>
          <span className="text-sm font-medium text-white truncate max-w-[120px]" title={pond.waterSource}>{pond.waterSource}</span>
        </div>
        <div className="flex justify-between items-center pb-2 border-b border-slate-700/50">
          <span className="text-sm text-slate-400">Pond Type</span>
          <span className="text-sm font-medium text-white">{pond.pondType}</span>
        </div>
        <div className="flex justify-between items-center pb-2 border-b border-slate-700/50">
          <span className="text-sm text-slate-400">Established</span>
          <span className="text-sm font-medium text-white">{establishedDate}</span>
        </div>
      </div>

      {/* ACTIVITY COUNTS */}
      <div className="pt-2 border-t border-slate-700 mb-6">
        <h3 className="text-sm font-semibold text-sky-400 uppercase tracking-wider mb-3">Activity Summary</h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-slate-750 rounded-lg p-2 flex items-center justify-between">
            <span className="text-xs text-slate-400">🍽️ Feeding</span>
            <span className="font-bold text-white text-sm">{pond._count?.feedingLogs || 0}</span>
          </div>
          <div className="bg-slate-750 rounded-lg p-2 flex items-center justify-between">
            <span className="text-xs text-slate-400">💀 Mortality</span>
            <span className="font-bold text-white text-sm">{pond._count?.mortalityLogs || 0}</span>
          </div>
          <div className="bg-slate-750 rounded-lg p-2 flex items-center justify-between">
            <span className="text-xs text-slate-400">💧 Water</span>
            <span className="font-bold text-white text-sm">{pond._count?.waterQualityLogs || 0}</span>
          </div>
          <div className="bg-slate-750 rounded-lg p-2 flex items-center justify-between">
            <span className="text-xs text-slate-400">📋 Tasks</span>
            <span className="font-bold text-white text-sm">{pond._count?.tasks || 0}</span>
          </div>
          <div className="bg-slate-750 rounded-lg p-2 flex items-center justify-between">
            <span className="text-xs text-slate-400">💰 Expenses</span>
            <span className="font-bold text-white text-sm">{pond._count?.expenses || 0}</span>
          </div>
          <div className="bg-slate-750 rounded-lg p-2 flex items-center justify-between">
            <span className="text-xs text-slate-400">💵 Sales</span>
            <span className="font-bold text-white text-sm">{pond._count?.sales || 0}</span>
          </div>
        </div>
      </div>

      {/* FISH STOCKING SUMMARY */}
      <div className="pt-4 border-t border-slate-700">
        <h3 className="text-sm font-semibold text-sky-400 uppercase tracking-wider mb-3">Latest Stocking</h3>
        {latestStocking ? (
          <div className="space-y-2 bg-sky-900/10 rounded-lg p-3 border border-sky-900/30">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400">Species</span>
              <span className="text-sm font-bold text-sky-300">{latestStocking.species}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400">Quantity</span>
              <span className="text-sm font-medium text-white">{new Intl.NumberFormat('en-IN').format(latestStocking.quantity)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400">Stocked On</span>
              <span className="text-sm font-medium text-white">
                {new Date(latestStocking.stockingDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400">Size at Stocking</span>
              <span className="text-sm font-medium text-white">{latestStocking.fingerlingSize_cm} cm</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400">Current Age</span>
              <span className="text-sm font-medium text-white bg-slate-700 px-2 py-0.5 rounded">{ageString}</span>
            </div>
          </div>
        ) : (
          <div className="text-center py-3">
            <p className="text-sm text-slate-400 mb-2">No fish stocked yet</p>
            <a href="#stocking" className="text-xs font-medium text-sky-400 hover:text-sky-300">
              Go to Fish Tracking to record stocking →
            </a>
          </div>
        )}
      </div>

      {/* NOTES */}
      {pond.notes && (
        <div className="pt-4 border-t border-slate-700 mt-4">
          <h3 className="text-sm font-semibold text-sky-400 uppercase tracking-wider mb-2">Pond Notes</h3>
          <p className="text-sm text-slate-300 whitespace-pre-wrap">{pond.notes}</p>
        </div>
      )}
    </div>
  );
};
