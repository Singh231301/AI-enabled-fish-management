import React from 'react';
import { Task } from '../../types/tasks.types';
import { TASK_CATEGORY_CONFIG, TASK_PRIORITY_CONFIG, TASK_STATUS_CONFIG } from '../../utils/constants';
import { Clock, Calendar, CheckCircle2, RotateCw, Sparkles, AlertCircle, XCircle } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onComplete: (task: Task) => void;
  onSkip: (task: Task) => void;
  viewMode?: 'list' | 'kanban' | 'calendar';
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onComplete, onSkip, viewMode = 'list' }) => {
  const categoryConfig = TASK_CATEGORY_CONFIG[task.category] || TASK_CATEGORY_CONFIG['DAILY'];
  const priorityConfig = TASK_PRIORITY_CONFIG[task.priority] || TASK_PRIORITY_CONFIG['MEDIUM'];
  const statusConfig = TASK_STATUS_CONFIG[task.status] || TASK_STATUS_CONFIG['PENDING'];
  
  const dueDate = new Date(task.dueDate);
  const isOverdue = task.status === 'PENDING' && isPast(dueDate) && !isToday(dueDate);

  if (viewMode === 'kanban') {
    return (
      <div className={`bg-slate-800 rounded-xl  border p-4 hover:shadow-md transition-all cursor-pointer ${isOverdue ? 'border-red-300 bg-red-50/30' : 'border-slate-700'}`} onClick={() => onEdit(task)}>
        <div className="flex justify-between items-start mb-2">
          <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md ${priorityConfig.color}`}>
            {priorityConfig.label}
          </span>
          {task.isAiGenerated && (
            <Sparkles className="w-4 h-4 text-fuchsia-500" />
          )}
        </div>
        <h4 className="font-semibold text-white mb-1 leading-tight line-clamp-2">{task.title}</h4>
        <div className="flex items-center text-xs text-slate-400 space-x-3 mt-3">
          <span className={`flex items-center ${isOverdue ? 'text-red-400 font-medium' : ''}`}>
            <Calendar className="w-3 h-3 mr-1" />
            {format(dueDate, 'MMM d')}
          </span>
          {task.isRecurring && (
            <span className="flex items-center text-sky-400">
              <RotateCw className="w-3 h-3 mr-1" />
              Recur
            </span>
          )}
        </div>
      </div>
    );
  }

  // List View
  return (
    <div className={`bg-slate-800 rounded-xl  border p-4 sm:p-5 hover:shadow-md transition-all ${isOverdue ? 'border-red-200 bg-red-50/20' : 'border-slate-700'}`}>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-md flex items-center ${priorityConfig.color}`}>
              {priorityConfig.label}
            </span>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-md flex items-center ${categoryConfig.color}`}>
              {categoryConfig.label}
            </span>
            {task.isAiGenerated && (
              <span className="text-xs font-medium px-2.5 py-1 rounded-md flex items-center bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30">
                <Sparkles className="w-3 h-3 mr-1" /> AI Suggested
              </span>
            )}
            {task.status === 'COMPLETED' && (
              <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-green-500/20 text-green-400 border border-green-500/30">
                Done {task.completedDate && format(new Date(task.completedDate), 'MMM d')}
              </span>
            )}
          </div>
          
          <h3 className="text-lg font-bold text-white mb-1 cursor-pointer hover:text-sky-400 transition-colors" onClick={() => onEdit(task)}>
            {task.title}
          </h3>
          {task.description && (
            <p className="text-sm text-slate-300 line-clamp-2 mb-3">{task.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-400">
            <div className={`flex items-center font-medium ${isOverdue ? 'text-red-400' : ''}`}>
              {isOverdue ? <AlertCircle className="w-4 h-4 mr-1.5" /> : <Calendar className="w-4 h-4 mr-1.5" />}
              {isToday(dueDate) ? 'Today' : format(dueDate, 'EEE, MMM d, yyyy')}
            </div>
            {task.estimatedMinutes && (
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1.5" />
                {task.estimatedMinutes} min
              </div>
            )}
            {task.isRecurring && (
              <div className="flex items-center text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-md">
                <RotateCw className="w-3.5 h-3.5 mr-1" />
                {task.recurrencePattern}
              </div>
            )}
            {task.tags?.length > 0 && (
              <div className="flex items-center gap-1.5">
                {task.tags.map(tag => (
                  <span key={tag} className="text-xs bg-slate-900 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {task.status !== 'COMPLETED' && task.status !== 'SKIPPED' && (
          <div className="flex sm:flex-col gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 sm:border-l border-slate-700 sm:pl-4">
            <button 
              onClick={() => onComplete(task)}
              className="flex-1 sm:flex-none flex items-center justify-center sm:justify-start px-4 py-2 bg-green-500/20 text-green-400 hover:bg-green-500/20 rounded-lg font-medium transition-colors"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Complete
            </button>
            <button 
              onClick={() => onSkip(task)}
              className="flex-1 sm:flex-none flex items-center justify-center sm:justify-start px-4 py-2 bg-slate-800/50 text-slate-300 hover:bg-slate-900 rounded-lg font-medium transition-colors"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Skip
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
