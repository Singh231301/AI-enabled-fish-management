import React from 'react';
import { Task } from '../../types/tasks.types';
import { TASK_CATEGORY_CONFIG, TASK_PRIORITY_CONFIG } from '../../utils/constants';
import { Clock, Calendar, CheckCircle2, RotateCw } from 'lucide-react';
import { format, isToday, isPast } from 'date-fns';

interface TaskTimelineViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

export const TaskTimelineView: React.FC<TaskTimelineViewProps> = ({ tasks, onTaskClick }) => {
  // Group tasks by date
  const groupedTasks: Record<string, Task[]> = {};
  
  const sortedTasks = [...tasks].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  
  sortedTasks.forEach(task => {
    const dateStr = format(new Date(task.dueDate), 'yyyy-MM-dd');
    if (!groupedTasks[dateStr]) groupedTasks[dateStr] = [];
    groupedTasks[dateStr].push(task);
  });

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="relative border-l-2 border-slate-200 ml-4 md:ml-6 space-y-12">
        
        {Object.entries(groupedTasks).map(([dateStr, dateTasks]) => {
          const date = new Date(dateStr);
          const today = isToday(date);
          const past = isPast(date) && !today;
          
          return (
            <div key={dateStr} className="relative">
              <div className={`absolute -left-[11px] top-1 h-5 w-5 rounded-full border-4 border-white ${
                today ? 'bg-blue-500' : past ? 'bg-red-400' : 'bg-slate-300'
              }`}></div>
              
              <div className="pl-8">
                <h3 className={`text-sm font-bold mb-4 uppercase tracking-wider ${
                  today ? 'text-blue-600' : past ? 'text-red-500' : 'text-slate-500'
                }`}>
                  {today ? 'Today' : format(date, 'EEEE, MMM d')}
                </h3>
                
                <div className="space-y-4">
                  {dateTasks.map(task => {
                    const categoryConfig = TASK_CATEGORY_CONFIG[task.category] || TASK_CATEGORY_CONFIG['DAILY'];
                    const priorityConfig = TASK_PRIORITY_CONFIG[task.priority] || TASK_PRIORITY_CONFIG['MEDIUM'];
                    
                    return (
                      <div 
                        key={task.id}
                        onClick={() => onTaskClick(task)}
                        className={`bg-white rounded-xl shadow-sm border p-4 cursor-pointer hover:shadow-md transition-all ${
                          task.status === 'COMPLETED' ? 'opacity-60' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${priorityConfig.color}`}>
                                {priorityConfig.label}
                              </span>
                              {task.status === 'COMPLETED' && (
                                <span className="flex items-center text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                                  <CheckCircle2 className="w-3 h-3 mr-1" /> Done
                                </span>
                              )}
                            </div>
                            <h4 className={`font-bold text-slate-800 ${task.status === 'COMPLETED' ? 'line-through' : ''}`}>
                              {task.title}
                            </h4>
                          </div>
                          {task.estimatedMinutes && (
                            <div className="flex items-center text-sm font-medium text-slate-500 bg-slate-50 px-2 py-1 rounded-lg">
                              <Clock className="w-4 h-4 mr-1" />
                              {task.estimatedMinutes}m
                            </div>
                          )}
                        </div>
                        
                        {(task.isRecurring || task.category) && (
                          <div className="flex items-center gap-3 mt-3 text-xs font-medium text-slate-500">
                            <span className="flex items-center">
                              {categoryConfig.label}
                            </span>
                            {task.isRecurring && (
                              <span className="flex items-center text-blue-600">
                                <RotateCw className="w-3 h-3 mr-1" />
                                {task.recurrencePattern}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}

        {Object.keys(groupedTasks).length === 0 && (
          <div className="pl-8 text-slate-500 font-medium">
            No tasks found for the selected filters.
          </div>
        )}
      </div>
    </div>
  );
};
