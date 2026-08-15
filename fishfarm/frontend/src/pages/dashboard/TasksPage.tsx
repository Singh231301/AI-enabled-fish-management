import React, { useState, useEffect } from 'react';
import { Task, TaskOverview } from '../../types/tasks.types';
import { tasksApi } from '../../api/endpoints/tasks.api';
import { toast } from 'react-hot-toast';
import { Plus, ListTodo, Calendar, LayoutTemplate } from 'lucide-react';
import { TaskSummaryCards } from '../../components/tasks/TaskSummaryCards';
import { OverdueTaskBanner } from '../../components/tasks/OverdueTaskBanner';
import { AISuggestionsPanel } from '../../components/tasks/AISuggestionsPanel';
import { TaskKanban } from '../../components/tasks/TaskKanban';
import { TaskCalendar } from '../../components/tasks/TaskCalendar';
import { TaskForm } from '../../components/tasks/TaskForm';
import { TaskCompletionForm } from '../../components/tasks/TaskCompletionForm';
import { TaskTimelineView } from '../../components/tasks/TaskTimelineView';

export const TasksPage: React.FC = () => {
  const [overview, setOverview] = useState<TaskOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'KANBAN' | 'CALENDAR' | 'TIMELINE' | 'TEMPLATES'>('KANBAN');
  
  // Modals
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  const [completionForm, setCompletionForm] = useState<{
    isOpen: boolean;
    task: Task | null;
    mode: 'complete' | 'skip';
  }>({ isOpen: false, task: null, mode: 'complete' });

  const fetchOverview = async () => {
    try {
      setIsLoading(true);
      const res = await tasksApi.getOverview();
      if (res.success) {
        setOverview(res.data);
      }
    } catch (err) {
      toast.error('Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleCreateTask = async (data: any) => {
    try {
      if (editingTask) {
        await tasksApi.update(editingTask.id, data);
        toast.success('Task updated successfully');
      } else {
        await tasksApi.create(data);
        toast.success('Task created successfully');
      }
      fetchOverview();
    } catch (err) {
      toast.error(editingTask ? 'Failed to update task' : 'Failed to create task');
      throw err;
    }
  };

  const handleCompleteSubmit = async (data: any) => {
    if (!completionForm.task) return;
    try {
      await tasksApi.complete(completionForm.task.id, data);
      toast.success('Task completed');
      fetchOverview();
    } catch (err) {
      toast.error('Failed to complete task');
      throw err;
    }
  };

  const handleSkipSubmit = async (data: any) => {
    if (!completionForm.task) return;
    try {
      await tasksApi.skip(completionForm.task.id, data);
      toast.success('Task skipped');
      fetchOverview();
    } catch (err) {
      toast.error('Failed to skip task');
      throw err;
    }
  };

  const openEditForm = (task: Task) => {
    setEditingTask(task);
    setIsTaskFormOpen(true);
  };

  const openCompletionForm = (task: Task, mode: 'complete' | 'skip') => {
    setCompletionForm({ isOpen: true, task, mode });
  };

  const handleAIAccept = (suggestion: any) => {
    setEditingTask({
      ...suggestion,
      isAiGenerated: true,
      dueDate: suggestion.suggestedDueDate,
      recurrenceCount: 0
    } as any);
    setIsTaskFormOpen(true);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Tasks</h1>
          <p className="text-slate-500 mt-1">Manage your daily pond operations and routines</p>
        </div>
        <button
          onClick={() => { setEditingTask(null); setIsTaskFormOpen(true); }}
          className="bg-sky-500 hover:bg-sky-600 text-white px-5 py-2.5 rounded-xl font-medium flex items-center justify-center transition-colors  shadow-blue-200"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Task
        </button>
      </div>

      <TaskSummaryCards stats={overview?.stats ?? null} isLoading={isLoading} />

      {overview?.stats && overview.stats.counts.overdue > 0 && (
        <OverdueTaskBanner 
          count={overview.stats.counts.overdue} 
          onClick={() => setActiveTab('KANBAN')} 
        />
      )}

      {overview?.stats && overview.stats.aiSuggestions.length > 0 && (
        <AISuggestionsPanel 
          suggestions={overview.stats.aiSuggestions} 
          onAccept={handleAIAccept} 
        />
      )}

      <div className="bg-slate-800 rounded-xl  border border-slate-700 overflow-hidden">
        <div className="flex border-b border-slate-700 overflow-x-auto">
          <button
            onClick={() => setActiveTab('KANBAN')}
            className={`px-6 py-4 text-sm font-medium flex items-center transition-colors ${
              activeTab === 'KANBAN' ? 'border-b-2 border-sky-500 text-sky-400 bg-sky-500/10' : 'text-slate-400 hover:bg-slate-800/50'
            }`}
          >
            <ListTodo className="w-4 h-4 mr-2" />
            Board
          </button>
          <button
            onClick={() => setActiveTab('CALENDAR')}
            className={`px-6 py-4 text-sm font-medium flex items-center transition-colors ${
              activeTab === 'CALENDAR' ? 'border-b-2 border-sky-500 text-sky-400 bg-sky-500/10' : 'text-slate-400 hover:bg-slate-800/50'
            }`}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Calendar
          </button>
          <button
            onClick={() => setActiveTab('TIMELINE')}
            className={`px-6 py-4 text-sm font-medium flex items-center transition-colors ${
              activeTab === 'TIMELINE' ? 'border-b-2 border-sky-500 text-sky-400 bg-sky-500/10' : 'text-slate-400 hover:bg-slate-800/50'
            }`}
          >
            <LayoutTemplate className="w-4 h-4 mr-2" />
            Timeline
          </button>
        </div>

        <div className="p-6 bg-slate-800/50 min-h-[500px]">
          {isLoading ? (
            <div className="flex justify-center items-center h-64 text-slate-400">Loading tasks...</div>
          ) : (
            <>
              {activeTab === 'KANBAN' && (
                <TaskKanban 
                  tasks={overview?.recentTasks || []}
                  onTaskClick={openEditForm}
                  onComplete={(t) => openCompletionForm(t, 'complete')}
                  onSkip={(t) => openCompletionForm(t, 'skip')}
                />
              )}
              {activeTab === 'CALENDAR' && (
                <TaskCalendar onTaskClick={openEditForm} />
              )}
              {activeTab === 'TIMELINE' && (
                <TaskTimelineView 
                  tasks={overview?.recentTasks || []}
                  onTaskClick={openEditForm}
                />
              )}
            </>
          )}
        </div>
      </div>

      {isTaskFormOpen && (
        <TaskForm
          task={editingTask}
          onClose={() => setIsTaskFormOpen(false)}
          onSubmit={handleCreateTask}
        />
      )}

      {completionForm.isOpen && completionForm.task && (
        <TaskCompletionForm
          task={completionForm.task}
          mode={completionForm.mode}
          onClose={() => setCompletionForm({ isOpen: false, task: null, mode: 'complete' })}
          onSubmitComplete={handleCompleteSubmit}
          onSubmitSkip={handleSkipSubmit}
        />
      )}
    </div>
  );
};
