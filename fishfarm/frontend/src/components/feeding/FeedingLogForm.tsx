import React, { useEffect } from 'react';
import { useForm as useHookForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FeedRecommendation, FeedingLog, FeedType, FishResponseType, CreateFeedingLogForm } from '../../types/feeding.types';
import { FEED_TYPE_CONFIG, FISH_RESPONSE_CONFIG } from '../../utils/constants';
import toast from 'react-hot-toast';
import { X, Clock, Scale } from 'lucide-react';

const feedingLogSchema = z.object({
  feedDate: z.string().min(1, "Date required"),
  feedTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional().or(z.literal('')),
  feedBrand: z.string().max(100).optional(),
  feedType: z.enum(['FLOATING_PELLET', 'SINKING_PELLET', 'MIXED', 'POWDER', 'NATURAL', 'OTHER']),
  quantityGrams: z.number().positive("Required").max(50000),
  finishTimeMinutes: z.number().positive().max(120).optional(),
  leftoverObserved: z.boolean(),
  fishResponse: z.enum(['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'REFUSED']),
  notes: z.string().max(500).optional(),
});

type FormData = z.infer<typeof feedingLogSchema>;

interface FeedingLogFormProps {
  pondId: string;
  recommendation: FeedRecommendation | null;
  existingLog?: FeedingLog;
  onSuccess: (log: any) => void;
  onCancel: () => void;
  defaultDate?: string;
  defaultTime?: string;
  isOpen: boolean;
}

export const FeedingLogForm: React.FC<FeedingLogFormProps> = ({
  pondId, recommendation, existingLog, onSuccess, onCancel, defaultDate, defaultTime, isOpen
}) => {
  const { register, handleSubmit, control, watch, setValue, formState: { errors, isSubmitting } } = useHookForm<FormData>({
    resolver: zodResolver(feedingLogSchema),
    defaultValues: {
      feedDate: existingLog?.feedDate ? new Date(existingLog.feedDate).toISOString().split('T')[0] : (defaultDate || new Date().toISOString().split('T')[0]),
      feedTime: existingLog?.feedTime || defaultTime || '',
      feedBrand: existingLog?.feedBrand || '',
      feedType: existingLog?.feedType || 'FLOATING_PELLET',
      quantityGrams: existingLog?.quantityGrams || recommendation?.perSessionGrams || 0,
      finishTimeMinutes: existingLog?.finishTimeMinutes || undefined,
      leftoverObserved: existingLog?.leftoverObserved || false,
      fishResponse: existingLog?.fishResponse || 'GOOD',
      notes: existingLog?.notes || '',
    }
  });

  const quantityGrams = watch('quantityGrams');
  const fishResponse = watch('fishResponse');
  const leftoverObserved = watch('leftoverObserved');

  const onSubmit = async (data: FormData) => {
    try {
      const payload: CreateFeedingLogForm = {
        pondId,
        feedDate: data.feedDate,
        feedTime: data.feedTime || undefined,
        feedBrand: data.feedBrand || undefined,
        feedType: data.feedType as FeedType,
        quantityGrams: data.quantityGrams,
        finishTimeMinutes: data.finishTimeMinutes,
        leftoverObserved: data.leftoverObserved,
        fishResponse: data.fishResponse as FishResponseType,
        notes: data.notes || undefined,
      };

      // Assuming API call is handled by parent, or we can import feedingApi here and call it.
      // The prompt spec says onSuccess is called with log. But it also says:
      // "On success: Create toast based on response". We'll let parent do API call and call onSuccess?
      // Wait, let's just make the API call here if we want it fully self-contained.
      // But the spec says `onSuccess: (log: FeedingLog) => void` and "On save: Call API".
      // Let's assume parent handles API or we import `feedingApi` and do it.
      // I will do it here to make it complete.
      const { feedingApi } = await import('../../api/endpoints/feeding.api');
      let result;
      if (existingLog) {
        result = await feedingApi.updateFeedingLog(existingLog.id, pondId, payload);
      } else {
        result = await feedingApi.createFeedingLog(payload);
      }

      if (data.fishResponse === 'EXCELLENT' || data.fishResponse === 'GOOD') {
        toast.success("🍽️ Feeding logged! Fish responded well.");
      } else if (data.fishResponse === 'FAIR') {
        toast.success("Feeding logged. Monitor tomorrow.");
      } else if (data.fishResponse === 'POOR') {
        toast('Feeding logged. ⚠️ Consider checking water quality.', { icon: '⚠️' });
      } else {
        toast.error("⚠️ Feed refused. Please check water quality.");
      }
      
      onSuccess(result.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save feeding log");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="bg-slate-900 rounded-xl w-full max-w-2xl border border-slate-700 shadow-2xl mt-10 mb-10">
        <div className="flex justify-between items-center p-4 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            {existingLog ? "✏️ Edit Feeding Log" : "🍽️ Log Feeding Session"}
          </h2>
          <button onClick={onCancel} className="text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {recommendation && !existingLog && (
          <div className="bg-sky-900/30 border-b border-sky-900/50 p-3 text-sky-200 text-sm text-center">
            💡 Recommended today: <span className="font-bold">{recommendation.totalDailyGrams}g</span> 
            ({recommendation.perSessionGrams}g per session)
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-6">
          {/* Section 1: Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Feed Date</label>
              <input type="date" {...register('feedDate')} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white" />
              {errors.feedDate && <p className="text-red-400 text-xs mt-1">{errors.feedDate.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Feed Time <span className="text-slate-500">(HH:MM)</span></label>
              <input type="time" {...register('feedTime')} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white" />
              {errors.feedTime && <p className="text-red-400 text-xs mt-1">{errors.feedTime.message}</p>}
            </div>
          </div>

          {/* Section 2: Feed Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Feed Type</label>
              <select {...register('feedType')} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white">
                {Object.entries(FEED_TYPE_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>{config.emoji} {config.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Brand / Name <span className="text-slate-500">(Optional)</span></label>
              <input type="text" {...register('feedBrand')} placeholder="e.g., Growel, CP" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white" />
            </div>
          </div>

          {/* Section 3: Quantity */}
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
            <label className="block text-sm font-medium text-slate-300 mb-3 text-center">Feed Quantity</label>
            
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {[300, 350, 400, 450, 500, 600].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setValue('quantityGrams', val, { shouldValidate: true })}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${quantityGrams === val ? 'bg-sky-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                >
                  {val}g
                </button>
              ))}
              {recommendation && (
                <button
                  type="button"
                  onClick={() => setValue('quantityGrams', recommendation.perSessionGrams, { shouldValidate: true })}
                  className={`px-4 py-2 rounded-full text-sm font-medium border border-green-500 transition-colors ${quantityGrams === recommendation.perSessionGrams ? 'bg-green-500 text-white' : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'}`}
                >
                  🎯 Rec: {recommendation.perSessionGrams}g
                </button>
              )}
            </div>

            <div className="relative max-w-xs mx-auto">
              <input 
                type="number" 
                {...register('quantityGrams', { valueAsNumber: true })} 
                className="w-full bg-slate-900 border-2 border-slate-600 focus:border-sky-500 rounded-xl p-4 text-3xl text-center font-bold text-white"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xl">g</span>
            </div>
            {errors.quantityGrams && <p className="text-red-400 text-xs mt-2 text-center">{errors.quantityGrams.message}</p>}

            {quantityGrams > 0 && (
              <p className="text-center text-slate-400 text-sm mt-3 flex items-center justify-center gap-1">
                <Clock size={14} /> At normal rate, should finish in ~{Math.round(quantityGrams / 50)} minutes
              </p>
            )}
          </div>

          {/* Section 4: Fish Response */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Fish Response</label>
            <div className="grid grid-cols-5 gap-2">
              {Object.entries(FISH_RESPONSE_CONFIG).map(([key, config]) => {
                const isSelected = fishResponse === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setValue('fishResponse', key as FishResponseType, { shouldValidate: true })}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${isSelected ? `${config.bgColor} border-transparent text-white ring-2 ring-white/20` : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
                  >
                    <span className="text-2xl mb-1">{config.emoji}</span>
                    <span className="text-xs font-medium">{config.label}</span>
                  </button>
                );
              })}
            </div>
            {fishResponse === 'POOR' && <p className="text-orange-400 text-sm mt-2">⚠️ Check water quality and dissolved oxygen.</p>}
            {fishResponse === 'REFUSED' && <p className="text-red-400 text-sm mt-2">🚨 Fish refused feed — check water quality NOW!</p>}
          </div>

          {/* Section 5: Finish Time & Leftover */}
          <div className="grid grid-cols-2 gap-4">
            {fishResponse !== 'REFUSED' && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Finished In <span className="text-slate-500">(min)</span></label>
                <input 
                  type="number" 
                  {...register('finishTimeMinutes', { valueAsNumber: true })} 
                  placeholder="e.g., 10" 
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white" 
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Feed Leftover Seen?</label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" {...register('leftoverObserved')} className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                <span className="ml-3 text-sm font-medium text-slate-300">Leftover</span>
              </label>
              {leftoverObserved && (
                <p className="text-amber-400 text-xs mt-2">⚠️ Consider reducing quantity next session.</p>
              )}
            </div>
          </div>

          {/* Section 6: Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Notes <span className="text-slate-500">(Optional)</span></label>
            <textarea 
              {...register('notes')} 
              placeholder="Any observations?" 
              rows={2} 
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white resize-none" 
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="px-6 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium disabled:opacity-50 flex items-center gap-2">
              {isSubmitting ? <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span> : null}
              {existingLog ? "Update Log" : "Save Log"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
