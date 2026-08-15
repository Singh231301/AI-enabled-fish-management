import React, { useState, useEffect } from 'react';
import { pondApi } from '../../api/endpoints/pond.api';
import { inventoryApi } from '../../api/endpoints/inventory.api';
import { 
  InventoryOverview, 
  EnrichedInventoryItem,
  CreateInventoryItemDTO,
  UpdateInventoryItemDTO,
  RecordPurchaseDTO,
  RecordUsageDTO,
  CreateMaintenanceDTO,
  CompleteMaintenanceDTO,
  TransactionWithItem,
  MaintenanceWithItem
} from '../../types/inventory.types';

import { InventorySummaryCards } from '../../components/inventory/InventorySummaryCards';
import { LowStockPanel } from '../../components/inventory/LowStockPanel';
import { StockLevelCard } from '../../components/inventory/StockLevelCard';
import { FeedStockTracker } from '../../components/inventory/FeedStockTracker';
import { StockUsageChart } from '../../components/inventory/StockUsageChart';
import { ReorderPlanner } from '../../components/inventory/ReorderPlanner';
import { TransactionHistory } from '../../components/inventory/TransactionHistory';
import { EquipmentCard } from '../../components/inventory/EquipmentCard';
import { InventoryItemForm } from '../../components/inventory/InventoryItemForm';
import { PurchaseForm } from '../../components/inventory/PurchaseForm';
import { UsageForm } from '../../components/inventory/UsageForm';
import { MaintenanceForm } from '../../components/inventory/MaintenanceForm';
import { CompleteMaintenance } from '../../components/inventory/CompleteMaintenance';

import { 
  Package, 
  Plus, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  Wrench,
  Search,
  Filter
} from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { toast } from 'react-hot-toast';

export const InventoryPage: React.FC = () => {
  const [ponds, setPonds] = useState<any[]>([]); const [selectedPond, setSelectedPond] = useState<any>(null); useEffect(() => { pondApi.getUserPonds().then(res => { setPonds(res.data); if (res.data.length > 0) setSelectedPond(res.data[0]); }); }, []);
  
  const [activeTab, setActiveTab] = useState<'overview' | 'items' | 'transactions' | 'equipment'>('overview');
  const [data, setData] = useState<InventoryOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Modal states
  const [showItemModal, setShowItemModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Selected items for modals
  const [selectedItem, setSelectedItem] = useState<EnrichedInventoryItem | null>(null);
  const [selectedMaintenance, setSelectedMaintenance] = useState<MaintenanceWithItem | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const loadData = async () => {
    if (!selectedPond) return;
    try {
      setIsLoading(true);
      const overview = await inventoryApi.getOverview(selectedPond.id);
      setData(overview);
    } catch (error) {
      console.error("Failed to load inventory data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedPond]);

  const handleCreateItem = async (dto: CreateInventoryItemDTO) => {
    if (!selectedPond) return;
    setIsSubmitting(true);
    try {
      await inventoryApi.createItem({ ...dto, pondId: selectedPond.id });
      setShowItemModal(false);
      loadData();
    } catch (error) {
      console.error("Failed to create item", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateItem = async (dto: UpdateInventoryItemDTO) => {
    if (!selectedPond || !selectedItem) return;
    setIsSubmitting(true);
    try {
      await inventoryApi.updateItem(selectedPond.id, selectedItem.id, dto);
      setShowItemModal(false);
      setSelectedItem(null);
      loadData();
    } catch (error) {
      console.error("Failed to update item", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!selectedPond || !selectedItem) return;
    setIsSubmitting(true);
    try {
      await inventoryApi.deleteItem(selectedPond.id, selectedItem.id);
      setShowDeleteConfirm(false);
      setShowItemModal(false);
      setSelectedItem(null);
      toast.success('Item deleted successfully');
      loadData();
    } catch (error) {
      console.error("Failed to delete item", error);
      toast.error('Failed to delete item');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecordPurchase = async (dto: RecordPurchaseDTO) => {
    if (!selectedPond) return;
    setIsSubmitting(true);
    try {
      await inventoryApi.recordPurchase({ ...dto, pondId: selectedPond.id });
      setShowPurchaseModal(false);
      setSelectedItem(null);
      loadData();
    } catch (error) {
      console.error("Failed to record purchase", error);
      toast.error((error as any)?.response?.data?.message || (error instanceof Error ? error.message : "Failed to record purchase"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecordUsage = async (dto: RecordUsageDTO) => {
    if (!selectedPond) return;
    setIsSubmitting(true);
    try {
      await inventoryApi.recordUsage({ ...dto, pondId: selectedPond.id });
      setShowUsageModal(false);
      setSelectedItem(null);
      loadData();
    } catch (error) {
      console.error("Failed to record usage", error);
      toast.error((error as any)?.response?.data?.message || (error instanceof Error ? error.message : "Failed to record usage"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScheduleMaintenance = async (dto: CreateMaintenanceDTO) => {
    setIsSubmitting(true);
    try {
      await inventoryApi.scheduleMaintenance(dto);
      setShowMaintenanceModal(false);
      loadData();
    } catch (error) {
      console.error("Failed to schedule maintenance", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteMaintenance = async (dto: CompleteMaintenanceDTO) => {
    if (!selectedMaintenance) return;
    setIsSubmitting(true);
    try {
      await inventoryApi.completeMaintenance(selectedMaintenance.id, dto);
      setShowCompleteModal(false);
      setSelectedMaintenance(null);
      loadData();
    } catch (error) {
      console.error("Failed to complete maintenance", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!selectedPond) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-500">
        <Package size={48} className="mb-4 text-slate-300" />
        <p>Please select a pond to view inventory</p>
      </div>
    );
  }

  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data) return null;

  const filteredItems = data.allItems.filter(item => {
    const matchesSearch = item.itemName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter ? item.category === categoryFilter : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header & Quick Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Inventory Management</h1>
          <p className="text-slate-400">Track feed, chemicals, and equipment</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => { setSelectedItem(null); setShowItemModal(true); }}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm shadow-blue-600/20"
          >
            <Plus size={16} className="mr-1.5" />
            Add Item
          </button>
          <button
            onClick={() => setShowPurchaseModal(true)}
            className="flex items-center px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-xl hover:bg-slate-700 transition-colors text-sm font-medium shadow-sm"
          >
            <ArrowDownToLine size={16} className="mr-1.5 text-green-600" />
            Record Purchase
          </button>
          <button
            onClick={() => setShowUsageModal(true)}
            className="flex items-center px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-xl hover:bg-slate-700 transition-colors text-sm font-medium shadow-sm"
          >
            <ArrowUpFromLine size={16} className="mr-1.5 text-blue-600" />
            Log Usage
          </button>
          <button
            onClick={() => setShowMaintenanceModal(true)}
            className="flex items-center px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-xl hover:bg-slate-700 transition-colors text-sm font-medium shadow-sm"
          >
            <Wrench size={16} className="mr-1.5 text-orange-500" />
            Schedule Maint.
          </button>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {activeTab === 'overview' && (
        <LowStockPanel 
          items={data.stats.lowStockItems} 
          onRestock={(item) => {
            setSelectedItem(item);
            setShowPurchaseModal(true);
          }}
        />
      )}

      {/* Navigation Tabs */}
      <div className="flex space-x-1 border-b border-slate-800">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'items', label: 'All Items' },
          { id: 'transactions', label: 'Transactions' },
          { id: 'equipment', label: 'Equipment & Maintenance' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-white hover:border-slate-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="py-2">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <InventorySummaryCards stats={data.stats} />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <FeedStockTracker 
                  feedData={data.stats.feedInventory} 
                  onRestock={(item) => {
                    setSelectedItem(item);
                    setShowPurchaseModal(true);
                  }}
                />
                <StockUsageChart transactions={data.recentTransactions} />
              </div>
              <div className="space-y-6">
                <ReorderPlanner 
                  lowStockItems={data.stats.lowStockItems}
                  onRecordPurchase={(item) => {
                    setSelectedItem(item);
                    setShowPurchaseModal(true);
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'items' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow placeholder:text-slate-500"
                />
              </div>
              <div className="relative md:w-48">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                >
                  <option value="">All Categories</option>
                  <option value="FEED">Feed</option>
                  <option value="CHEMICAL">Chemicals & Lime</option>
                  <option value="EQUIPMENT">Equipment</option>
                  <option value="TOOL">Tools</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map(item => (
                <StockLevelCard
                  key={item.id}
                  item={item}
                  onClick={(item) => { setSelectedItem(item); setShowItemModal(true); }}
                  onRecordUsage={(item) => { setSelectedItem(item); setShowUsageModal(true); }}
                  onRecordPurchase={(item) => { setSelectedItem(item); setShowPurchaseModal(true); }}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <TransactionHistory transactions={data.recentTransactions} />
        )}

        {activeTab === 'equipment' && (
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
              <h2 className="text-lg font-bold text-white mb-6">Upcoming Maintenance</h2>
              {data.stats.upcomingMaintenance.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.stats.upcomingMaintenance.map(maintenance => (
                    <EquipmentCard
                      key={maintenance.id}
                      maintenance={maintenance}
                      onComplete={(m) => {
                        setSelectedMaintenance(m);
                        setShowCompleteModal(true);
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <Wrench className="mx-auto text-slate-300 mb-3" size={48} />
                  <p>No maintenance scheduled in the next 7 days.</p>
                </div>
              )}
            </div>
            
            <h2 className="text-lg font-bold text-white mt-8 mb-4">Equipment Directory</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.allItems
                .filter(i => i.category === 'EQUIPMENT' || i.category === 'TOOL')
                .map(item => (
                  <StockLevelCard
                    key={item.id}
                    item={item}
                    onClick={(item) => { setSelectedItem(item); setShowItemModal(true); }}
                    onRecordUsage={(item) => { setSelectedItem(item); setShowUsageModal(true); }}
                    onRecordPurchase={(item) => { setSelectedItem(item); setShowPurchaseModal(true); }}
                  />
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <Modal 
        isOpen={showItemModal} 
        onClose={() => setShowItemModal(false)}
        title={selectedItem ? "Edit Inventory Item" : "Add Inventory Item"}
      >
        <InventoryItemForm
          initialData={selectedItem as any}
          onSubmit={(dto) => selectedItem ? handleUpdateItem(dto as any) : handleCreateItem(dto)}
          onCancel={() => setShowItemModal(false)}
          onDelete={() => setShowDeleteConfirm(true)}
          isLoading={isSubmitting}
        />
      </Modal>

      <Modal 
        isOpen={showPurchaseModal} 
        onClose={() => setShowPurchaseModal(false)}
        title="Record Purchase"
      >
        <PurchaseForm
          items={data.allItems}
          selectedItemId={selectedItem?.id}
          onSubmit={handleRecordPurchase}
          onCancel={() => setShowPurchaseModal(false)}
          isLoading={isSubmitting}
        />
      </Modal>

      <Modal 
        isOpen={showUsageModal} 
        onClose={() => setShowUsageModal(false)}
        title="Log Manual Usage"
      >
        <UsageForm
          items={data.allItems}
          selectedItemId={selectedItem?.id}
          onSubmit={handleRecordUsage}
          onCancel={() => setShowUsageModal(false)}
          isLoading={isSubmitting}
        />
      </Modal>

      <Modal 
        isOpen={showMaintenanceModal} 
        onClose={() => setShowMaintenanceModal(false)}
        title="Schedule Maintenance"
      >
        <MaintenanceForm
          items={data.allItems}
          selectedItemId={selectedItem?.id}
          onSubmit={handleScheduleMaintenance}
          onCancel={() => setShowMaintenanceModal(false)}
          isLoading={isSubmitting}
        />
      </Modal>

      <Modal 
        isOpen={showCompleteModal} 
        onClose={() => setShowCompleteModal(false)}
        title="Complete Maintenance"
      >
        {selectedMaintenance && (
          <CompleteMaintenance
            maintenance={selectedMaintenance}
            onSubmit={handleCompleteMaintenance}
            onCancel={() => setShowCompleteModal(false)}
            isLoading={isSubmitting}
          />
        )}
      </Modal>
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Inventory Item"
        message={`Are you sure you want to delete ${selectedItem?.itemName}? This action cannot be undone.`}
        confirmText="Delete Item"
        onConfirm={handleDeleteItem}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};
