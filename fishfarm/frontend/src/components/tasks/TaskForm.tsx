import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Tag } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { Task, CreateTaskDTO, TaskCategory, TaskPriority, RecurrencePattern } from '../../types/tasks.types';
import { TASK_CATEGORY_CONFIG, TASK_PRIORITY_CONFIG, RECURRENCE_PATTERN_CONFIG } from '../../utils/constants';

interface TaskFormProps {
  task?: Task | null;
  pondId?: string;
  onClose: () => void;
  onSubmit: (data: CreateTaskDTO) => Promise<void>;
}

export const TaskForm: React.FC<TaskFormProps> = ({ task, pondId, onClose, onSubmit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState('');
  
  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<CreateTaskDTO>({
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      category: task?.category || 'DAILY',
      priority: task?.priority || 'MEDIUM',
      dueDate: task?.dueDate ? task.dueDate.split('T')[0] : new Date().toISOString().split('T')[0],
      isRecurring: task?.isRecurring || false,
      recurrencePattern: task?.recurrencePattern || 'DAILY',
      recurrenceEndDate: task?.recurrenceEndDate ? task.recurrenceEndDate.split('T')[0] : '',
      estimatedMinutes: task?.estimatedMinutes || 15,
      tags: task?.tags || [],
      pondId: pondId || task?.pondId || undefined
    }
  });

  const isRecurring = watch('isRecurring');
  const tags = watch('tags') || [];

  const handleAddTag = () => {
    if (tagInput.trim() && tags.length < 5 && !tags.includes(tagInput.trim())) {
      setValue('tags', [...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setValue('tags', tags.filter(t => t !== tagToRemove));
  };

  const handleFormSubmit = async (data: CreateTaskDTO) => {
    try {
      setIsSubmitting(true);
      if (!data.isRecurring) {
        data.recurrencePattern = undefined;
        data.recurrenceEndDate = undefined;
      }
      await onSubmit(data);
      onClose();
    } catch (error) {
      console.error("Error submitting task", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-slate-800 z-10 px-6 py-4 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">
            {task ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-900 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Task Title <span className="text-red-500">*</span></label>
              <input
                {...register('title', { required: 'Title is required', minLength: 3 })}
                className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all text-white"
                placeholder="e.g., Morning Feeding"
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
              <textarea
                {...register('description')}
                rows={3}
                className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all resize-none text-white"
                placeholder="Detailed instructions or context for this task..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Category</label>
                <select
                  {...register('category')}
                  className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none text-white"
                >
                  {Object.entries(TASK_CATEGORY_CONFIG).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Priority</label>
                <select
                  {...register('priority')}
                  className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none text-white"
                >
                  {Object.entries(TASK_PRIORITY_CONFIG).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Due Date <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="date"
                    {...register('dueDate', { required: 'Due date is required' })}
                    className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Est. Duration (Minutes)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="number"
                    min="1"
                    {...register('estimatedMinutes', { valueAsNumber: true })}
                    className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none text-white"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl space-y-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('isRecurring')}
                  className="w-5 h-5 text-sky-400 rounded border-slate-600 focus:ring-sky-500"
                />
                <span className="text-sm font-medium text-white">This is a recurring task</span>
              </label>

              {isRecurring && (
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-700">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Repeats</label>
                    <select
                      {...register('recurrencePattern')}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none text-white"
                    >
                      {Object.entries(RECURRENCE_PATTERN_CONFIG).map(([key, config]) => (
                        <option key={key} value={key}>{config.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">End Date (Optional)</label>
                    <input
                      type="date"
                      {...register('recurrenceEndDate')}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none text-white"
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Tags (Max 5)</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag, idx) => (
                  <span key={idx} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-sky-500/20 text-sky-300">
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                    <button type="button" onClick={() => handleRemoveTag(tag)} className="ml-1 text-sky-400 hover:text-sky-300">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                  placeholder="Add a tag..."
                  disabled={tags.length >= 5}
                  className="flex-1 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none disabled:opacity-50 text-white"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  disabled={tags.length >= 5 || !tagInput.trim()}
                  className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-300 disabled:opacity-50 font-medium transition-colors"
                >
                  Add
                </button>
              </div>
            </div>

          </div>

          <div className="pt-6 border-t border-slate-700 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl font-medium text-white hover:bg-slate-800/50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl font-medium bg-sky-500 text-white hover:bg-sky-600 disabled:opacity-50 transition-colors  shadow-blue-200"
            >
              {isSubmitting ? 'Saving...' : (task ? 'Update Task' : 'Create Task')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
