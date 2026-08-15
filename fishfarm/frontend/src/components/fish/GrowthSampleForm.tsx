import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FishGrowthSample } from '../../types/fish.types';
import { fishApi } from '../../api/endpoints/fish.api';
import { Modal } from '../common/Modal';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

const growthSchema = z.object({
  sampleDate: z.string().min(1, "Date required"),
  fishSampledCount: z.coerce.number()
    .int("Must be whole number")
    .positive("Must be positive"),
  averageWeightGrams: z.coerce.number()
    .positive("Must be positive"),
  minWeightGrams: z.coerce.number().positive().optional().or(z.literal('')),
  maxWeightGrams: z.coerce.number().positive().optional().or(z.literal('')),
  notes: z.string().max(500).optional(),
}).refine(data => {
  const min = data.minWeightGrams ? Number(data.minWeightGrams) : undefined;
  const max = data.maxWeightGrams ? Number(data.maxWeightGrams) : undefined;
  if (min && max && min > max) return false;
  return true;
}, {
  message: "Min weight cannot be greater than max",
  path: ["minWeightGrams"]
});

type GrowthFormData = z.infer<typeof growthSchema>;

interface GrowthSampleFormProps {
  pondId: string;
  existingSample?: FishGrowthSample;
  onSuccess: (sample: FishGrowthSample) => void;
  onCancel: () => void;
}

export const GrowthSampleForm: React.FC<GrowthSampleFormProps> = ({
  pondId,
  existingSample,
  onSuccess,
  onCancel
}) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<GrowthFormData>({
    resolver: zodResolver(growthSchema),
    defaultValues: existingSample ? {
      sampleDate: existingSample.sampleDate.split('T')[0],
      fishSampledCount: existingSample.fishSampledCount,
      averageWeightGrams: existingSample.averageWeightGrams,
      minWeightGrams: existingSample.minWeightGrams || undefined,
      maxWeightGrams: existingSample.maxWeightGrams || undefined,
      notes: existingSample.notes || undefined,
    } : {
      sampleDate: format(new Date(), 'yyyy-MM-dd'),
      fishSampledCount: 10,
    }
  });

  const onSubmit = async (data: GrowthFormData) => {
    try {
      setIsSubmitting(true);
      const payload = {
        ...data,
        minWeightGrams: data.minWeightGrams ? Number(data.minWeightGrams) : undefined,
        maxWeightGrams: data.maxWeightGrams ? Number(data.maxWeightGrams) : undefined,
      };

      if (existingSample) {
        const res = await fishApi.updateGrowthSample(existingSample.id, payload);
        toast.success("Growth sample updated!");
        onSuccess(res.data);
      } else {
        const res = await fishApi.createGrowthSample({ ...payload, pondId });
        toast.success(`Growth sample recorded!`);
        onSuccess(res.data);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save growth sample");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onCancel}
      title={existingSample ? "✏️ Edit Growth Sample" : "⚖️ Record Growth Sample"}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Sample Date *</label>
            <input
              type="date"
              {...register("sampleDate")}
              className={`w-full px-3 py-2 bg-slate-800 text-white border rounded-md  focus:ring-sky-500 focus:border-sky-500 ${errors.sampleDate ? 'border-red-500' : 'border-slate-600'}`}
            />
            {errors.sampleDate && <p className="mt-1 text-xs text-red-500">{errors.sampleDate.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Fish Sampled *</label>
            <input
              type="number"
              {...register("fishSampledCount")}
              className={`w-full px-3 py-2 bg-slate-800 text-white border rounded-md  focus:ring-sky-500 focus:border-sky-500 ${errors.fishSampledCount ? 'border-red-500' : 'border-slate-600'}`}
              placeholder="e.g., 10"
            />
            {errors.fishSampledCount && <p className="mt-1 text-xs text-red-500">{errors.fishSampledCount.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Average Weight (grams) *</label>
          <input
            type="number"
            step="0.1"
            {...register("averageWeightGrams")}
            className={`w-full px-4 py-3 text-lg bg-slate-800 text-white border rounded-md  focus:ring-sky-500 focus:border-sky-500 ${errors.averageWeightGrams ? 'border-red-500' : 'border-slate-600'}`}
            placeholder="e.g., 150"
          />
          {errors.averageWeightGrams && <p className="mt-1 text-xs text-red-500">{errors.averageWeightGrams.message}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Min Weight (g)</label>
            <input
              type="number"
              step="0.1"
              {...register("minWeightGrams")}
              className={`w-full px-3 py-2 bg-slate-800 text-white border rounded-md  focus:ring-sky-500 focus:border-sky-500 ${errors.minWeightGrams ? 'border-red-500' : 'border-slate-600'}`}
              placeholder="Optional"
            />
            {errors.minWeightGrams && <p className="mt-1 text-xs text-red-500">{errors.minWeightGrams.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Max Weight (g)</label>
            <input
              type="number"
              step="0.1"
              {...register("maxWeightGrams")}
              className="w-full px-3 py-2 bg-slate-800 text-white border border-slate-600 rounded-md  focus:ring-sky-500 focus:border-sky-500"
              placeholder="Optional"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Notes</label>
          <textarea
            rows={2}
            {...register("notes")}
            className="w-full px-3 py-2 bg-slate-800 text-white border border-slate-600 rounded-md  focus:ring-sky-500 focus:border-sky-500"
            placeholder="Additional notes..."
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-700">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-slate-600 text-slate-300 rounded-md hover:bg-slate-750 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 font-medium  transition-colors"
          >
            {isSubmitting ? 'Saving...' : 'Save Growth Sample'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
