import React, { useState, useEffect } from 'react';
import { pondApi } from '../../api/endpoints/pond.api';
import { Pond } from '../../types/pond.types';
import { FishTracking } from '../../components/fish/FishTracking';
import { Fish } from 'lucide-react';
import toast from 'react-hot-toast';

export const FishPage: React.FC = () => {
  const [ponds, setPonds] = useState<Pond[]>([]);
  const [selectedPondId, setSelectedPondId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPonds = async () => {
      try {
        const res = await pondApi.getUserPonds();
        if (res.success && res.data.length > 0) {
          setPonds(res.data);
          const saved = localStorage.getItem('fishfarm_selected_pond');
          const toSelect = res.data.find(p => p.id === saved) ?? res.data[0];
          setSelectedPondId(toSelect.id);
        }
      } catch (error) {
        toast.error('Failed to load ponds');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPonds();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  if (ponds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] bg-slate-900 rounded-xl border border-slate-800">
        <Fish size={64} className="text-slate-700 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">No Ponds Found</h2>
        <p className="text-slate-400 max-w-md text-center mb-6">
          You need to add a pond before you can manage fish stocking.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Fish className="text-sky-400" /> Fish Stocking & Tracking
          </h1>
          <p className="text-slate-400 mt-1">Manage fish batches, log mortality, and track growth.</p>
        </div>
        <div className="flex w-full lg:w-auto">
          <select
            value={selectedPondId}
            onChange={(e) => {
              setSelectedPondId(e.target.value);
              localStorage.setItem('fishfarm_selected_pond', e.target.value);
            }}
            className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            {ponds.map(pond => (
              <option key={pond.id} value={pond.id}>{pond.name}</option>
            ))}
          </select>
        </div>
      </div>
      <FishTracking pondId={selectedPondId} />
    </div>
  );
};
