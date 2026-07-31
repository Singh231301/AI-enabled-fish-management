import React, { useState, useEffect } from 'react';
import { fishApi } from '../../api/endpoints/fish.api';
import { FishOverview, FishStocking, MortalityLog, FishGrowthSample } from '../../types/fish.types';
import { toast } from 'react-hot-toast';
import { Plus } from 'lucide-react';

import { StockingForm } from './StockingForm';
import { MortalityLogForm } from './MortalityLogForm';
import { GrowthSampleForm } from './GrowthSampleForm';
import { StockingCard } from './StockingCard';
import { MortalityTable } from './MortalityTable';
import { FishSummaryCards } from './FishSummaryCards';
import { GrowthChart } from './GrowthChart';
import { MortalityTrendChart } from './MortalityTrendChart';
import { SurvivalRateGauge } from './SurvivalRateGauge';
import { FCRTracker } from './FCRTracker';
import { BenchmarkComparison } from './BenchmarkComparison';

interface FishTrackingProps {
  pondId: string;
}

export const FishTracking: React.FC<FishTrackingProps> = ({ pondId }) => {
  const [overview, setOverview] = useState<FishOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'summary' | 'stocking' | 'mortality' | 'growth'>('summary');
  
  // Modals state
  const [showStockingForm, setShowStockingForm] = useState(false);
  const [editStocking, setEditStocking] = useState<FishStocking | undefined>();
  
  const [showMortalityForm, setShowMortalityForm] = useState(false);
  const [editMortality, setEditMortality] = useState<MortalityLog | undefined>();
  
  const [showGrowthForm, setShowGrowthForm] = useState(false);
  const [editGrowth, setEditGrowth] = useState<FishGrowthSample | undefined>();

  // Additional data for sub-tabs
  const [mortalityLogs, setMortalityLogs] = useState<MortalityLog[]>([]);
  const [isLoadingMortality, setIsLoadingMortality] = useState(false);

  useEffect(() => {
    if (pondId) {
      loadOverview();
    }
  }, [pondId]);

  useEffect(() => {
    if (activeTab === 'mortality') {
      loadMortalityLogs();
    }
  }, [activeTab, pondId]);

  const loadOverview = async () => {
    setIsLoading(true);
    try {
      const res = await fishApi.getFishOverview(pondId);
      if (res.success && res.data) {
        setOverview(res.data);
      }
    } catch (err) {
      toast.error("Failed to load fish overview");
    } finally {
      setIsLoading(false);
    }
  };

  const loadMortalityLogs = async () => {
    setIsLoadingMortality(true);
    try {
      const res = await fishApi.getMortalityLogs(pondId, { limit: 50 });
      if (res.success && res.data) {
        setMortalityLogs(res.data);
      }
    } catch (err) {
      toast.error("Failed to load mortality logs");
    } finally {
      setIsLoadingMortality(false);
    }
  };

  const handleDeleteStocking = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this stocking record?")) return;
    try {
      await fishApi.deleteStocking(id, pondId);
      toast.success("Record deleted");
      loadOverview();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete");
    }
  };

  const handleDeleteMortality = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this mortality log?")) return;
    try {
      await fishApi.deleteMortality(id, pondId);
      toast.success("Record deleted");
      loadOverview();
      if (activeTab === 'mortality') loadMortalityLogs();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete");
    }
  };

  const handleStockingSuccess = () => {
    setShowStockingForm(false);
    setEditStocking(undefined);
    loadOverview();
  };

  const handleMortalitySuccess = () => {
    setShowMortalityForm(false);
    setEditMortality(undefined);
    loadOverview();
    if (activeTab === 'mortality') loadMortalityLogs();
  };

  const handleGrowthSuccess = () => {
    setShowGrowthForm(false);
    setEditGrowth(undefined);
    loadOverview();
  };

  if (isLoading) {
    return (
      <div className="bg-slate-800 rounded-xl p-8 border border-slate-700 text-center animate-pulse">
        <div className="h-8 w-48 bg-slate-700 mx-auto rounded mb-4"></div>
        <div className="h-4 w-64 bg-slate-700 mx-auto rounded"></div>
      </div>
    );
  }

  if (!overview) return null;

  const noFish = overview.stockings.length === 0;

  return (
    <div className="bg-slate-100 rounded-xl p-4 sm:p-6 text-gray-900 border border-slate-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex space-x-2 border-b border-gray-300 w-full sm:w-auto">
          {['summary', 'stocking', 'mortality', 'growth'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`pb-2 px-4 font-medium text-sm transition-colors ${
                activeTab === tab
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div>
          {activeTab === 'stocking' && (
            <button
              onClick={() => setShowStockingForm(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              <Plus className="w-4 h-4 mr-1" /> Add Stocking
            </button>
          )}
          {activeTab === 'mortality' && !noFish && (
            <button
              onClick={() => setShowMortalityForm(true)}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
            >
              <Plus className="w-4 h-4 mr-1" /> Log Mortality
            </button>
          )}
          {activeTab === 'growth' && !noFish && (
            <button
              onClick={() => setShowGrowthForm(true)}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
            >
              <Plus className="w-4 h-4 mr-1" /> Record Sample
            </button>
          )}
        </div>
      </div>

      {noFish && activeTab !== 'stocking' ? (
        <div className="bg-white rounded-xl p-8 border border-gray-200 text-center flex flex-col items-center justify-center">
          <span className="text-5xl mb-4">🐟</span>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Fish Stocked Yet</h3>
          <p className="text-gray-500 mb-6 max-w-md">
            Before you can track mortality or growth, you need to record your initial fish stocking.
          </p>
          <button
            onClick={() => {
              setActiveTab('stocking');
              setShowStockingForm(true);
            }}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Record First Stocking
          </button>
        </div>
      ) : (
        <>
          {activeTab === 'summary' && (
            <div className="space-y-6">
              <FishSummaryCards overview={overview} />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GrowthChart growthSummary={overview.growthSummary} />
                <MortalityTrendChart mortalitySummary={overview.mortalitySummary} />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SurvivalRateGauge mortalitySummary={overview.mortalitySummary} />
                <FCRTracker growthSummary={overview.growthSummary} />
                <BenchmarkComparison growthSummary={overview.growthSummary} />
              </div>
            </div>
          )}

          {activeTab === 'stocking' && (
            <div className="space-y-4">
              {overview.stockings.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                  <p className="text-gray-500">No stocking records found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {overview.stockings.map(s => (
                    <StockingCard 
                      key={s.id} 
                      stocking={s} 
                      onEdit={(st) => { setEditStocking(st); setShowStockingForm(true); }}
                      onDelete={handleDeleteStocking}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'mortality' && (
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="mb-6 flex justify-between items-end">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Mortality History</h3>
                  <p className="text-sm text-gray-500">Log and track daily fish deaths</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total Mortality</p>
                  <p className="text-xl font-bold text-red-600">{overview.mortalitySummary.totalMortality}</p>
                </div>
              </div>
              <MortalityTable 
                logs={mortalityLogs} 
                isLoading={isLoadingMortality} 
                onEdit={(log) => { setEditMortality(log); setShowMortalityForm(true); }}
                onDelete={handleDeleteMortality}
              />
            </div>
          )}

          {activeTab === 'growth' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <GrowthChart growthSummary={overview.growthSummary} />
                </div>
                <div>
                  <BenchmarkComparison growthSummary={overview.growthSummary} />
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {showStockingForm && (
        <StockingForm
          pondId={pondId}
          existingStocking={editStocking}
          onSuccess={handleStockingSuccess}
          onCancel={() => { setShowStockingForm(false); setEditStocking(undefined); }}
        />
      )}

      {showMortalityForm && (
        <MortalityLogForm
          pondId={pondId}
          estimatedAlive={overview.mortalitySummary.estimatedAlive}
          existingLog={editMortality}
          onSuccess={handleMortalitySuccess}
          onCancel={() => { setShowMortalityForm(false); setEditMortality(undefined); }}
        />
      )}

      {showGrowthForm && (
        <GrowthSampleForm
          pondId={pondId}
          existingSample={editGrowth}
          onSuccess={handleGrowthSuccess}
          onCancel={() => { setShowGrowthForm(false); setEditGrowth(undefined); }}
        />
      )}

    </div>
  );
};
