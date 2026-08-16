import React from 'react';
import { EnrichedGrowthSample, FishGrowthSample } from '../../types/fish.types';
import { format } from 'date-fns';
import { Edit2, Trash2 } from 'lucide-react';

interface GrowthTableProps {
  samples: EnrichedGrowthSample[];
  onEdit: (sample: FishGrowthSample) => void;
  onDelete: (id: string) => void;
  isLoading: boolean;
}

export const GrowthTable: React.FC<GrowthTableProps> = ({ samples, onEdit, onDelete, isLoading }) => {
  if (isLoading) {
    return <div className="text-center py-8 text-slate-400">Loading records...</div>;
  }

  if (samples.length === 0) {
    return (
      <div className="text-center py-8 bg-slate-750 rounded-lg border border-slate-700">
        <p className="text-slate-400">No growth samples recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-slate-700 rounded-lg mt-6">
      <table className="min-w-full divide-y divide-slate-700">
        <thead className="bg-slate-750">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Date</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Age (Days)</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Fish Sampled</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Avg Weight</th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-slate-800 divide-y divide-slate-700">
          {samples.map((sample) => (
            <tr key={sample.id} className="hover:bg-slate-750">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                {format(new Date(sample.sampleDate), 'MMM d, yyyy')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                {sample.fishAgeDays}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                {sample.fishSampledCount}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-400">
                {sample.averageWeightGrams}g
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => onEdit(sample)}
                  className="text-sky-400 hover:text-sky-300 mx-2"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(sample.id)}
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
