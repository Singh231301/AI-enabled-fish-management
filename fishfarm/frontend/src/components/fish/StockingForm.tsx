import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FishStocking } from '../../types/fish.types';
import { fishApi } from '../../api/endpoints/fish.api';
import { Modal } from '../common/Modal';
import { toast } from 'react-hot-toast';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';

const stockingSchema = z.object({
  stockingDate: z.string().min(1, "Stocking date required"),
  species: z.string().min(2, "Species required"),
  localName: z.string().optional(),
  quantity: z.coerce.number()
    .int("Must be whole number")
    .positive("Must be positive")
    .max(100000),
  fingerlingSize_cm: z.coerce.number()
    .positive("Size required")
    .max(100),
  sourceSupplier: z.string().optional(),
  costPerFingerling: z.coerce.number().nonnegative().optional(),
  totalCost: z.coerce.number().nonnegative().optional(),
  notes: z.string().max(1000).optional(),
});

type StockingFormData = z.infer<typeof stockingSchema>;

interface StockingFormProps {
  pondId: string;
  existingStocking?: FishStocking;
  onSuccess: (stocking: FishStocking) => void;
  onCancel: () => void;
}

const SPECIES_OPTIONS = [
  "Pangasius", "Rohu", "Catla", "Mrigal", "Common Carp", 
  "Tilapia", "Grass Carp", "Silver Carp", "Other"
];

export const StockingForm: React.FC<StockingFormProps> = ({
  pondId,
  existingStocking,
  onSuccess,
  onCancel
}) => {
  const [showCost, setShowCost] = React.useState(!!(existingStocking?.costPerFingerling || existingStocking?.totalCost));
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<StockingFormData>({
    resolver: zodResolver(stockingSchema),
    defaultValues: existingStocking ? {
      stockingDate: existingStocking.stockingDate.split('T')[0],
      species: existingStocking.species,
      localName: existingStocking.localName || undefined,
      quantity: existingStocking.quantity,
      fingerlingSize_cm: existingStocking.fingerlingSize_cm,
      sourceSupplier: existingStocking.sourceSupplier || undefined,
      costPerFingerling: existingStocking.costPerFingerling || undefined,
      totalCost: existingStocking.totalCost || undefined,
      notes: existingStocking.notes || undefined,
    } : {
      stockingDate: format(new Date(), 'yyyy-MM-dd')
    }
  });

  const quantity = watch("quantity");
  const costPerFingerling = watch("costPerFingerling");
  const totalCost = watch("totalCost");

  const expectedTotal = (quantity && costPerFingerling) ? quantity * costPerFingerling : undefined;
  const isCostMismatched = expectedTotal && totalCost && Math.abs(expectedTotal - totalCost) > 1;

  const handleAutoCalculate = () => {
    if (expectedTotal) {
      setValue("totalCost", expectedTotal, { shouldValidate: true });
    }
  };

  const onSubmit = async (data: StockingFormData) => {
    try {
      setIsSubmitting(true);
      if (existingStocking) {
        const res = await fishApi.updateStocking(existingStocking.id, pondId, data);
        toast.success("Stocking record updated!");
        onSuccess(res.data);
      } else {
        const res = await fishApi.createStocking({ ...data, pondId });
        toast.success(`🐟 ${data.quantity} ${data.species} stocking recorded!`);
        onSuccess(res.data);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save stocking record");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onCancel}
      title={existingStocking ? "✏️ Edit Stocking Record" : "🐟 Record Fish Stocking"}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* SECTION 1: Species Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-white border-b pb-2">Species Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Species *</label>
              <input
                list="species-options"
                {...register("species")}
                className={`w-full px-3 py-2 bg-slate-800 text-white border rounded-md  focus:ring-sky-500 focus:border-sky-500 ${errors.species ? 'border-red-500' : 'border-slate-600'}`}
                placeholder="Select or type species"
              />
              <datalist id="species-options">
                {SPECIES_OPTIONS.map(s => <option key={s} value={s} />)}
              </datalist>
              {errors.species && <p className="mt-1 text-xs text-red-500">{errors.species.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Local Name</label>
              <input
                type="text"
                {...register("localName")}
                className="w-full px-3 py-2 bg-slate-800 text-white border border-slate-600 rounded-md  focus:ring-sky-500 focus:border-sky-500"
                placeholder="e.g., Pyasi"
              />
              <p className="mt-1 text-xs text-slate-400">Optional — enter local/regional name</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Stocking Date *</label>
              <input
                type="date"
                {...register("stockingDate")}
                className={`w-full px-3 py-2 bg-slate-800 text-white border rounded-md  focus:ring-sky-500 focus:border-sky-500 ${errors.stockingDate ? 'border-red-500' : 'border-slate-600'}`}
              />
              {errors.stockingDate && <p className="mt-1 text-xs text-red-500">{errors.stockingDate.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Source / Supplier</label>
              <input
                type="text"
                {...register("sourceSupplier")}
                className="w-full px-3 py-2 bg-slate-800 text-white border border-slate-600 rounded-md  focus:ring-sky-500 focus:border-sky-500"
                placeholder="e.g., Mirzapur Fish Seed Center"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: Quantity & Size */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-white border-b pb-2">Quantity & Size</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Quantity *</label>
              <input
                type="number"
                {...register("quantity")}
                className={`w-full px-4 py-3 text-lg bg-slate-800 text-white border rounded-md  focus:ring-sky-500 focus:border-sky-500 ${errors.quantity ? 'border-red-500' : 'border-slate-600'}`}
                placeholder="e.g., 2500"
              />
              {errors.quantity && <p className="mt-1 text-xs text-red-500">{errors.quantity.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Avg Size at Stocking (cm) *</label>
              <input
                type="number"
                step="0.1"
                {...register("fingerlingSize_cm")}
                className={`w-full px-3 py-3 bg-slate-800 text-white border rounded-md  focus:ring-sky-500 focus:border-sky-500 ${errors.fingerlingSize_cm ? 'border-red-500' : 'border-slate-600'}`}
                placeholder="e.g., 4.5"
              />
              <p className="mt-1 text-xs text-slate-400">Average fingerling length at time of stocking</p>
              {errors.fingerlingSize_cm && <p className="mt-1 text-xs text-red-500">{errors.fingerlingSize_cm.message}</p>}
            </div>
          </div>
        </div>

        {/* SECTION 3: Cost */}
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setShowCost(!showCost)}
            className="flex items-center text-sm font-semibold text-white focus:outline-none"
          >
            {showCost ? <ChevronUp className="w-4 h-4 mr-1" /> : <ChevronDown className="w-4 h-4 mr-1" />}
            Add Cost Information (Optional)
          </button>
          
          {showCost && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-slate-750 p-4 rounded-lg border border-slate-700">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Cost per Fingerling (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  {...register("costPerFingerling")}
                  className="w-full px-3 py-2 bg-slate-800 text-white border border-slate-600 rounded-md  focus:ring-sky-500 focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Total Cost (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  {...register("totalCost")}
                  className={`w-full px-3 py-2 bg-slate-800 text-white border rounded-md  focus:ring-sky-500 focus:border-sky-500 ${isCostMismatched ? 'border-amber-500 bg-amber-500/10 text-white' : 'border-slate-600'}`}
                />
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleAutoCalculate}
                  disabled={!expectedTotal}
                  className="w-full px-4 py-2 border border-sky-500 text-sky-400 rounded-md hover:bg-sky-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Auto-calculate
                </button>
              </div>

              {(quantity && costPerFingerling) ? (
                <div className="col-span-3 text-sm text-slate-300 mt-2">
                  <span className="font-medium">₹{costPerFingerling}</span> per fingerling × <span className="font-medium">{quantity}</span> fish = <span className="font-medium">₹{expectedTotal}</span> total
                  {isCostMismatched && (
                    <span className="ml-2 text-amber-600 font-medium bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded">
                      ⚠️ Auto-calculated: ₹{expectedTotal} (differs from entered value)
                    </span>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* SECTION 4: Notes */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Notes</label>
          <textarea
            rows={3}
            {...register("notes")}
            className="w-full px-3 py-2 bg-slate-800 text-white border border-slate-600 rounded-md  focus:ring-sky-500 focus:border-sky-500"
            placeholder="Any additional details..."
          />
        </div>

        {/* FOOTER */}
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
            className="px-4 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600 disabled:opacity-50 font-medium  transition-colors"
          >
            {isSubmitting ? 'Saving...' : existingStocking ? 'Update Record' : 'Save Stocking Record'}
          </button>
        </div>

      </form>
    </Modal>
  );
};
