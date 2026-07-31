import React from 'react';
import { FeedingStats } from '../../types/feeding.types';
import { Scale, Flame, Activity, Package } from 'lucide-react';

interface FeedingSummaryCardsProps {
  stats: FeedingStats;
  isLoading: boolean;
}

export const FeedingSummaryCards: React.FC<FeedingSummaryCardsProps> = ({
  stats, isLoading
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-slate-800 animate-pulse rounded-xl h-28 border border-slate-700"></div>
        ))}
      </div>
    );
  }

  const { totalFeedKg, fcr, streakData, leftoverFrequencyPercent } = stats;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      
      {/* Total Feed */}
      <div className="bg-slate-900 rounded-xl border border-slate-700 p-4 shadow-md flex flex-col justify-center relative overflow-hidden group">
        <div className="absolute -right-4 -bottom-4 text-slate-800 group-hover:text-slate-700 transition-colors">
          <Package size={80} />
        </div>
        <div className="relative z-10">
          <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Package size={14} className="text-purple-400" />
            Total Feed
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {totalFeedKg.toFixed(1)} <span className="text-base font-normal text-slate-500">kg</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">For this period</div>
        </div>
      </div>

      {/* FCR */}
      <div className="bg-slate-900 rounded-xl border border-slate-700 p-4 shadow-md flex flex-col justify-center relative overflow-hidden group">
        <div className="absolute -right-4 -bottom-4 text-slate-800 group-hover:text-slate-700 transition-colors">
          <Scale size={80} />
        </div>
        <div className="relative z-10">
          <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Scale size={14} className="text-sky-400" />
            Current FCR
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {fcr ? fcr.toFixed(2) : '--'} 
          </div>
          <div className="text-xs mt-1">
            {fcr ? (
              fcr <= 1.8 ? <span className="text-green-400">Excellent</span> : <span className="text-amber-400">Needs Improvement</span>
            ) : (
              <span className="text-slate-500">Need more data</span>
            )}
          </div>
        </div>
      </div>

      {/* Streak */}
      <div className="bg-slate-900 rounded-xl border border-slate-700 p-4 shadow-md flex flex-col justify-center relative overflow-hidden group">
        <div className="absolute -right-4 -bottom-4 text-slate-800 group-hover:text-slate-700 transition-colors">
          <Flame size={80} />
        </div>
        <div className="relative z-10">
          <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Flame size={14} className="text-orange-400" />
            Consistency
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {streakData.currentStreak} <span className="text-base font-normal text-slate-500">days</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Best: <span className="text-slate-400">{streakData.longestStreak} days</span>
          </div>
        </div>
      </div>

      {/* Feed Efficiency (Leftovers) */}
      <div className="bg-slate-900 rounded-xl border border-slate-700 p-4 shadow-md flex flex-col justify-center relative overflow-hidden group">
        <div className="absolute -right-4 -bottom-4 text-slate-800 group-hover:text-slate-700 transition-colors">
          <Activity size={80} />
        </div>
        <div className="relative z-10">
          <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Activity size={14} className="text-green-400" />
            Feed Efficiency
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {100 - Math.round(leftoverFrequencyPercent)}<span className="text-base font-normal text-slate-500">%</span>
          </div>
          <div className="text-xs mt-1">
            {leftoverFrequencyPercent < 10 ? (
              <span className="text-green-400">Great accuracy</span>
            ) : (
              <span className="text-amber-400">{Math.round(leftoverFrequencyPercent)}% sessions had leftover</span>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};
