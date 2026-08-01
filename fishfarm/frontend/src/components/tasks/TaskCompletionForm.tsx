import React, { useState } from 'react';
import { Task, CompleteTaskDTO, SkipTaskDTO } from '../../types/tasks.types';
import { X, CheckCircle2, XCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';

interface TaskCompletionFormProps {
  task: Task;
  mode: 'complete' | 'skip';
  onClose: () => void;
  onSubmitComplete?: (data: CompleteTaskDTO) => Promise<void>;
  onSubmitSkip?: (data: SkipTaskDTO) => Promise<void>;
}

export const TaskCompletionForm: React.FC<TaskCompletionFormProps> = ({ 
  task, mode, onClose, onSubmitComplete, onSubmitSkip 
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<any>({
    defaultValues: {
      completedDate: new Date().toISOString().split('T')[0],
      actualMinutes: task.estimatedMinutes || '',
      generateNext: true
    }
  });

  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      if (mode === 'complete' && onSubmitComplete) {
        await onSubmitComplete({
          completionNote: data.completionNote,
          completedDate: data.completedDate,
          actualMinutes: data.actualMinutes ? parseInt(data.actualMinutes, 10) : undefined,
          generateNext: data.generateNext
        });
      } else if (mode === 'skip' && onSubmitSkip) {
        await onSubmitSkip({
          skipReason: data.skipReason,
          generateNext: data.generateNext
        });
      }
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className={`px-6 py-4 border-b flex justify-between items-center ${mode === 'complete' ? 'bg-green-50 border-green-100 text-green-800' : 'bg-slate-50 border-slate-200 text-slate-800'}`}>
          <div className="flex items-center">
            {mode === 'complete' ? <CheckCircle2 className="w-5 h-5 mr-2" /> : <XCircle className="w-5 h-5 mr-2" />}
            <h2 className="text-lg font-bold">
              {mode === 'complete' ? 'Complete Task' : 'Skip Task'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-black/5 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-sm text-slate-500 mb-1">Task</p>
            <p className="font-semibold text-slate-800">{task.title}</p>
          </div>

          <form id="completion-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {mode === 'complete' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Completion Date</label>
                    <input
                      type="date"
                      {...register('completedDate', { required: 'Date is required' })}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Actual Time (mins)</label>
                    <input
                      type="number"
                      {...register('actualMinutes', { min: 1 })}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Notes (Optional)</label>
                  <textarea
                    {...register('completionNote')}
                    rows={3}
                    placeholder="Any findings or observations?"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none resize-none"
                  />
                </div>
              </>
            )}

            {mode === 'skip' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Reason for Skipping <span className="text-red-500">*</span></label>
                <textarea
                  {...register('skipReason', { required: 'Reason is required' })}
                  rows={3}
                  placeholder="Why is this task being skipped?"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none resize-none"
                />
                {errors.skipReason && <p className="text-red-500 text-sm mt-1">{errors.skipReason.message as string}</p>}
              </div>
            )}

            {task.isRecurring && task.recurrencePattern && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('generateNext')}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 mr-2"
                  />
                  <span className="text-sm font-medium text-blue-900">
                    Generate next occurrence automatically ({task.recurrencePattern.toLowerCase().replace(/_/g, ' ')})
                  </span>
                </label>
              </div>
            )}
          </form>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg font-medium text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="completion-form"
            disabled={isSubmitting}
            className={`px-5 py-2 rounded-lg font-medium text-white transition-colors disabled:opacity-50 ${
              mode === 'complete' 
                ? 'bg-green-600 hover:bg-green-700 shadow-sm shadow-green-200' 
                : 'bg-slate-800 hover:bg-slate-900 shadow-sm shadow-slate-300'
            }`}
          >
            {isSubmitting ? 'Saving...' : (mode === 'complete' ? 'Complete Task' : 'Skip Task')}
          </button>
        </div>
      </div>
    </div>
  );
};
