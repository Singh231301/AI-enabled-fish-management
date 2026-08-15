import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sale, PaymentMethod } from '../../types/financials.types';
import { PAYMENT_METHOD_CONFIG } from '../../utils/constants';

const paymentSchema = z.object({
  amountReceived: z.number({ required_error: "Amount required" }).positive("Amount must be positive"),
  paymentDate: z.string().min(1, "Date required"),
  paymentMethod: z.string().min(1, "Method required"),
  notes: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface RecordPaymentModalProps {
  sale: Sale;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({ sale, onClose, onSubmit, isLoading }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amountReceived: sale.balancePending,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: sale.paymentMethod || 'CASH',
      notes: ''
    }
  });

  const paymentMethods = Object.keys(PAYMENT_METHOD_CONFIG) as PaymentMethod[];

  const handleFormSubmit = async (data: PaymentFormData) => {
    if (data.amountReceived > sale.balancePending) {
      alert("Amount received cannot exceed balance pending");
      return;
    }
    await onSubmit(data);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-slate-800">
        <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
          <h3 className="font-semibold text-white">Record Payment</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4">
          <div className="bg-amber-900/20 text-amber-400 p-3 rounded-lg text-sm flex justify-between items-center font-medium border border-amber-500/20">
            <span>Pending Balance:</span>
            <span className="text-lg">₹{sale.balancePending.toLocaleString()}</span>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Amount Received (₹) *</label>
            <input 
              type="number" 
              step="0.01"
              {...register('amountReceived', { valueAsNumber: true })}
              className="w-full rounded-lg bg-slate-800 border-slate-700 shadow-sm focus:border-green-500 focus:ring-green-500 font-bold text-green-400" 
            />
            {errors.amountReceived && <p className="text-red-500 text-xs mt-1">{errors.amountReceived.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Payment Date *</label>
            <input 
              type="date" 
              {...register('paymentDate')}
              className="w-full rounded-lg bg-slate-800 border-slate-700 text-white shadow-sm focus:border-green-500 focus:ring-green-500" 
            />
            {errors.paymentDate && <p className="text-red-500 text-xs mt-1">{errors.paymentDate.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Payment Method *</label>
            <select 
              {...register('paymentMethod')}
              className="w-full rounded-lg bg-slate-800 border-slate-700 text-white shadow-sm focus:border-green-500 focus:ring-green-500"
            >
              {paymentMethods.map(pm => (
                <option key={pm} value={pm}>
                  {PAYMENT_METHOD_CONFIG[pm].icon} {PAYMENT_METHOD_CONFIG[pm].label}
                </option>
              ))}
            </select>
            {errors.paymentMethod && <p className="text-red-500 text-xs mt-1">{errors.paymentMethod.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Notes</label>
            <textarea 
              {...register('notes')}
              rows={2}
              className="w-full rounded-lg bg-slate-800 border-slate-700 text-white shadow-sm focus:border-green-500 focus:ring-green-500" 
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-slate-300 bg-slate-800 font-medium rounded-lg hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-500 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
