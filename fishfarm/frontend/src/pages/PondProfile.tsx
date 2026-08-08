import React, { useState, useEffect } from 'react';
import { pondApi } from '../api/endpoints/pond.api';
import { PondWithCounts, PondWithFullDetails, InfrastructureItem, InfrastructureStats, UpdateInfrastructureItemForm, CreatePondForm } from '../types/pond.types';
import { PondSelector } from '../components/pond/PondSelector';
import { CreatePondModal } from '../components/pond/CreatePondModal';
import { EditPondModal } from '../components/pond/EditPondModal';
import { InfrastructureChecklist } from '../components/pond/InfrastructureChecklist';
import { PondStatsPanel } from '../components/pond/PondStatsPanel';
import { MapPin, Edit3 } from 'lucide-react';
import { FishTracking } from '../components/fish/FishTracking';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

export const PondProfile: React.FC = () => {
  const [ponds, setPonds] = useState<PondWithCounts[]>([]);
  const [selectedPond, setSelectedPond] = useState<PondWithFullDetails | null>(null);
  const [infraItems, setInfraItems] = useState<InfrastructureItem[]>([]);
  const [infraStats, setInfraStats] = useState<InfrastructureStats | null>(null);
  
  const [isLoadingPonds, setIsLoadingPonds] = useState(true);
  const [isLoadingPond, setIsLoadingPond] = useState(false);
  const [isLoadingInfra, setIsLoadingInfra] = useState(false);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'infrastructure' | 'fish_tracking'>('overview');

  useEffect(() => {
    loadPonds();
  }, []);

  const calculateInfraStats = (items: InfrastructureItem[]): InfrastructureStats => {
    let completed = 0;
    let inProgress = 0;
    let notStarted = 0;

    items.forEach(item => {
      if (item.status === 'COMPLETED') completed++;
      else if (item.status === 'IN_PROGRESS') inProgress++;
      else notStarted++;
    });

    const total = completed + inProgress + notStarted;
    const completionPercent = total > 0 ? (completed / total) * 100 : 0;

    return { total, completed, inProgress, notStarted, completionPercent };
  };

  const loadPonds = async () => {
    setIsLoadingPonds(true);
    try {
      const res = await pondApi.getUserPonds();
      if (res.success && res.data) {
        setPonds(res.data);
        const savedPondId = localStorage.getItem('fishfarm_selected_pond');
        const toSelect = res.data.find(p => p.id === savedPondId) ?? res.data[0];
        if (toSelect) {
          loadPondDetails(toSelect.id);
        }
      }
    } catch (error) {
      toast.error("Failed to load ponds");
    } finally {
      setIsLoadingPonds(false);
    }
  };

  const loadPondDetails = async (pondId: string) => {
    setIsLoadingPond(true);
    setIsLoadingInfra(true);
    localStorage.setItem('fishfarm_selected_pond', pondId);
    
    try {
      const [pondRes, infraRes] = await Promise.all([
        pondApi.getPondById(pondId),
        pondApi.getInfrastructureItems(pondId)
      ]);
      
      if (pondRes.success && pondRes.data) setSelectedPond(pondRes.data);
      if (infraRes.success && infraRes.data) {
        setInfraItems(infraRes.data);
        setInfraStats(calculateInfraStats(infraRes.data));
      }
    } catch (error) {
      toast.error("Failed to load pond details");
    } finally {
      setIsLoadingPond(false);
      setIsLoadingInfra(false);
    }
  };

  const handleItemUpdate = async (itemId: string, data: UpdateInfrastructureItemForm) => {
    if (!selectedPond) return;
    const currentItem = infraItems.find(i => i.id === itemId);
    if (!currentItem) return;

    // Optimistic UI update
    const updatedItems = infraItems.map(item => 
      item.id === itemId ? { ...item, ...data } as InfrastructureItem : item
    );
    setInfraItems(updatedItems);
    setInfraStats(calculateInfraStats(updatedItems));

    try {
      const res = await pondApi.updateInfrastructureItem(selectedPond.id, itemId, data);
      if (res.success && res.data) {
        // Sync with server data (e.g. for completedDate)
        const finalItems = infraItems.map(item => 
          item.id === itemId ? res.data : item
        );
        setInfraItems(finalItems);
        setInfraStats(calculateInfraStats(finalItems));
      } else {
        throw new Error(res.message);
      }
    } catch (error) {
      // Revert on failure
      setInfraItems(infraItems);
      setInfraStats(calculateInfraStats(infraItems));
      toast.error("Failed to update item");
    }
  };

  const handleItemAdd = async (data: Omit<UpdateInfrastructureItemForm, 'id'>) => {
    if (!selectedPond) return;
    try {
      const res = await pondApi.addInfrastructureItem(selectedPond.id, data);
      if (res.success && res.data) {
        const updatedItems = [res.data, ...infraItems];
        setInfraItems(updatedItems);
        setInfraStats(calculateInfraStats(updatedItems));
        toast.success("Item added");
      }
    } catch (error) {
      toast.error("Failed to add item");
    }
  };

  const handleItemDelete = async (itemId: string) => {
    if (!selectedPond) return;
    try {
      const res = await pondApi.deleteInfrastructureItem(selectedPond.id, itemId);
      if (res.success) {
        const updatedItems = infraItems.filter(i => i.id !== itemId);
        setInfraItems(updatedItems);
        setInfraStats(calculateInfraStats(updatedItems));
        toast.success("Item removed");
      }
    } catch (error) {
      toast.error("Failed to delete item");
    }
  };

  const handlePondCreated = (pond: PondWithFullDetails) => {
    setPonds(prev => [...prev, pond as unknown as PondWithCounts]);
    loadPondDetails(pond.id);
    setIsCreateModalOpen(false);
  };

  const handlePondUpdated = (updatedPond: any) => {
    setPonds(prev => prev.map(p => p.id === updatedPond.id ? { ...p, ...updatedPond } : p));
    setSelectedPond(prev => prev ? { ...prev, ...updatedPond } : prev);
    setIsEditModalOpen(false);
  };

  const handlePondDeleted = () => {
    const remaining = ponds.filter(p => p.id !== selectedPond?.id);
    setPonds(remaining);
    setSelectedPond(null);
    localStorage.removeItem('fishfarm_selected_pond');
    if (remaining.length > 0) {
      loadPondDetails(remaining[0].id);
    }
  };

  if (isLoadingPonds) {
    return (
      <div className="p-6 animate-pulse space-y-6">
        <div className="h-8 w-48 bg-slate-800 rounded"></div>
        <div className="flex gap-4">
          <div className="h-20 w-48 bg-slate-800 rounded-xl"></div>
          <div className="h-20 w-48 bg-slate-800 rounded-xl"></div>
        </div>
        <div className="flex gap-4">
          <div className="w-2/3 h-64 bg-slate-800 rounded-xl"></div>
          <div className="w-1/3 h-64 bg-slate-800 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (ponds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
        <div className="text-8xl mb-6 relative">
          🐟 <span className="absolute -bottom-2 -right-4 text-6xl">🌊</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">Welcome! Let's Set Up Your First Pond</h1>
        <p className="text-slate-400 max-w-lg mx-auto mb-10 text-lg">
          Add your pond details to start tracking your fish farm efficiently
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 mb-10 max-w-3xl">
          <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50 flex-1">
            <div className="text-2xl mb-3">📐</div>
            <p className="text-sm text-slate-300">Enter pond dimensions to calculate area automatically</p>
          </div>
          <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50 flex-1">
            <div className="text-2xl mb-3">🔧</div>
            <p className="text-sm text-slate-300">12 infrastructure setup tasks added automatically</p>
          </div>
          <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50 flex-1">
            <div className="text-2xl mb-3">📊</div>
            <p className="text-sm text-slate-300">Start tracking fish, water quality, and finances</p>
          </div>
        </div>
        
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-sky-500 hover:bg-sky-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-sky-500/20 transition-all hover:scale-105"
        >
          Create My First Pond
        </button>
        <p className="mt-6 text-sm text-slate-400">
          Already have data? <br />You can enter past data after creating your pond.
        </p>

        {isCreateModalOpen && (
          <CreatePondModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSuccess={handlePondCreated}
          />
        )}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in pb-24">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Pond Profile</h1>
          <p className="text-slate-400 text-sm mt-1">Manage your pond setup and infrastructure</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-sky-500 hover:bg-sky-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-md shadow-sky-500/10 transition-colors whitespace-nowrap"
        >
          + Create New Pond
        </button>
      </div>

      {/* POND SELECTOR STRIP */}
      {ponds.length > 1 && (
        <PondSelector
          ponds={ponds}
          selectedPondId={selectedPond?.id || null}
          onSelect={loadPondDetails}
          onCreateNew={() => setIsCreateModalOpen(true)}
        />
      )}

      {selectedPond && (
        <>
          {/* TABS */}
          <div className="flex border-b border-slate-800">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-3 px-6 font-medium text-sm transition-colors border-b-2 ${
                activeTab === 'overview'
                  ? 'bg-slate-800 text-white border-sky-400'
                  : 'text-slate-400 hover:text-white border-transparent hover:bg-slate-800/50'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('infrastructure')}
              className={`py-3 px-6 font-medium text-sm transition-colors border-b-2 flex items-center gap-2 ${
                activeTab === 'infrastructure'
                  ? 'bg-slate-800 text-white border-sky-400'
                  : 'text-slate-400 hover:text-white border-transparent hover:bg-slate-800/50'
              }`}
            >
              Infrastructure ({infraStats?.total || 0})
              {infraStats?.completionPercent === 100 && (
                <span className="bg-green-500/20 text-green-400 text-[10px] px-1.5 py-0.5 rounded font-bold">✓</span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('fish_tracking')}
              className={`py-3 px-6 font-medium text-sm transition-colors border-b-2 ${
                activeTab === 'fish_tracking'
                  ? 'bg-slate-800 text-white border-sky-400'
                  : 'text-slate-400 hover:text-white border-transparent hover:bg-slate-800/50'
              }`}
            >
              Fish Tracking
            </button>
            <Link
              to="/feeding"
              className="py-3 px-6 font-medium text-sm transition-colors border-b-2 text-slate-400 hover:text-white border-transparent hover:bg-slate-800/50 flex items-center gap-2"
            >
              🍽️ Feeding
            </Link>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            
            {/* LEFT COLUMN */}
            <div className="flex-1 space-y-6">
              
              {activeTab === 'overview' && (
                <div className="bg-slate-800 rounded-xl p-5 sm:p-6 border border-slate-700">
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                      🏞️ {selectedPond.name}
                    </h2>
                    <button
                      onClick={() => setIsEditModalOpen(true)}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors border border-slate-600 hover:border-slate-500"
                      title="Edit Pond"
                    >
                      <Edit3 size={18} />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-slate-300 mb-6 pb-6 border-b border-slate-700/50">
                    <MapPin size={16} className="text-slate-400 shrink-0" />
                    <span>{selectedPond.location}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 mb-6">
                    <div>
                      <span className="block text-xs text-slate-400 mb-1">Type</span>
                      <span className="font-medium text-white">{selectedPond.pondType}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-slate-400 mb-1">Established</span>
                      <span className="font-medium text-white">
                        {selectedPond.constructionDate ? new Date(selectedPond.constructionDate).toLocaleDateString() : 'Not recorded'}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs text-slate-400 mb-1">Soil Type</span>
                      <span className="font-medium text-white">{selectedPond.soilType}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-slate-400 mb-1">Water Source</span>
                      <span className="font-medium text-white">{selectedPond.waterSource}</span>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-700/50">
                    <h3 className="text-sm font-semibold text-sky-400 uppercase tracking-wider mb-4">📐 Dimensions</h3>
                    
                    <div className="flex justify-center my-6">
                      <div className="relative w-full max-w-[300px] border-2 border-sky-900/50 rounded-lg bg-sky-950/20 aspect-video flex items-center justify-center">
                        <div className="absolute -top-3 bg-slate-800 px-2 text-xs text-slate-300">{selectedPond.lengthFt} ft (length)</div>
                        <div className="text-center">
                          <span className="text-sky-300 font-medium">Depth</span>
                          <br />
                          <span className="text-xl font-bold text-white">{selectedPond.maxDepthFt} ft</span>
                        </div>
                        <div className="absolute -right-3 top-1/2 -translate-y-1/2 translate-x-full bg-slate-800 px-2 py-1 text-xs text-slate-300 rounded rotate-90 origin-left ml-3">
                          {selectedPond.widthFt} ft
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'infrastructure' && infraStats && (
                <InfrastructureChecklist
                  pondId={selectedPond.id}
                  items={infraItems}
                  stats={infraStats}
                  isLoading={isLoadingInfra}
                  onItemUpdate={handleItemUpdate}
                  onItemAdd={handleItemAdd}
                  onItemDelete={handleItemDelete}
                />
              )}

              {activeTab === 'fish_tracking' && (
                <FishTracking pondId={selectedPond.id} />
              )}
            </div>

            {/* RIGHT COLUMN */}
            <div className="lg:w-[320px] shrink-0">
              <PondStatsPanel pond={selectedPond} isLoading={isLoadingPond} />
            </div>

          </div>
        </>
      )}

      {isCreateModalOpen && (
        <CreatePondModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handlePondCreated}
        />
      )}

      {isEditModalOpen && selectedPond && (
        <EditPondModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          pond={selectedPond}
          onSuccess={handlePondUpdated}
          onDeleted={handlePondDeleted}
        />
      )}
    </div>
  );
};
