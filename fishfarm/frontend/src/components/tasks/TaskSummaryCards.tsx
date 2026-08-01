import React from 'react';
import { TaskStats } from '../../types/tasks.types';
import { CheckCircle2, Clock, AlertCircle, Flame, Target } from 'lucide-react';

interface TaskSummaryCardsProps {
  stats: TaskStats | null;
  isLoading: boolean;
}

export const TaskSummaryCards: React.FC<TaskSummaryCardsProps> = ({ stats, isLoading }) => {
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 animate-pulse">
            <div className="h-12 w-12 bg-slate-200 rounded-xl mb-4"></div>
            <div className="h-8 bg-slate-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  const { counts, completionStats } = stats;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
          <Clock className="w-24 h-24 text-blue-500" />
        </div>
        <div className="relative z-10">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
            <Clock className="w-6 h-6" />
          </div>
          <div className="text-3xl font-bold text-slate-800 mb-1">{counts.pending + counts.inProgress}</div>
          <div className="text-sm font-medium text-slate-500">Tasks Pending</div>
          <div className="mt-3 text-xs font-medium text-blue-600 bg-blue-50 inline-block px-2 py-1 rounded">
            {counts.dueToday} due today
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
          <CheckCircle2 className="w-24 h-24 text-green-500" />
        </div>
        <div className="relative z-10">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-4">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="text-3xl font-bold text-slate-800 mb-1">{counts.completedThisMonth}</div>
          <div className="text-sm font-medium text-slate-500">Completed This Month</div>
          <div className="mt-3 text-xs font-medium text-green-600 bg-green-50 inline-block px-2 py-1 rounded flex items-center w-fit">
            <Target className="w-3 h-3 mr-1" />
            {completionStats.completionRate.toFixed(0)}% completion rate
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
          <AlertCircle className="w-24 h-24 text-red-500" />
        </div>
        <div className="relative z-10">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="text-3xl font-bold text-slate-800 mb-1">{counts.overdue}</div>
          <div className="text-sm font-medium text-slate-500">Overdue Tasks</div>
          <div className="mt-3 text-xs font-medium bg-slate-50 text-slate-600 inline-block px-2 py-1 rounded">
            Needs attention
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl p-6 shadow-sm border border-orange-400 relative overflow-hidden group text-white">
        <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 transition-transform">
          <Flame className="w-24 h-24 text-white" />
        </div>
        <div className="relative z-10">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <div className="text-3xl font-bold mb-1">{completionStats.streak} Days</div>
          <div className="text-sm font-medium text-orange-100">Task Completion Streak</div>
          <div className="mt-3 text-xs font-medium bg-black/10 text-white inline-block px-2 py-1 rounded backdrop-blur-sm">
            Keep it up!
          </div>
        </div>
      </div>

    </div>
  );
};
