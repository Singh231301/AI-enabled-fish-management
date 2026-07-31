import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { WaterTreatmentLog, ChemicalType, ApplicationMethod, LimeRecommendation, CreateWaterTreatmentForm } from '../../types/water.types';
import { CHEMICAL_TYPE_CONFIG } from '../../utils/constants';
import { waterApi } from '../../api/endpoints/water.api';
import toast from 'react-hot-toast';
import { X, Calculator } from 'lucide-react';

const treatmentSchema = z.object({
  treatmentDate: z.string().min(1, "Date required"),
  chemicalType: z.enum([
    'AGRICULTURAL_LIME','QUICK_LIME','DOLOMITE','POTASSIUM_PERMANGANATE','BLEACHING_POWDER','SALT','PROBIOTIC','OTHER'
  ]),
  chemicalName: z.string().min(2).max(100),
  quantityKg: z.number({ invalid_type_error: "Must be a number" }).positive().max(10000),
  reason: z.string().min(3).max(500),
  applicationMethod: z.enum(['BROADCAST','DISSOLVED_IN_WATER','SPOT_APPLICATION','INLET_WATER','OTHER']).optional().or(z.literal('')),
  phBefore: z.number({ invalid_type_error: "Must be a number" }).min(0).max(14).optional().or(z.literal('')),
  phAfter: z.number({ invalid_type_error: "Must be a number" }).min(0).max(14).optional().or(z.literal('')),
  resultObserved: z.string().max(500).optional(),
  nextTreatmentDate: z.string().optional(),
  notes: z.string().max(500).optional(),
});

interface WaterTreatmentFormProps {
  isOpen: boolean;
  pondId: string;
  pondAreaAcres: number;
  existingTreatment?: WaterTreatmentLog;
  currentPH?: number | null;
  limeRecommendation: LimeRecommendation;
  onSuccess: (treatment: WaterTreatmentLog) => void;
  onCancel: () => void;
}

export const WaterTreatmentForm: React.FC<WaterTreatmentFormProps> = ({
  isOpen,
  pondId,
  pondAreaAcres,
  existingTreatment,
  currentPH,
  limeRecommendation,
  onSuccess,
  onCancel
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm<any>({
    resolver: zodResolver(treatmentSchema),
    defaultValues: {
      treatmentDate: new Date().toISOString().split('T')[0],
      chemicalType: 'AGRICULTURAL_LIME',
      chemicalName: 'Agricultural Lime (CaCO3)',
      quantityKg: '',
      reason: '',
      applicationMethod: 'BROADCAST',
      phBefore: currentPH ?? '',
      phAfter: '',
      resultObserved: '',
      nextTreatmentDate: '',
      notes: ''
    }
  });

  const chemicalType = watch('chemicalType');
  const quantityKg = watch('quantityKg');

  useEffect(() => {
    if (existingTreatment) {
      reset({
        treatmentDate: existingTreatment.treatmentDate.split('T')[0],
        chemicalType: existingTreatment.chemicalType,
        chemicalName: existingTreatment.chemicalName,
        quantityKg: existingTreatment.quantityKg,
        reason: existingTreatment.reason,
        applicationMethod: existingTreatment.applicationMethod || '',
        phBefore: existingTreatment.phBefore ?? '',
        phAfter: existingTreatment.phAfter ?? '',
        resultObserved: existingTreatment.resultObserved || '',
        nextTreatmentDate: existingTreatment.nextTreatmentDate ? existingTreatment.nextTreatmentDate.split('T')[0] : '',
        notes: existingTreatment.notes || ''
      });
    } else {
      reset({
        treatmentDate: new Date().toISOString().split('T')[0],
        chemicalType: 'AGRICULTURAL_LIME',
        chemicalName: 'Agricultural Lime (CaCO3)',
        quantityKg: '',
        reason: '',
        applicationMethod: 'BROADCAST',
        phBefore: currentPH ?? '',
        phAfter: '',
        resultObserved: '',
        nextTreatmentDate: '',
        notes: ''
      });
    }
  }, [existingTreatment, currentPH, isOpen, reset]);

  // Handle chemical type changes to autofill name
  useEffect(() => {
    if (!existingTreatment) {
      if (chemicalType === 'AGRICULTURAL_LIME') {
        setValue('chemicalName', 'Agricultural Lime (CaCO3)');
        setValue('applicationMethod', 'BROADCAST');
      } else if (chemicalType === 'QUICK_LIME') {
        setValue('chemicalName', 'Quick Lime (CaO)');
      } else if (chemicalType === 'DOLOMITE') {
        setValue('chemicalName', 'Dolomite Lime');
      }
    }
  }, [chemicalType, existingTreatment, setValue]);

  if (!isOpen) return null;

  const onSubmit = async (data: any) => {
    if (data.chemicalType === 'QUICK_LIME') {
      toast.error("Quick Lime is not permitted for active ponds.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateWaterTreatmentForm = {
        pondId,
        treatmentDate: data.treatmentDate,
        chemicalType: data.chemicalType,
        chemicalName: data.chemicalName,
        quantityKg: parseFloat(data.quantityKg),
        reason: data.reason,
      };

      if (data.applicationMethod) payload.applicationMethod = data.applicationMethod;
      if (data.phBefore !== '') payload.phBefore = parseFloat(data.phBefore);
      if (data.phAfter !== '') payload.phAfter = parseFloat(data.phAfter);
      if (data.resultObserved) payload.resultObserved = data.resultObserved;
      if (data.nextTreatmentDate) payload.nextTreatmentDate = data.nextTreatmentDate;
      if (data.notes) payload.notes = data.notes;

      let res;
      if (existingTreatment) {
        res = await waterApi.updateWaterTreatment(existingTreatment.id, pondId, payload);
      } else {
        res = await waterApi.createWaterTreatment(payload);
      }

      if (res.success) {
        toast.success(`✅ ${data.chemicalName} treatment logged!`);
        if (data.nextTreatmentDate) {
          toast.success(`🔔 Reminder set for ${data.nextTreatmentDate}`, { duration: 5000 });
        }
        onSuccess(res.data);
      } else {
        toast.error(res.message || "Failed to save treatment");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isQuickLime = chemicalType === 'QUICK_LIME';
  const isAgriLime = chemicalType === 'AGRICULTURAL_LIME';
  const maxSafeLime = pondAreaAcres * 300;
  const isExcessiveLime = isAgriLime && quantityKg > maxSafeLime;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl border border-slate-700 overflow-hidden my-8">
        <div className="flex justify-between items-center p-6 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>🧪</span>
              {existingTreatment ? "Edit Water Treatment" : "Log Water Treatment"}
            </h2>
            <p className="text-sm text-slate-400 mt-1">Record any chemical application to the pond</p>
          </div>
          <button onClick={onCancel} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-4 bg-amber-900/20 border-b border-amber-700/50">
          <p className="text-amber-300 text-sm font-medium mb-1">⚠️ Important Safety Rules:</p>
          <ul className="text-amber-200/80 text-xs list-disc pl-5 space-y-1">
            <li>Only use AGRICULTURAL LIME (Calcium Carbonate)</li>
            <li>NEVER use quick lime or slaked lime in active pond</li>
            <li>Apply lime in evening when fish are less active</li>
            <li>Never mix lime with other chemicals</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          
          {/* SECTION 1 & 2: Date & Chemical */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Treatment Date *</label>
              <input
                type="date"
                {...register('treatmentDate')}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              {errors.treatmentDate && <p className="text-red-400 text-xs mt-1">{errors.treatmentDate.message as string}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Chemical Type *</label>
              <select
                {...register('chemicalType')}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {Object.entries(CHEMICAL_TYPE_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>{config.emoji} {config.label}</option>
                ))}
              </select>
            </div>
          </div>

          {isQuickLime && (
            <div className="bg-red-900/30 border border-red-500/50 p-4 rounded-lg">
              <p className="text-red-400 font-bold mb-1">🚨 DANGER: Quick lime is NOT safe for ponds with fish!</p>
              <p className="text-red-300 text-sm mb-3">It can rapidly raise pH to fatal levels. Use Agricultural Lime instead.</p>
              <button 
                type="button" 
                onClick={() => setValue('chemicalType', 'AGRICULTURAL_LIME')}
                className="bg-red-500 hover:bg-red-400 text-white px-4 py-2 rounded font-medium text-sm transition-colors"
              >
                Switch to Agricultural Lime
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Chemical Name *</label>
              <input
                type="text"
                {...register('chemicalName')}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              {errors.chemicalName && <p className="text-red-400 text-xs mt-1">{errors.chemicalName.message as string}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Quantity (kg) *</label>
              <input
                type="number"
                step="0.1"
                {...register('quantityKg')}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              {errors.quantityKg && <p className="text-red-400 text-xs mt-1">{errors.quantityKg.message as string}</p>}
            </div>
          </div>

          {/* LIME HELPER */}
          {isAgriLime && (
            <div className="bg-sky-900/20 border border-sky-700/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calculator size={16} className="text-sky-400" />
                <span className="font-medium text-sky-400">Lime Calculator</span>
                <span className="text-xs text-sky-500 ml-auto">Pond: {pondAreaAcres.toFixed(3)} acres</span>
              </div>
              <p className="text-sm text-slate-300 mb-3">
                Recommendation: <span className="font-bold text-white">{limeRecommendation.recommendedTotalKg}kg</span> ({limeRecommendation.recommendedKgPerAcre}kg/acre)
              </p>
              
              <div className="flex flex-wrap gap-2 mb-3">
                <button type="button" onClick={() => setValue('quantityKg', (limeRecommendation.recommendedTotalKg / 2).toFixed(1))} className="px-3 py-1 bg-slate-800 border border-slate-600 rounded text-xs hover:bg-slate-700 text-slate-200">
                  Half dose
                </button>
                <button type="button" onClick={() => setValue('quantityKg', limeRecommendation.recommendedTotalKg)} className="px-3 py-1 bg-sky-600 border border-sky-500 rounded text-xs hover:bg-sky-500 text-white font-medium">
                  Standard dose
                </button>
                <button type="button" onClick={() => setValue('quantityKg', (limeRecommendation.recommendedTotalKg * 1.3).toFixed(1))} className="px-3 py-1 bg-slate-800 border border-slate-600 rounded text-xs hover:bg-slate-700 text-slate-200">
                  Heavy dose
                </button>
              </div>

              {limeRecommendation.isApplicationDue ? (
                <p className="text-xs text-green-400 font-medium">✅ Lime application is recommended now.</p>
              ) : limeRecommendation.daysSinceLastApplication < 30 ? (
                <p className="text-xs text-amber-400">ℹ️ Last lime applied {limeRecommendation.daysSinceLastApplication} days ago. Consider waiting for pH to drop below 7.5.</p>
              ) : null}

              {isExcessiveLime && (
                <p className="text-xs text-red-400 font-medium mt-2">⚠️ Warning: Quantity exceeds maximum safe limit of 300kg/acre.</p>
              )}
            </div>
          )}

          {/* SECTION 4: Reason */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Reason for Treatment *</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {['pH correction', 'Monthly maintenance', 'Post-rain treatment', 'Disease prevention'].map(r => (
                <button 
                  key={r} 
                  type="button" 
                  onClick={() => setValue('reason', r)}
                  className="px-2.5 py-1 text-xs bg-slate-800 border border-slate-700 rounded-md text-slate-300 hover:bg-slate-700"
                >
                  {r}
                </button>
              ))}
            </div>
            <textarea
              {...register('reason')}
              rows={2}
              placeholder="e.g., pH dropped to 6.8, routine monthly lime application..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
            ></textarea>
            {errors.reason && <p className="text-red-400 text-xs mt-1">{errors.reason.message as string}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Application Method</label>
              <select
                {...register('applicationMethod')}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="">Select Method...</option>
                <option value="BROADCAST">Broadcast (sprinkle on surface)</option>
                <option value="DISSOLVED_IN_WATER">Dissolved in water first</option>
                <option value="SPOT_APPLICATION">Spot application</option>
                <option value="INLET_WATER">Through inlet water</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Next Treatment Date</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  {...register('nextTreatmentDate')}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div className="flex gap-2 mt-2">
                {[15, 30, 45].map(days => (
                  <button 
                    key={days} 
                    type="button" 
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() + days);
                      setValue('nextTreatmentDate', d.toISOString().split('T')[0]);
                    }}
                    className="text-[10px] bg-slate-800 px-2 py-1 border border-slate-700 rounded text-slate-300 hover:text-white"
                  >
                    +{days}d
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 6: pH Before/After */}
          <div className="border border-slate-700 p-4 rounded-lg bg-slate-800/30">
            <h4 className="text-sm font-medium text-slate-200 mb-3">Effectiveness Tracking</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">pH Before Treatment</label>
                <input
                  type="number"
                  step="0.1"
                  {...register('phBefore')}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">pH After Treatment</label>
                <input
                  type="number"
                  step="0.1"
                  {...register('phAfter')}
                  placeholder="Wait 48h to record"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Hint: Record 'After' pH 48-72 hours post-treatment to see effectiveness. You can edit this record later.
            </p>
          </div>

        </form>

        <div className="flex justify-end gap-3 p-6 border-t border-slate-800 bg-slate-900">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-lg border border-slate-700 text-slate-300 font-medium hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting || isQuickLime}
            className="px-5 py-2.5 rounded-lg bg-sky-600 text-white font-medium hover:bg-sky-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? "Saving..." : existingTreatment ? "Update Treatment" : "Log Treatment"}
          </button>
        </div>
      </div>
    </div>
  );
};
