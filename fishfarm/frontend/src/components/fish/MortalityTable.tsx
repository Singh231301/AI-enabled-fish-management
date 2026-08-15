import React from 'react';
import { MortalityLog } from '../../types/fish.types';
import { format } from 'date-fns';
import { Edit2, Trash2 } from 'lucide-react';

interface MortalityTableProps {
  logs: MortalityLog[];
  onEdit: (log: MortalityLog) => void;
  onDelete: (id: string) => void;
  isLoading: boolean;
}

export const MortalityTable: React.FC<MortalityTableProps> = ({ logs, onEdit, onDelete, isLoading }) => {
  if (isLoading) {
    return <div className="text-center py-8 text-slate-400">Loading records...</div>;
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-8 bg-slate-750 rounded-lg border border-slate-700">
        <p className="text-slate-400">No mortality logs recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-slate-700 rounded-lg ">
      <table className="min-w-full divide-y divide-slate-700">
        <thead className="bg-slate-750">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Date</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Dead Count</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Probable Reason</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Action Taken</th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-slate-800 divide-y divide-slate-700">
          {logs.map((log) => (
            <tr key={log.id} className="hover:bg-slate-750">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                {format(new Date(log.logDate), 'MMM d, yyyy')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-300">
                  {log.deadCount}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                {log.probableReason ? log.probableReason.replace('_', ' ') : '-'}
              </td>
              <td className="px-6 py-4 text-sm text-slate-400 max-w-xs truncate" title={log.actionTaken || ''}>
                {log.actionTaken || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => onEdit(log)}
                  className="text-sky-400 hover:text-sky-300 mx-2"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(log.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
