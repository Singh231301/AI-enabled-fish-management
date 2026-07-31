import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sale, PaymentMethod } from '../../types/financials.types';
import { PAYMENT_METHOD_CONFIG } from '../../utils/constants';

const saleSchema = z.object({
  saleDate: z.string().min(1, "Date is required"),
  buyerName: z.string().min(2, "Buyer name required").max(200),
  buyerPhone: z.string().regex(/^[6-9]\d{9}$/, "Enter valid 10-digit Indian mobile number").optional().or(z.literal('')),
  buyerLocation: z.string().optional(),
  fishQuantityKg: z.number({ required_error: "Quantity required" }).positive(),
  pricePerKg: z.number({ required_error: "Price required" }).positive(),
  totalAmount: z.number({ required_error: "Total amount required" }).positive(),
  advanceReceived: z.number().nonnegative().default(0),
  paymentMethod: z.string().optional(),
  transportIncluded: z.boolean().default(false),
  transportCostKg: z.number().nonnegative().optional().or(z.literal('')),
  notes: z.string().optional(),
}).refine(data => data.advanceReceived <= data.totalAmount, {
  message: "Advance cannot exceed total amount",
  path: ["advanceReceived"]
});

type SaleFormData = z.infer<typeof saleSchema>;

interface SaleFormProps {
  initialData?: Sale | null;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

export const SaleForm: React.FC<SaleFormProps> = ({ initialData, onSubmit, onCancel, isLoading }) => {
  const [autoCalc, setAutoCalc] = useState(true);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<SaleFormData>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      saleDate: initialData?.saleDate ? new Date(initialData.saleDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      buyerName: initialData?.buyerName || '',
      buyerPhone: initialData?.buyerPhone || '',
      buyerLocation: initialData?.buyerLocation || '',
      fishQuantityKg: initialData?.fishQuantityKg || '' as any,
      pricePerKg: initialData?.pricePerKg || '' as any,
      totalAmount: initialData?.totalAmount || '' as any,
      advanceReceived: initialData?.advanceReceived || 0,
      paymentMethod: initialData?.paymentMethod || '',
      transportIncluded: initialData?.transportIncluded || false,
      transportCostKg: initialData?.transportCostKg || '' as any,
      notes: initialData?.notes || '',
    }
  });

  const qty = watch('fishQuantityKg');
  const price = watch('pricePerKg');
  const transportIncluded = watch('transportIncluded');
  const transportCost = watch('transportCostKg');
  const totalAmount = watch('totalAmount');
  const advance = watch('advanceReceived');

  useEffect(() => {
    if (autoCalc && qty && price && typeof qty === 'number' && typeof price === 'number') {
      let total = qty * price;
      if (transportIncluded && transportCost && typeof transportCost === 'number') {
        total += (qty * transportCost);
      }
      setValue('totalAmount', Number(total.toFixed(2)));
    }
  }, [qty, price, transportIncluded, transportCost, autoCalc, setValue]);

  const paymentMethods = Object.keys(PAYMENT_METHOD_CONFIG) as PaymentMethod[];
  
  const balance = (totalAmount || 0) - (advance || 0);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Sale Date *</label>
          <input 
            type="date" 
            {...register('saleDate')}
            className="w-full rounded-lg border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500" 
          />
          {errors.saleDate && <p className="text-red-500 text-xs mt-1">{errors.saleDate.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Buyer Name *</label>
          <input 
            type="text" 
            {...register('buyerName')}
            className="w-full rounded-lg border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500" 
          />
          {errors.buyerName && <p className="text-red-500 text-xs mt-1">{errors.buyerName.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Buyer Phone</label>
          <input 
            type="tel" 
            {...register('buyerPhone')}
            placeholder="e.g. 9876543210"
            className="w-full rounded-lg border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500" 
          />
          {errors.buyerPhone && <p className="text-red-500 text-xs mt-1">{errors.buyerPhone.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Buyer Location</label>
          <input 
            type="text" 
            {...register('buyerLocation')}
            className="w-full rounded-lg border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500" 
          />
        </div>

        <div className="md:col-span-2 bg-slate-50 p-4 rounded-lg border border-slate-200">
          <h4 className="font-semibold text-slate-700 mb-3">Sale Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Quantity (Kg) *</label>
              <input 
                type="number" 
                step="0.1"
                {...register('fishQuantityKg', { valueAsNumber: true })}
                className="w-full rounded-lg border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500" 
              />
              {errors.fishQuantityKg && <p className="text-red-500 text-xs mt-1">{errors.fishQuantityKg.message}</p>}
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

            <div className="flex items-center gap-2 md:col-span-2">
              <input 
                type="checkbox" 
                id="transportIncluded" 
                {...register('transportIncluded')} 
                className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              <label htmlFor="transportIncluded" className="text-sm font-medium text-slate-700">
                Include Transport Cost?
              </label>
            </div>

            {transportIncluded && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Transport Cost per Kg (₹)</label>
                <input 
                  type="number" 
                  step="0.01"
                  {...register('transportCostKg', { valueAsNumber: true })}
                  className="w-full rounded-lg border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500" 
                />
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 flex justify-between">
              <span>Total Amount (₹) *</span>
              <span className="text-xs text-sky-600 cursor-pointer" onClick={() => setAutoCalc(!autoCalc)}>
                {autoCalc ? 'Auto-calc' : 'Manual'}
              </span>
            </label>
            <input 
              type="number" 
              step="0.01"
              {...register('totalAmount', { valueAsNumber: true })}
              disabled={autoCalc && !!qty && !!price}
              className="w-full rounded-lg border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 font-bold bg-slate-50" 
            />
            {errors.totalAmount && <p className="text-red-500 text-xs mt-1">{errors.totalAmount.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Advance Received (₹)</label>
            <input 
              type="number" 
              step="0.01"
              {...register('advanceReceived', { valueAsNumber: true })}
              className="w-full rounded-lg border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 text-green-700 font-bold" 
            />
            {errors.advanceReceived && <p className="text-red-500 text-xs mt-1">{errors.advanceReceived.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Balance Pending (₹)</label>
            <input 
              type="number" 
              value={balance > 0 ? balance : 0}
              disabled
              className="w-full rounded-lg border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 font-bold bg-slate-100 text-red-600" 
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Payment Method (for advance)</label>
          <select 
            {...register('paymentMethod')}
            className="w-full rounded-lg border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500"
          >
            <option value="">Select Method</option>
            {paymentMethods.map(pm => (
              <option key={pm} value={pm}>
                {PAYMENT_METHOD_CONFIG[pm].icon} {PAYMENT_METHOD_CONFIG[pm].label}
              </option>
            ))}
          </select>
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
          className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : initialData ? 'Update Sale' : 'Record Sale'}
        </button>
      </div>
    </form>
  );
};
