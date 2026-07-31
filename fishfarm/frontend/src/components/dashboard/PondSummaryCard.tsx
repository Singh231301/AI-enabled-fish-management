import React from 'react';
import { DashboardData, PondBasicStats } from '../../types/dashboard.types';
import { Maximize, Navigation, MapPin, Droplets } from 'lucide-react';

interface PondSummaryCardProps {
  pond: DashboardData['pond'];
  basicStats: PondBasicStats;
  isLoading: boolean;
}

export const PondSummaryCard: React.FC<PondSummaryCardProps> = ({ pond, basicStats, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 w-full animate-pulse h-[300px]">
        <div className="w-32 h-6 bg-slate-700 rounded mb-6"></div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="w-full h-12 bg-slate-700 rounded"></div>
          <div className="w-full h-12 bg-slate-700 rounded"></div>
        </div>
        <div className="w-full h-24 bg-slate-700 rounded mt-4"></div>
      </div>
    );
  }

  // Formatting helpers
  const formatNumber = (num: number) => new Intl.NumberFormat('en-IN').format(num);
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown';
    const d = new Date(dateString);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Biomass calculation
  const targetWeightGrams = 600; // Hardcoded target harvest weight for Pangasius
  const targetBiomassKg = basicStats.totalStocked > 0 ? (basicStats.totalStocked * targetWeightGrams) / 1000 : 0;
  const currentBiomassKg = basicStats.estimatedBiomassKg;
  let progressPercent = 0;
  
  if (targetBiomassKg > 0) {
    progressPercent = Math.min(100, Math.max(0, (currentBiomassKg / targetBiomassKg) * 100));
  }

  return (
    <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 w-full shadow-lg shadow-black/10">
      {/* TOP */}
      <div className="mb-5">
        <h3 className="text-base font-semibold text-white flex items-center gap-2">
          <span>🏞️</span> Pond Overview
        </h3>
        <p className="text-sm text-sky-400 mt-0.5">{pond.name}</p>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-2 gap-y-4 gap-x-6 mb-5">
        <div className="flex items-start gap-2.5">
          <Maximize size={16} className="text-slate-500 mt-0.5" />
          <div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-medium mb-0.5">Area</div>
            <div className="text-sm text-slate-200 font-medium">{pond.areaAcres} acres</div>
            <div className="text-xs text-slate-500">{formatNumber(pond.areaSqft)} sq ft</div>
          </div>
        </div>
        
        <div className="flex items-start gap-2.5">
          <Navigation size={16} className="text-slate-500 mt-0.5 rotate-180" />
          <div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-medium mb-0.5">Max Depth</div>
            <div className="text-sm text-slate-200 font-medium">6 ft</div> {/* Hardcoded based on prompt design */}
          </div>
        </div>
        
        <div className="flex items-start gap-2.5">
          <MapPin size={16} className="text-slate-500 mt-0.5" />
          <div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-medium mb-0.5">Location</div>
            <div className="text-sm text-slate-200 font-medium line-clamp-2" title={pond.location}>
              {pond.location}
            </div>
          </div>
        </div>
        
        <div className="flex items-start gap-2.5">
          <Droplets size={16} className="text-slate-500 mt-0.5" />
          <div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-medium mb-0.5">Water Source</div>
            <div className="text-sm text-slate-200 font-medium line-clamp-1">Rainwater + Tube Well</div>
          </div>
        </div>
      </div>

      {/* FISH SECTION */}
      <div className="pt-4 border-t border-slate-700/60 mb-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-medium mb-0.5">Species</div>
            <div className="text-sm text-slate-200 font-medium">{basicStats.species || 'Pangasius (Pyasi)'}</div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-medium mb-0.5">Stocked</div>
            <div className="text-sm text-slate-200 font-medium">{formatNumber(basicStats.totalStocked)} fingerlings</div>
            <div className="text-xs text-slate-500 mt-0.5">
              {formatDate(basicStats.stockingDate)} 
              {basicStats.fishAgeDays > 0 ? ` (${basicStats.fishAgeDays} days ago)` : ''}
            </div>
          </div>
        </div>
      </div>

      {/* BIOMASS METER */}
      <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
        <div className="flex justify-between items-end mb-2">
          <div className="text-xs text-slate-400 font-medium">Estimated Biomass</div>
          <div className="text-lg font-bold text-green-400">{currentBiomassKg.toFixed(1)} <span className="text-sm font-normal text-green-500">kg</span></div>
        </div>
        
        <div className="w-full bg-slate-800 rounded-full h-2.5 mb-1.5 overflow-hidden">
          <div 
            className="bg-green-500 h-2.5 rounded-full transition-all duration-1000 ease-out relative" 
            style={{ width: `${progressPercent}%` }}
          >
            <div className="absolute top-0 right-0 bottom-0 left-0 bg-white/20 w-full animate-[shimmer_2s_infinite]"></div>
          </div>
        </div>
        
        <div className="flex justify-between items-center text-[10px] text-slate-500">
          <span>0 kg</span>
          <span>Target: harvest at ~{targetWeightGrams}g avg weight ({targetBiomassKg.toFixed(0)} kg)</span>
        </div>
      </div>
    </div>
  );
};
