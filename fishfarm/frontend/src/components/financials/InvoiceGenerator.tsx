import React from 'react';
import { Sale } from '../../types/financials.types';
import { generateInvoice } from '../../utils/pdf-generator';
import { format } from 'date-fns';

interface InvoiceGeneratorProps {
  sale: Sale;
  farmDetails?: { name: string; address: string; phone: string };
  onClose: () => void;
}

export const InvoiceGenerator: React.FC<InvoiceGeneratorProps> = ({ 
  sale, 
  farmDetails = { name: "AquaManager Farm", address: "Local Village, District", phone: "+91 9000000000" },
  onClose 
}) => {
  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-800">
        <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
          <h3 className="font-semibold text-white flex items-center gap-2">
            📄 Invoice Preview
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        <div className="p-8 overflow-y-auto bg-slate-950 flex-1 flex justify-center">
          {/* A4 Size Paper Representation */}
          <div className="bg-slate-900 shadow-sm w-full max-w-[210mm] p-8 min-h-[297mm] border border-slate-800">
            <div className="text-center mb-8 border-b-2 border-slate-800 pb-4">
              <h1 className="text-2xl font-bold uppercase tracking-widest text-white">TAX INVOICE</h1>
            </div>

            <div className="flex justify-between mb-8">
              <div>
                <h2 className="text-xl font-bold text-sky-400">{farmDetails.name}</h2>
                <p className="text-sm text-slate-400 whitespace-pre-line">{farmDetails.address}</p>
                <p className="text-sm text-slate-400 mt-1">Phone: {farmDetails.phone}</p>
              </div>
              <div className="text-right text-sm">
                <p className="text-slate-300"><span className="font-semibold text-white">Invoice No:</span> {sale.invoiceNumber || 'N/A'}</p>
                <p className="text-slate-300"><span className="font-semibold text-white">Date:</span> {format(new Date(sale.saleDate), 'dd MMM yyyy')}</p>
                <p className="mt-2 text-slate-300"><span className="font-semibold text-white">Status:</span> 
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                    sale.paymentStatus === 'COMPLETED' ? 'bg-green-900/20 text-green-400 border border-green-500/20' : 
                    sale.paymentStatus === 'PARTIAL' ? 'bg-amber-900/20 text-amber-400 border border-amber-500/20' : 
                    'bg-red-900/20 text-red-400 border border-red-500/20'
                  }`}>
                    {sale.paymentStatus}
                  </span>
                </p>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="font-semibold text-slate-300 mb-2 border-b border-slate-800 pb-1">Billed To</h3>
              <p className="font-medium text-white text-lg">{sale.buyerName}</p>
              {sale.buyerPhone && <p className="text-sm text-slate-400">Phone: {sale.buyerPhone}</p>}
              {sale.buyerLocation && <p className="text-sm text-slate-400">Location: {sale.buyerLocation}</p>}
            </div>

            <table className="w-full mb-8 text-sm text-left">
              <thead className="bg-slate-800/50 text-slate-400 uppercase border-y border-slate-700">
                <tr>
                  <th className="px-4 py-3 font-semibold">Description</th>
                  <th className="px-4 py-3 font-semibold text-right">Quantity</th>
                  <th className="px-4 py-3 font-semibold text-right">Rate</th>
                  <th className="px-4 py-3 font-semibold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="text-slate-300">
                <tr className="border-b border-slate-800">
                  <td className="px-4 py-3">Fish Sale (Fresh)</td>
                  <td className="px-4 py-3 text-right">{sale.fishQuantityKg.toLocaleString()} kg</td>
                  <td className="px-4 py-3 text-right">₹{sale.pricePerKg.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-medium text-white">₹{(sale.fishQuantityKg * sale.pricePerKg).toLocaleString()}</td>
                </tr>
                {sale.transportIncluded && sale.transportCostKg && (
                  <tr className="border-b border-slate-800">
                    <td className="px-4 py-3">Transport Charges</td>
                    <td className="px-4 py-3 text-right">{sale.fishQuantityKg.toLocaleString()} kg</td>
                    <td className="px-4 py-3 text-right">₹{sale.transportCostKg.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-medium text-white">₹{(sale.fishQuantityKg * sale.transportCostKg).toLocaleString()}</td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="flex justify-end mb-12">
              <div className="w-64 space-y-2 text-sm">
                <div className="flex justify-between font-bold text-lg border-b-2 border-slate-700 pb-1 text-white">
                  <span>Grand Total</span>
                  <span>₹{sale.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-green-400">
                  <span>Advance Received</span>
                  <span>- ₹{sale.advanceReceived.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-red-400 bg-red-900/20 p-2 mt-2 rounded border border-red-500/20">
                  <span>Balance Due</span>
                  <span>₹{sale.balancePending.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="mt-20 flex justify-between items-end border-t border-slate-800 pt-8 text-sm">
              <div className="text-slate-400 max-w-xs">
                <p>Notes: {sale.notes || 'Thank you for your business!'}</p>
                {sale.paymentMethod && <p className="mt-1">Payment Method: {sale.paymentMethod}</p>}
              </div>
              <div className="text-center w-48">
                <div className="border-b border-slate-600 mb-2 h-12"></div>
                <p className="font-medium text-slate-300">Authorized Signatory</p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-400 font-medium hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => generateInvoice(sale, farmDetails)}
            className="px-4 py-2 bg-sky-600 text-white font-medium rounded-lg hover:bg-sky-500 transition-colors flex items-center gap-2"
          >
            <span>📥</span> Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};
