import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { WaterQualityLog, WaterColor, WaterSmell, CreateWaterQualityLogForm } from '../../types/water.types';
import { WATER_COLOR_CONFIG, WATER_SMELL_CONFIG, PH_STATUS_CONFIG } from '../../utils/constants';
import { waterApi } from '../../api/endpoints/water.api';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';
import { Modal } from '../common/Modal';

const waterLogSchema = z.object({
  logDate: z.string().min(1, "Date required"),
  logTime: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Use HH:MM format")
    .optional()
    .or(z.literal('')),
  phValue: z.number({ invalid_type_error: "Must be a number" }).min(0).max(14).optional().or(z.literal('')),
  waterLevelFt: z.number({ invalid_type_error: "Must be a number" }).positive().max(50).optional().or(z.literal('')),
  waterColor: z.enum(['CLEAR','LIGHT_GREEN','DARK_GREEN','BROWN','CLOUDY','BLACK']),
  waterSmell: z.enum(['NONE','MILD','STRONG','FOUL']),
  temperatureCelsius: z.number({ invalid_type_error: "Must be a number" }).min(-5).max(50).optional().or(z.literal('')),
  dissolvedOxygenPpm: z.number({ invalid_type_error: "Must be a number" }).min(0).max(20).optional().or(z.literal('')),
  turbidity: z.string().max(100).optional(),
  notes: z.string().max(1000).optional(),
});

interface WaterQualityLogFormProps {
  isOpen: boolean;
  pondId: string;
  existingLog?: WaterQualityLog;
  onSuccess: (log: WaterQualityLog) => void;
  onCancel: () => void;
}

export const WaterQualityLogForm: React.FC<WaterQualityLogFormProps> = ({
  isOpen,
  pondId,
  existingLog,
  onSuccess,
  onCancel
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOptional, setShowOptional] = useState(false);

  const { register, handleSubmit, control, watch, reset, setValue, formState: { errors } } = useForm<any>({
    resolver: zodResolver(waterLogSchema),
    defaultValues: {
      logDate: new Date().toISOString().split('T')[0],
      logTime: '',
      phValue: '',
      waterLevelFt: '',
      waterColor: 'LIGHT_GREEN',
      waterSmell: 'NONE',
      temperatureCelsius: '',
      dissolvedOxygenPpm: '',
      turbidity: '',
      notes: ''
    }
  });

  const phValue = watch('phValue');
  const waterColor = watch('waterColor');
  const waterSmell = watch('waterSmell');

  useEffect(() => {
    if (existingLog) {
      reset({
        logDate: existingLog.logDate.split('T')[0],
        logTime: existingLog.logTime || '',
        phValue: existingLog.phValue ?? '',
        waterLevelFt: existingLog.waterLevelFt ?? '',
        waterColor: existingLog.waterColor,
        waterSmell: existingLog.waterSmell,
        temperatureCelsius: existingLog.temperatureCelsius ?? '',
        dissolvedOxygenPpm: existingLog.dissolvedOxygenPpm ?? '',
        turbidity: existingLog.turbidity || '',
        notes: existingLog.notes || ''
      });
      if (existingLog.temperatureCelsius || existingLog.dissolvedOxygenPpm || existingLog.waterLevelFt || existingLog.turbidity) {
        setShowOptional(true);
      }
    } else {
      reset({
        logDate: new Date().toISOString().split('T')[0],
        logTime: '',
        phValue: '',
        waterLevelFt: '',
        waterColor: 'LIGHT_GREEN',
        waterSmell: 'NONE',
        temperatureCelsius: '',
        dissolvedOxygenPpm: '',
        turbidity: '',
        notes: ''
      });
      setShowOptional(false);
    }
  }, [existingLog, isOpen, reset]);

  if (!isOpen) return null;

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const payload: CreateWaterQualityLogForm = {
        pondId,
        logDate: data.logDate,
        waterColor: data.waterColor,
        waterSmell: data.waterSmell,
      };

      if (data.logTime) payload.logTime = data.logTime;
      if (data.phValue !== '') payload.phValue = parseFloat(data.phValue);
      if (data.waterLevelFt !== '') payload.waterLevelFt = parseFloat(data.waterLevelFt);
      if (data.temperatureCelsius !== '') payload.temperatureCelsius = parseFloat(data.temperatureCelsius);
      if (data.dissolvedOxygenPpm !== '') payload.dissolvedOxygenPpm = parseFloat(data.dissolvedOxygenPpm);
      if (data.turbidity) payload.turbidity = data.turbidity;
      if (data.notes) payload.notes = data.notes;

      let res;
      if (existingLog) {
        res = await waterApi.updateWaterQualityLog(existingLog.id, pondId, payload);
      } else {
        res = await waterApi.createWaterQualityLog(payload);
      }

      if (res.success) {
        // Show appropriate toast based on conditions
        if (payload.phValue && (payload.phValue < 6.0 || payload.phValue > 9.0)) {
          toast.error("⚠️ Critical pH logged. Take action immediately!");
        } else if (payload.waterSmell === 'FOUL' || payload.waterColor === 'BLACK') {
          toast.error("🚨 Dangerous conditions logged. Act now!");
        } else if (payload.phValue && (payload.phValue < 7.0 || payload.phValue > 8.5)) {
          toast('⚠️ pH out of range. Monitor and treat if needed.', { icon: '⚠️' });
        } else {
          toast.success("💧 Water quality logged. All looks good!");
        }
        
        onSuccess(res.data);
      } else {
        toast.error(res.message || "Failed to save log");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPHStatusObj = () => {
    if (phValue === '' || phValue === undefined) return null;
    const ph = parseFloat(phValue);
    if (isNaN(ph)) return null;
    
    if (ph < 6.0) return PH_STATUS_CONFIG['CRITICAL_LOW'];
    if (ph < 7.0) return PH_STATUS_CONFIG['LOW'];
    if (ph <= 8.5) return PH_STATUS_CONFIG['NORMAL'];
    if (ph <= 9.0) return PH_STATUS_CONFIG['HIGH'];
    return PH_STATUS_CONFIG['CRITICAL_HIGH'];
  };

  const phStatusObj = getPHStatusObj();
  const borderColor = phStatusObj ? phStatusObj.borderColor : 'border-slate-700 focus:border-sky-500';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={existingLog ? "✏️ Edit Water Quality Reading" : "💧 Log Water Quality"}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-2">
        <div className="space-y-6">
            
            {/* SECTION 1: Date & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Date *</label>
                <input
                  type="date"
                  {...register('logDate')}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                {errors.logDate && <p className="text-red-400 text-xs mt-1">{errors.logDate.message as string}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Time (Optional)</label>
                <input
                  type="time"
                  {...register('logTime')}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                {errors.logTime && <p className="text-red-400 text-xs mt-1">{errors.logTime.message as string}</p>}
              </div>
            </div>

            {/* SECTION 2: pH VALUE */}
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-800">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                pH Level <span className="text-slate-500 text-xs font-normal ml-2">(Optional, 0-14)</span>
              </label>
              
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="w-full sm:w-1/3">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g., 7.4"
                    {...register('phValue', { valueAsNumber: true })}
                    className={`w-full bg-slate-800 border-2 rounded-lg px-4 py-3 text-white text-lg font-bold focus:outline-none ${borderColor} transition-colors`}
                  />
                  {errors.phValue && <p className="text-red-400 text-xs mt-1">{errors.phValue.message as string}</p>}
                </div>
                
                <div className="w-full sm:w-2/3">
                  {phStatusObj ? (
                    <div className={`p-3 rounded-lg border flex items-center gap-3 ${phStatusObj.bgColor} ${phStatusObj.borderColor}`}>
                      <span className="text-2xl">{phStatusObj.emoji}</span>
                      <div>
                        <p className={`font-bold ${phStatusObj.color}`}>{phStatusObj.label}</p>
                        <p className="text-xs text-slate-300">
                          {phValue < 6.0 || phValue > 9.0 ? '🚨 Take action immediately!' : 
                           phValue < 7.0 ? '⚠️ Apply agricultural lime.' :
                           phValue > 8.5 ? '⚠️ Monitor algae growth.' :
                           '✅ Good condition'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-lg border border-slate-700 bg-slate-800/50 flex items-center justify-center text-sm text-slate-400 h-full">
                      Enter pH to see status
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 3: WATER COLOR */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Water Color *</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.entries(WATER_COLOR_CONFIG).map(([key, config]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setValue('waterColor', key)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                      waterColor === key
                        ? 'border-sky-500 bg-sky-900/20 ring-1 ring-sky-500'
                        : 'border-slate-700 bg-slate-800 hover:bg-slate-700/50'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-full mb-2 flex items-center justify-center text-xl shadow-inner border border-slate-600`}
                         style={{ 
                            backgroundColor: key === 'CLEAR' ? '#bae6fd' :
                                             key === 'LIGHT_GREEN' ? '#4ade80' :
                                             key === 'DARK_GREEN' ? '#15803d' :
                                             key === 'BROWN' ? '#b45309' :
                                             key === 'CLOUDY' ? '#94a3b8' : '#0f172a'
                         }}>
                      {config.emoji}
                    </div>
                    <span className="text-sm font-medium text-slate-200">{config.label}</span>
                  </button>
                ))}
              </div>
              {waterColor && (
                <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                  ℹ️ {WATER_COLOR_CONFIG[waterColor as string].description}
                </p>
              )}
            </div>

            {/* SECTION 4: WATER SMELL */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Water Smell *</label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(WATER_SMELL_CONFIG).map(([key, config]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setValue('waterSmell', key)}
                    className={`px-4 py-2 rounded-full border text-sm font-medium flex items-center gap-2 transition-all ${
                      waterSmell === key
                        ? `border-${config.color.split('-')[1]}-500 bg-${config.color.split('-')[1]}-900/30 ${config.color}`
                        : 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700/50'
                    }`}
                  >
                    <span>{config.emoji}</span>
                    <span>{config.label}</span>
                  </button>
                ))}
              </div>
              {(waterSmell === 'STRONG' || waterSmell === 'FOUL') && (
                <div className="mt-3 p-3 bg-amber-900/20 border border-amber-700/50 rounded-lg text-sm text-amber-300 flex items-start gap-2">
                  <span className="mt-0.5">⚠️</span>
                  <p>Strong smell indicates water quality problems. Check dissolved oxygen and consider water exchange.</p>
                </div>
              )}
            </div>

            {/* SECTION 5: OPTIONAL READINGS */}
            <div className="border border-slate-700 rounded-xl overflow-hidden">
              <button 
                type="button"
                onClick={() => setShowOptional(!showOptional)}
                className="w-full px-4 py-3 bg-slate-800 flex justify-between items-center text-sm font-medium text-slate-300 hover:bg-slate-700/50 transition-colors"
              >
                <span>Add Detailed Readings (Temperature, DO, etc.)</span>
                <span>{showOptional ? '−' : '+'}</span>
              </button>
              
              {showOptional && (
                <div className="p-4 bg-slate-800/30 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-700">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Temperature (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      {...register('temperatureCelsius', { valueAsNumber: true })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                    {errors.temperatureCelsius && <p className="text-red-400 text-xs mt-1">{errors.temperatureCelsius.message as string}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Dissolved Oxygen (ppm)</label>
                    <input
                      type="number"
                      step="0.1"
                      {...register('dissolvedOxygenPpm', { valueAsNumber: true })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                    {errors.dissolvedOxygenPpm && <p className="text-red-400 text-xs mt-1">{errors.dissolvedOxygenPpm.message as string}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Water Level (ft)</label>
                    <input
                      type="number"
                      step="0.1"
                      {...register('waterLevelFt', { valueAsNumber: true })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                    {errors.waterLevelFt && <p className="text-red-400 text-xs mt-1">{errors.waterLevelFt.message as string}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Turbidity</label>
                    <input
                      type="text"
                      {...register('turbidity')}
                      placeholder="e.g., Secchi 30cm"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 6: NOTES */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Notes</label>
              <textarea
                {...register('notes')}
                rows={3}
                placeholder="Any other observations..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
              ></textarea>
            </div>

          </div>

          <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-slate-800">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 rounded-lg border border-slate-700 text-slate-300 font-medium hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-lg bg-sky-600 text-white font-medium hover:bg-sky-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                existingLog ? "Update Reading" : "Save Reading"
              )}
            </button>
          </div>
      </form>
    </Modal>
  );
};
