import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../common/Modal';
import { pondApi } from '../../api/endpoints/pond.api';
import { CreatePondForm, Pond } from '../../types/pond.types';
import { DeletePondConfirmation } from './DeletePondConfirmation';
import toast from 'react-hot-toast';

const editPondSchema = z.object({
  name: z.string().min(2, "Pond name required").max(100).trim(),
  location: z.string().min(3, "Location required").max(200).trim(),
  lengthFt: z.number({ required_error: "Length required", invalid_type_error: "Must be a number" })
    .positive("Must be positive").max(10000),
  widthFt: z.number({ required_error: "Width required", invalid_type_error: "Must be a number" })
    .positive("Must be positive").max(10000),
  maxDepthFt: z.number({ required_error: "Depth required", invalid_type_error: "Must be a number" })
    .positive("Must be positive").max(100),
  soilType: z.string().min(2, "Soil type required"),
  waterSource: z.string().min(2, "Water source required"),
  pondType: z.string().default("Earthen"),
  constructionDate: z.string().optional(),
  notes: z.string().max(1000).optional(),
});

interface EditPondModalProps {
  isOpen: boolean;
  onClose: () => void;
  pond: Pond;
  onSuccess: (updatedPond: Pond) => void;
  onDeleted: () => void;
}

export const EditPondModal: React.FC<EditPondModalProps> = ({ 
  isOpen, onClose, pond, onSuccess, onDeleted 
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const initialWaterSources = pond.waterSource ? pond.waterSource.split(',').map(s => s.trim()) : [];
  const [waterSources, setWaterSources] = useState<string[]>(initialWaterSources);

  const { register, handleSubmit, watch, setValue, reset, formState: { errors, dirtyFields } } = useForm<CreatePondForm>({
    resolver: zodResolver(editPondSchema),
    defaultValues: {
      name: pond.name,
      location: pond.location,
      lengthFt: pond.lengthFt,
      widthFt: pond.widthFt,
      maxDepthFt: pond.maxDepthFt,
      soilType: pond.soilType,
      waterSource: pond.waterSource,
      pondType: pond.pondType,
      constructionDate: pond.constructionDate ? new Date(pond.constructionDate).toISOString().split('T')[0] : '',
      notes: pond.notes || ''
    }
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        name: pond.name,
        location: pond.location,
        lengthFt: pond.lengthFt,
        widthFt: pond.widthFt,
        maxDepthFt: pond.maxDepthFt,
        soilType: pond.soilType,
        waterSource: pond.waterSource,
        pondType: pond.pondType,
        constructionDate: pond.constructionDate ? new Date(pond.constructionDate).toISOString().split('T')[0] : '',
        notes: pond.notes || ''
      });
      setWaterSources(pond.waterSource ? pond.waterSource.split(',').map(s => s.trim()) : []);
    }
  }, [isOpen, pond, reset]);

  const length = watch('lengthFt');
  const width = watch('widthFt');
  
  const areaSqft = (length && width && length > 0 && width > 0) ? length * width : 0;
  const areaAcres = areaSqft / 43560;
  const areaBigha = areaAcres * 4.84;

  const toggleWaterSource = (source: string) => {
    let newSources;
    if (waterSources.includes(source)) {
      newSources = waterSources.filter(s => s !== source);
    } else {
      newSources = [...waterSources, source];
    }
    setWaterSources(newSources);
    setValue('waterSource', newSources.join(', '), { shouldValidate: true, shouldDirty: true });
  };

  const onSubmit = async (data: CreatePondForm) => {
    // Only send changed fields
    const dirtyData: any = {};
    Object.keys(dirtyFields).forEach((key) => {
      dirtyData[key] = (data as any)[key];
    });
    
    // If waterSource changed manually, make sure it's included
    if (data.waterSource !== pond.waterSource) {
      dirtyData.waterSource = data.waterSource;
    }

    if (Object.keys(dirtyData).length === 0) {
      onClose();
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await pondApi.updatePond(pond.id, dirtyData);
      if (res.success) {
        toast.success("Pond updated!");
        onSuccess(res.data);
        onClose();
      } else {
        toast.error(res.message || "Failed to update pond");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update pond");
    } finally {
      setIsSubmitting(false);
    }
  };

  const waterSourceOptions = ["Rainwater", "Tube Well", "River/Canal", "Spring", "Municipal"];

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={`✏️ Edit Pond — ${pond.name}`} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 pb-4">
          
          {/* SECTION: Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-sky-400 uppercase tracking-wider">Basic Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Pond Name</label>
              <input
                {...register('name')}
                type="text"
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
              />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Location</label>
              <input
                {...register('location')}
                type="text"
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
              />
              {errors.location && <p className="text-red-400 text-xs mt-1">{errors.location.message}</p>}
            </div>
          </div>

          {/* SECTION: Dimensions */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-sky-400 uppercase tracking-wider">Pond Dimensions</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Length (ft)</label>
                <input
                  {...register('lengthFt', { valueAsNumber: true })}
                  type="number"
                  step="0.1"
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                />
                {errors.lengthFt && <p className="text-red-400 text-xs mt-1">{errors.lengthFt.message}</p>}
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Width (ft)</label>
                <input
                  {...register('widthFt', { valueAsNumber: true })}
                  type="number"
                  step="0.1"
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                />
                {errors.widthFt && <p className="text-red-400 text-xs mt-1">{errors.widthFt.message}</p>}
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Max Depth (ft)</label>
                <input
                  {...register('maxDepthFt', { valueAsNumber: true })}
                  type="number"
                  step="0.1"
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                />
                {errors.maxDepthFt && <p className="text-red-400 text-xs mt-1">{errors.maxDepthFt.message}</p>}
              </div>
            </div>
            
            {areaSqft > 0 && (
              <div className="bg-sky-900/30 border border-sky-700 rounded-lg p-4 mt-2">
                <h4 className="font-semibold text-sky-400 text-sm mb-1">📊 Calculated Area:</h4>
                <p className="text-slate-200">
                  <span className="font-bold text-white">{new Intl.NumberFormat('en-IN').format(areaSqft)}</span> sq ft ≈ 
                  <span className="font-bold text-white ml-1">{areaAcres.toFixed(3)}</span> acres ≈ 
                  <span className="font-bold text-white ml-1">{areaBigha.toFixed(2)}</span> bigha*
                </p>
                <p className="text-xs text-slate-500 mt-1">(*approximate, 1 acre ≈ 4.84 bigha)</p>
              </div>
            )}
          </div>

          {/* SECTION: Pond Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-sky-400 uppercase tracking-wider">Pond Details</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Soil Type</label>
                <select
                  {...register('soilType')}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                >
                  <option value="Clay">Clay</option>
                  <option value="Silty Clay">Silty Clay</option>
                  <option value="Sandy Clay">Sandy Clay</option>
                  <option value="Whitish/Gravelly">Whitish/Gravelly</option>
                  <option value="Loamy">Loamy</option>
                  <option value="Black Cotton">Black Cotton</option>
                  <option value="Other">Other</option>
                </select>
                {errors.soilType && <p className="text-red-400 text-xs mt-1">{errors.soilType.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Pond Type</label>
                <select
                  {...register('pondType')}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                >
                  <option value="Earthen">Earthen</option>
                  <option value="Lined">Lined</option>
                  <option value="Concrete">Concrete</option>
                  <option value="Cage">Cage</option>
                  <option value="Tank">Tank</option>
                </select>
                {errors.pondType && <p className="text-red-400 text-xs mt-1">{errors.pondType.message}</p>}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Water Source</label>
              <div className="flex flex-wrap gap-2">
                {waterSourceOptions.map(source => (
                  <button
                    key={source}
                    type="button"
                    onClick={() => toggleWaterSource(source)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                      waterSources.includes(source)
                        ? 'bg-sky-500/20 text-sky-400 border-sky-500/50'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    {source}
                  </button>
                ))}
              </div>
              <input type="hidden" {...register('waterSource')} />
              {errors.waterSource && <p className="text-red-400 text-xs mt-1">{errors.waterSource.message}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Pond Established Date (optional)</label>
              <input
                {...register('constructionDate')}
                type="date"
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
              />
            </div>
          </div>
          
          {/* SECTION: Notes */}
          <div>
            <details className="group" open={!!pond.notes}>
              <summary className="text-sky-400 text-sm font-medium cursor-pointer list-none flex items-center gap-1 mb-2">
                <span className="group-open:hidden">Add Notes +</span>
                <span className="hidden group-open:inline">Hide Notes -</span>
              </summary>
              <textarea
                {...register('notes')}
                rows={3}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors resize-none"
              ></textarea>
              {errors.notes && <p className="text-red-400 text-xs mt-1">{errors.notes.message}</p>}
            </details>
          </div>
          
          {/* DELETION SECTION */}
          <div className="pt-6 border-t border-slate-800 mt-8">
            <h3 className="text-sm font-semibold text-red-500 uppercase tracking-wider mb-3">Danger Zone</h3>
            <div className="border border-red-900/50 bg-red-950/20 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <p className="text-slate-300 text-sm flex-1">
                Deleting a pond hides it from view but preserves all data (logs, finances, history) for your records.
              </p>
              <button
                type="button"
                onClick={() => setIsDeleteDialogOpen(true)}
                className="shrink-0 px-4 py-2 border border-red-700 text-red-400 hover:bg-red-900/30 hover:text-red-300 rounded-lg transition-colors font-medium text-sm"
              >
                Delete This Pond
              </button>
            </div>
          </div>
          
          {/* FOOTER */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 font-medium transition-colors border border-transparent hover:border-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-2.5 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </Modal>

      {isDeleteDialogOpen && (
        <DeletePondConfirmation 
          isOpen={isDeleteDialogOpen} 
          onClose={() => setIsDeleteDialogOpen(false)} 
          pond={pond} 
          onSuccess={() => {
            setIsDeleteDialogOpen(false);
            onClose();
            onDeleted();
          }} 
        />
      )}
    </>
  );
};
