import React from 'react';
import { Task, TaskStatus } from '../../types/tasks.types';
import { TaskCard } from './TaskCard';
import { Circle, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { isPast, isToday } from 'date-fns';

interface TaskKanbanProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onComplete: (task: Task) => void;
  onSkip: (task: Task) => void;
  onStatusChange?: (task: Task, newStatus: TaskStatus) => void;
}

export const TaskKanban: React.FC<TaskKanbanProps> = ({ tasks, onTaskClick, onComplete, onSkip, onStatusChange }) => {
  const isTaskOverdue = (t: Task) => t.status === 'PENDING' && isPast(new Date(t.dueDate)) && !isToday(new Date(t.dueDate));

  const pendingTasks = tasks.filter(t => t.status === 'PENDING' && !isTaskOverdue(t));
  const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS');
  const overdueTasks = tasks.filter(t => t.status === 'OVERDUE' || isTaskOverdue(t));
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED').slice(0, 10); // Show max 10 completed

  const columns = [
    {
      id: 'overdue',
      title: 'Overdue',
      icon: <AlertCircle className="w-5 h-5 text-red-500" />,
      tasks: overdueTasks,
      bg: 'bg-red-50/50',
      headerBorder: 'border-red-200',
      countBg: 'bg-red-500/20 text-red-700'
    },
    {
      id: 'pending',
      title: 'To Do',
      icon: <Circle className="w-5 h-5 text-slate-400" />,
      tasks: pendingTasks,
      bg: 'bg-slate-800/50/50',
      headerBorder: 'border-slate-700',
      countBg: 'bg-slate-700 text-slate-300'
    },
    {
      id: 'in_progress',
      title: 'In Progress',
      icon: <Clock className="w-5 h-5 text-sky-400" />,
      tasks: inProgressTasks,
      bg: 'bg-sky-500/10/50',
      headerBorder: 'border-sky-500/30',
      countBg: 'bg-sky-500/20 text-sky-400'
    },
    {
      id: 'completed',
      title: 'Recently Completed',
      icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
      tasks: completedTasks,
      bg: 'bg-green-500/20/50',
      headerBorder: 'border-green-500/30',
      countBg: 'bg-green-500/20 text-green-400'
    }
  ];

  return (
    <div className="flex h-[calc(100vh-220px)] overflow-x-auto gap-4 md:gap-6 pb-4 snap-x snap-mandatory md:snap-none hide-scrollbar px-2 md:px-0">
      {columns.map(col => (
        <div key={col.id} className={`snap-center flex-shrink-0 w-[85vw] max-w-[320px] md:w-80 flex flex-col rounded-xl border ${col.headerBorder} ${col.bg}`}>
          <div className="p-4 border-b border-inherit flex items-center justify-between bg-slate-800/50 rounded-t-xl">
            <div className="flex items-center gap-2">
              {col.icon}
              <h3 className="font-bold text-white">{col.title}</h3>
            </div>
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${col.countBg}`}>
              {col.tasks.length}
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {col.tasks.length === 0 ? (
              <div className="text-center py-8 text-sm text-slate-400 font-medium border-2 border-dashed border-inherit rounded-xl">
                No tasks
              </div>
            ) : (
              col.tasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={onTaskClick}
                  onComplete={onComplete}
                  onSkip={onSkip}
                  onStatusChange={onStatusChange}
                  viewMode="kanban"
                />
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
