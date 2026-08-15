import React from 'react';
import { AlertCircle, ChevronRight } from 'lucide-react';

interface OverdueTaskBannerProps {
  count: number;
  onClick: () => void;
}

export const OverdueTaskBanner: React.FC<OverdueTaskBannerProps> = ({ count, onClick }) => {
  if (count === 0) return null;

  return (
    <div 
      onClick={onClick}
      className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg  cursor-pointer hover:bg-red-500/20 transition-colors group flex items-center justify-between"
    >
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <AlertCircle className="h-6 w-6 text-red-400" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-bold text-red-300">
            Action Required: Overdue Tasks
          </h3>
          <div className="text-sm text-red-700 mt-0.5">
            You have {count} task{count !== 1 ? 's' : ''} that {count !== 1 ? 'are' : 'is'} past due.
          </div>
        </div>
      </div>
      <div className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center text-sm font-medium pr-2">
        View tasks <ChevronRight className="w-4 h-4 ml-1" />
      </div>
    </div>
  );
};
