import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '../../api/axios';

interface QuickLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'feeding' | 'mortality';
  pondId: string | null;
  onSuccess: () => void;
}

const feedingSchema = z.object({
  quantityGrams: z.number().min(1, "Amount is required"),
  fishResponse: z.string().min(1, "Response is required"),
});

const mortalitySchema = z.object({
  deadCount: z.number().min(1, "Count is required"),
  probableReason: z.string().optional(),
});

type FeedingFormData = z.infer<typeof feedingSchema>;
type MortalityFormData = z.infer<typeof mortalitySchema>;

export const QuickLogModal: React.FC<QuickLogModalProps> = ({
  isOpen,
  onClose,
  type,
  pondId,
  onSuccess
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const feedingForm = useForm<FeedingFormData>({
    resolver: zodResolver(feedingSchema),
    defaultValues: { fishResponse: 'normal' }
  });

  const mortalityForm = useForm<MortalityFormData>({
    resolver: zodResolver(mortalitySchema)
  });

  if (!isOpen) return null;

  const onFeedingSubmit = async (data: FeedingFormData) => {
    if (!pondId) return;
    try {
      setIsSubmitting(true);
      setServerError(null);
      // Construct exact Date payload since API might expect it
      const d = new Date();
      
      await api.post('/feeding', {
        pondId,
        feedDate: d.toISOString().split('T')[0],
        feedTime: d.toISOString(),
        quantityGrams: data.quantityGrams,
        fishResponse: data.fishResponse,
        loggedBy: 'dashboard'
      });
      
      feedingForm.reset();
      onSuccess();
      onClose();
    } catch (err: any) {
      setServerError(err.response?.data?.message || 'Failed to log feeding');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onMortalitySubmit = async (data: MortalityFormData) => {
    if (!pondId) return;
    try {
      setIsSubmitting(true);
      setServerError(null);
      const d = new Date();
      
      await api.post('/mortality', {
        pondId,
        logDate: d.toISOString(),
        deadCount: data.deadCount,
        probableReason: data.probableReason || null,
        loggedBy: 'dashboard'
      });
      
      mortalityForm.reset();
      onSuccess();
      onClose();
    } catch (err: any) {
      setServerError(err.response?.data?.message || 'Failed to log mortality');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-xl w-full max-w-md border border-slate-700 shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">
            {type === 'feeding' ? 'Log Quick Feeding' : 'Log Mortality'}
          </h2>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-5 overflow-y-auto">
          {serverError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg">
              {serverError}
            </div>
          )}

          {type === 'feeding' && (
            <form id="quick-log-form" onSubmit={feedingForm.handleSubmit(onFeedingSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Amount Fed (grams)</label>
                <input 
                  type="number" 
                  {...feedingForm.register('quantityGrams', { valueAsNumber: true })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  placeholder="e.g. 500"
                />
                {feedingForm.formState.errors.quantityGrams && (
                  <p className="mt-1.5 text-sm text-red-400">{feedingForm.formState.errors.quantityGrams.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Fish Response</label>
                <select 
                  {...feedingForm.register('fishResponse')}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                >
                  <option value="excellent">Excellent</option>
                  <option value="normal">Normal</option>
                  <option value="poor">Poor</option>
                </select>
                {feedingForm.formState.errors.fishResponse && (
                  <p className="mt-1.5 text-sm text-red-400">{feedingForm.formState.errors.fishResponse.message}</p>
                )}
              </div>
            </form>
          )}

          {type === 'mortality' && (
            <form id="quick-log-form" onSubmit={mortalityForm.handleSubmit(onMortalitySubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Number of Dead Fish</label>
                <input 
                  type="number" 
                  {...mortalityForm.register('deadCount', { valueAsNumber: true })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  placeholder="e.g. 2"
                />
                {mortalityForm.formState.errors.deadCount && (
                  <p className="mt-1.5 text-sm text-red-400">{mortalityForm.formState.errors.deadCount.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Probable Reason (Optional)</label>
                <input 
                  type="text" 
                  {...mortalityForm.register('probableReason')}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  placeholder="e.g. Disease, Oxygen"
                />
              </div>
            </form>
          )}
        </div>

        <div className="p-4 border-t border-slate-700 flex justify-end gap-3 bg-slate-800/50 rounded-b-xl">
          <button 
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            form="quick-log-form"
            disabled={isSubmitting}
            className={`px-6 py-2 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center ${
              type === 'feeding' 
                ? 'bg-sky-500 hover:bg-sky-600 disabled:bg-sky-500/50' 
                : 'bg-red-500 hover:bg-red-600 disabled:bg-red-500/50'
            }`}
          >
            {isSubmitting ? 'Saving...' : 'Save Record'}
          </button>
        </div>
      </div>
    </div>
  );
};
