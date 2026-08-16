import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MortalityLog, MortalityReason } from '../../types/fish.types';
import { fishApi } from '../../api/endpoints/fish.api';
import { Modal } from '../common/Modal';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

const REASON_OPTIONS: { value: MortalityReason, label: string }[] = [
  { value: 'OXYGEN_DEFICIENCY', label: 'Oxygen Deficiency' },
  { value: 'DISEASE_INFECTION', label: 'Disease / Infection' },
  { value: 'WATER_QUALITY', label: 'Water Quality Issues' },
  { value: 'PREDATION', label: 'Predation' },
  { value: 'INJURY', label: 'Injury' },
  { value: 'UNKNOWN', label: 'Unknown' },
  { value: 'OTHER', label: 'Other' },
];

const mortalitySchema = z.object({
  logDate: z.string().min(1, "Date required"),
  deadCount: z.coerce.number()
    .int("Must be whole number")
    .positive("Must be at least 1")
    .max(10000, "Count seems too high"),
  probableReason: z.enum([
    'OXYGEN_DEFICIENCY', 'DISEASE_INFECTION', 'WATER_QUALITY', 
    'PREDATION', 'INJURY', 'UNKNOWN', 'OTHER'
  ]).optional(),
  actionTaken: z.string().max(500).optional(),
  notes: z.string().max(500).optional(),
});

type MortalityFormData = z.infer<typeof mortalitySchema>;

interface MortalityLogFormProps {
  pondId: string;
  estimatedAlive: number;
  existingLog?: MortalityLog;
  onSuccess: (log: MortalityLog) => void;
  onCancel: () => void;
}

export const MortalityLogForm: React.FC<MortalityLogFormProps> = ({
  pondId,
  estimatedAlive,
  existingLog,
  onSuccess,
  onCancel
}) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<MortalityFormData>({
    resolver: zodResolver(mortalitySchema),
    defaultValues: existingLog ? {
      logDate: existingLog.logDate.split('T')[0],
      deadCount: existingLog.deadCount,
      probableReason: existingLog.probableReason || undefined,
      actionTaken: existingLog.actionTaken || undefined,
      notes: existingLog.notes || undefined,
    } : {
      logDate: format(new Date(), 'yyyy-MM-dd')
    }
  });

  const onSubmit = async (data: MortalityFormData) => {
    try {
      setIsSubmitting(true);
      if (existingLog) {
        const res = await fishApi.updateMortality(existingLog.id, pondId, data);
        toast.success("Mortality log updated!");
        onSuccess(res.data);
      } else {
        const res = await fishApi.createMortality({ ...data, pondId });
        toast.success(`Logged ${data.deadCount} mortalities`);
        onSuccess(res.data);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save mortality log");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onCancel}
      title={existingLog ? "✏️ Edit Mortality Log" : "☠️ Log Daily Mortality"}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        
        <div className="bg-sky-500/10 text-sky-400 p-3 rounded-md text-sm mb-4 border border-sky-500/20">
          <strong>Context:</strong> Estimated currently alive fish: <span className="font-semibold text-sky-300">{estimatedAlive}</span>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Date *</label>
          <input
            type="date"
            {...register("logDate")}
            className={`w-full px-3 py-2 bg-slate-800 text-white border rounded-md  focus:ring-sky-500 focus:border-sky-500 ${errors.logDate ? 'border-red-500' : 'border-slate-600'}`}
          />
          {errors.logDate && <p className="mt-1 text-xs text-red-500">{errors.logDate.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Dead Count *</label>
          <input
            type="number"
            {...register("deadCount")}
            className={`w-full px-4 py-3 text-lg bg-slate-800 text-white border rounded-md  focus:ring-sky-500 focus:border-sky-500 ${errors.deadCount ? 'border-red-500' : 'border-slate-600'}`}
            placeholder="e.g., 5"
          />
          {errors.deadCount && <p className="mt-1 text-xs text-red-500">{errors.deadCount.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Probable Reason</label>
          <select
            {...register("probableReason")}
            className="w-full px-3 py-2 bg-slate-800 text-white border border-slate-600 rounded-md  focus:ring-sky-500 focus:border-sky-500 bg-slate-800"
          >
            <option value="">Select a reason (optional)</option>
            {REASON_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Action Taken</label>
          <textarea
            rows={2}
            {...register("actionTaken")}
            className="w-full px-3 py-2 bg-slate-800 text-white border border-slate-600 rounded-md  focus:ring-sky-500 focus:border-sky-500"
            placeholder="e.g., Applied oxygen tablets"
          />
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
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 font-medium  transition-colors"
          >
            {isSubmitting ? 'Saving...' : 'Save Mortality Log'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
