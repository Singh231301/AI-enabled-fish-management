import React from 'react';
import { AISuggestedTask } from '../../types/tasks.types';
import { Sparkles, Plus, Info } from 'lucide-react';
import { TASK_PRIORITY_CONFIG } from '../../utils/constants';

interface AISuggestionsPanelProps {
  suggestions: AISuggestedTask[];
  onAccept: (task: AISuggestedTask) => void;
}

export const AISuggestionsPanel: React.FC<AISuggestionsPanelProps> = ({ suggestions, onAccept }) => {
  if (suggestions.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-fuchsia-50 to-purple-50 rounded-xl border border-fuchsia-100 p-6 mb-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
        <Sparkles className="w-32 h-32 text-fuchsia-500" />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-fuchsia-100 text-fuchsia-600 rounded-lg flex items-center justify-center mr-3">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">AI Task Suggestions</h3>
            <p className="text-sm text-slate-600">Based on fish age, season, and water quality context</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {suggestions.map((suggestion, index) => {
            const priorityConfig = TASK_PRIORITY_CONFIG[suggestion.priority] || TASK_PRIORITY_CONFIG['MEDIUM'];
            
            return (
              <div key={index} className="bg-white rounded-lg border border-fuchsia-100 p-4 shadow-sm hover:shadow-md transition-all flex flex-col h-full">
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md ${priorityConfig.color}`}>
                    {priorityConfig.label}
                  </span>
                  <span className="text-xs font-semibold text-fuchsia-600 bg-fuchsia-50 px-2 py-0.5 rounded-full flex items-center">
                    {(suggestion.aiConfidence * 100).toFixed(0)}% Match
                  </span>
                </div>
                
                <h4 className="font-bold text-slate-800 mb-1">{suggestion.title}</h4>
                <p className="text-sm text-slate-600 mb-3 flex-grow line-clamp-3">{suggestion.description}</p>
                
                <div className="flex items-start bg-slate-50 rounded p-2 mb-4">
                  <Info className="w-4 h-4 text-slate-400 mt-0.5 mr-2 shrink-0" />
                  <span className="text-xs text-slate-600">{suggestion.reason}</span>
                </div>

                <button
                  onClick={() => onAccept(suggestion)}
                  className="w-full flex items-center justify-center py-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Add Task
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
