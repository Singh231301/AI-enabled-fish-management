import React from 'react';
import { TransactionWithItem } from '../../types/inventory.types';
import { TRANSACTION_TYPE_CONFIG } from '../../utils/constants';
import * as Icons from 'lucide-react';
import { format } from 'date-fns';

interface TransactionHistoryProps {
  transactions: TransactionWithItem[];
  onDelete?: (id: string) => void;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({ transactions, onDelete }) => {
  if (transactions.length === 0) {
    return (
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8 text-center">
        <Icons.Activity className="mx-auto text-slate-400 mb-3" size={48} />
        <h3 className="text-lg font-medium text-slate-300">No transactions yet</h3>
        <p className="text-slate-400 mt-1">Stock usage and purchases will appear here.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-800/50 text-slate-400 font-medium border-b border-slate-800">
            <tr>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Item</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4 text-right">Quantity</th>
              <th className="px-6 py-4 text-right">Total Cost</th>
              <th className="px-6 py-4">Notes</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {transactions.map((tx) => {
              const config = TRANSACTION_TYPE_CONFIG[tx.transactionType];
              // @ts-ignore
              const IconComp = Icons[config.icon] || Icons.Activity;
              const isPositive = tx.transactionType === 'PURCHASE';

              return (
                <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 text-slate-300 whitespace-nowrap">
                    {format(new Date(tx.transactionDate), 'dd MMM yyyy')}
                  </td>
                  <td className="px-6 py-4 font-medium text-white">
                    {tx.inventory.itemName}
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-${config.color}-500/20 text-${config.color}-400`}>
                      <IconComp size={14} />
                      <span>{config.label}</span>
                    </div>
                  </td>
                  <td className={`px-6 py-4 text-right font-medium ${isPositive ? 'text-green-400' : 'text-blue-400'}`}>
                    {isPositive ? '+' : '-'}{tx.quantity} {tx.inventory.unit}
                  </td>
                  <td className="px-6 py-4 text-right text-slate-300 font-medium">
                    {tx.totalCost ? `₹${tx.totalCost.toLocaleString()}` : '-'}
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-xs">
                    {tx.referenceNote || '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {onDelete && (
                      <button 
                        onClick={() => onDelete(tx.id)}
                        className="text-red-400 hover:text-red-300 font-medium"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
