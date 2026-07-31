import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PriceType } from '../../types/financials.types';

const marketPriceSchema = z.object({
  priceDate: z.string().min(1, "Date required"),
  species: z.string().min(1, "Species required"),
  pricePerKg: z.number({ required_error: "Price required" }).positive("Must be positive"),
  priceType: z.string().min(1, "Type required"),
  marketLocation: z.string().optional(),
  notes: z.string().optional(),
});

type MarketPriceFormData = z.infer<typeof marketPriceSchema>;

interface MarketPriceFormProps {
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

export const MarketPriceForm: React.FC<MarketPriceFormProps> = ({ onSubmit, onCancel, isLoading }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<MarketPriceFormData>({
    resolver: zodResolver(marketPriceSchema),
    defaultValues: {
      priceDate: new Date().toISOString().split('T')[0],
      species: 'Pangasius',
      pricePerKg: '' as any,
      priceType: 'FARM_GATE',
      marketLocation: '',
      notes: ''
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Date *</label>
          <input 
            type="date" 
            {...register('priceDate')}
            className="w-full rounded-lg border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500" 
          />
          {errors.priceDate && <p className="text-red-500 text-xs mt-1">{errors.priceDate.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Species *</label>
          <input 
            type="text" 
            {...register('species')}
            className="w-full rounded-lg border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500" 
          />
          {errors.species && <p className="text-red-500 text-xs mt-1">{errors.species.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Price per Kg (₹) *</label>
          <input 
            type="number" 
            step="0.01"
            {...register('pricePerKg', { valueAsNumber: true })}
            className="w-full rounded-lg border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500" 
          />
          {errors.pricePerKg && <p className="text-red-500 text-xs mt-1">{errors.pricePerKg.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Price Type *</label>
          <select 
            {...register('priceType')}
            className="w-full rounded-lg border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500"
          >
            <option value="FARM_GATE">Farm Gate</option>
            <option value="WHOLESALE">Wholesale Market</option>
            <option value="RETAIL">Retail</option>
          </select>
          {errors.priceType && <p className="text-red-500 text-xs mt-1">{errors.priceType.message}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Market Location (Optional)</label>
          <input 
            type="text" 
            {...register('marketLocation')}
            className="w-full rounded-lg border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500" 
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
          <textarea 
            {...register('notes')}
            rows={2}
            className="w-full rounded-lg border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500" 
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-sky-600 text-white font-medium rounded-lg hover:bg-sky-700 transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Record Price'}
        </button>
      </div>
    </form>
  );
};
