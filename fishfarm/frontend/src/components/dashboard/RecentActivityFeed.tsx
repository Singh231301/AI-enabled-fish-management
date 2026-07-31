import React from 'react';
import { ActivityItem } from '../../types/dashboard.types';
import { UtensilsCrossed, AlertTriangle, Droplets, IndianRupee } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface RecentActivityFeedProps {
  activities: ActivityItem[];
  isLoading: boolean;
}

export const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({ activities, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 w-full">
        <h3 className="text-base font-semibold text-white mb-5">Recent Activity</h3>
        <div className="space-y-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-slate-700 shrink-0"></div>
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                <div className="h-3 bg-slate-700 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'feeding': return <UtensilsCrossed size={14} className="text-sky-400" />;
      case 'mortality': return <AlertTriangle size={14} className="text-red-400" />;
      case 'water': return <Droplets size={14} className="text-blue-400" />;
      case 'expense': return <IndianRupee size={14} className="text-emerald-400" />;
      default: return <div className="w-3 h-3 rounded-full bg-slate-500" />;
    }
  };

  const getIconBg = (type: string) => {
    switch (type) {
      case 'feeding': return 'bg-sky-500/20 border-sky-500/30';
      case 'mortality': return 'bg-red-500/20 border-red-500/30';
      case 'water': return 'bg-blue-500/20 border-blue-500/30';
      case 'expense': return 'bg-emerald-500/20 border-emerald-500/30';
      default: return 'bg-slate-700 border-slate-600';
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 w-full flex flex-col h-full">
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-base font-semibold text-white">Recent Activity</h3>
      </div>

      {activities.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
          <div className="text-slate-500 mb-3">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <p className="text-sm text-slate-400">No recent activity found.</p>
        </div>
      ) : (
        <div className="relative pl-3 flex-1 overflow-y-auto pr-2 -mr-2 custom-scrollbar">
          {/* Vertical timeline line */}
          <div className="absolute top-3 bottom-3 left-[27px] w-px bg-slate-700"></div>
          
          <div className="space-y-5">
            {activities.map((activity, index) => (
              <div key={activity.id} className="relative flex gap-4">
                <div className={`w-8 h-8 rounded-full border shrink-0 flex items-center justify-center z-10 ${getIconBg(activity.type)}`}>
                  {getIcon(activity.type)}
                </div>
                
                <div className="flex-1 pt-1.5 pb-2 border-b border-slate-700/50 last:border-0">
                  <p className="text-sm text-slate-200 leading-snug">{activity.displayText}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {formatDistanceToNow(new Date(activity.date), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
