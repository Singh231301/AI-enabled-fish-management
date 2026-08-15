import React, { useState } from 'react';
import { InfrastructureItem, InfrastructureStats, InfrastructureStatus, UpdateInfrastructureItemForm } from '../../types/pond.types';
import { CheckCircle2, Circle, Edit2, Plus, Trash2, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface InfrastructureChecklistProps {
  pondId: string;
  items: InfrastructureItem[];
  stats: InfrastructureStats;
  isLoading: boolean;
  onItemUpdate: (itemId: string, data: UpdateInfrastructureItemForm) => Promise<void>;
  onItemAdd: (data: Omit<UpdateInfrastructureItemForm, 'id'>) => Promise<void>;
  onItemDelete: (itemId: string) => Promise<void>;
}

const itemSchema = z.object({
  itemName: z.string().min(2, "Name required").max(100),
  description: z.string().max(500).optional(),
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED']).default('NOT_STARTED'),
});

type ItemFormData = z.infer<typeof itemSchema>;

export const InfrastructureChecklist: React.FC<InfrastructureChecklistProps> = ({
  pondId,
  items,
  stats,
  isLoading,
  onItemUpdate,
  onItemAdd,
  onItemDelete
}) => {
  const [activeTab, setActiveTab] = useState<'ALL' | 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{isOpen: boolean, id: string, name: string}>({ isOpen: false, id: '', name: '' });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      status: 'NOT_STARTED'
    }
  });

  const { 
    register: editRegister, 
    handleSubmit: handleEditSubmit, 
    reset: resetEdit,
    formState: { isSubmitting: isEditSubmitting } 
  } = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema)
  });

  if (isLoading) {
    return (
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 animate-pulse">
        <div className="h-6 w-48 bg-slate-700 rounded mb-4"></div>
        <div className="h-4 w-full bg-slate-700 rounded mb-8"></div>
        <div className="space-y-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-20 bg-slate-750 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  const handleStatusToggle = async (item: InfrastructureItem) => {
    if (updatingStatusId) return;
    
    setUpdatingStatusId(item.id);
    const nextStatus: Record<InfrastructureStatus, InfrastructureStatus> = {
      NOT_STARTED: 'IN_PROGRESS',
      IN_PROGRESS: 'COMPLETED',
      COMPLETED: 'NOT_STARTED'
    };
    
    try {
      await onItemUpdate(item.id, { status: nextStatus[item.status] });
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const onAddSubmit = async (data: ItemFormData) => {
    await onItemAdd(data);
    setIsAddingItem(false);
    reset();
  };

  const onEditSave = async (data: ItemFormData) => {
    if (!editingItemId) return;
    await onItemUpdate(editingItemId, data);
    setEditingItemId(null);
  };

  const startEdit = (item: InfrastructureItem) => {
    resetEdit({
      itemName: item.itemName,
      description: item.description || '',
      status: item.status
    });
    setEditingItemId(item.id);
  };

  const handleDelete = (itemId: string, itemName: string) => {
    setDeleteDialog({ isOpen: true, id: itemId, name: itemName });
  };

  const executeDelete = async () => {
    if (deleteDialog.id) {
      await onItemDelete(deleteDialog.id);
      setDeleteDialog({ isOpen: false, id: '', name: '' });
    }
  };

  const filteredItems = items.filter(item => {
    if (activeTab === 'ALL') return true;
    return item.status === activeTab;
  });

  // When 'ALL' is selected, group items
  const notStartedItems = filteredItems.filter(i => i.status === 'NOT_STARTED');
  const inProgressItems = filteredItems.filter(i => i.status === 'IN_PROGRESS');
  const completedItems = filteredItems.filter(i => i.status === 'COMPLETED');

  let displayItems = [...notStartedItems, ...inProgressItems];
  const shouldCollapseCompleted = activeTab === 'ALL' && completedItems.length >= 3;
  
  if (!shouldCollapseCompleted || showCompleted || (activeTab as string) === 'COMPLETED') {
    displayItems = [...displayItems, ...completedItems];
  }

  const progressBarColor = stats.completionPercent < 34 ? 'bg-red-500' 
    : stats.completionPercent < 67 ? 'bg-amber-500' 
    : stats.completionPercent < 100 ? 'bg-sky-500' 
    : 'bg-green-500';

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
      {/* HEADER SECTION */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              🔧 Infrastructure Setup Checklist
            </h2>
            <p className="text-slate-400 text-sm mt-1">Track your pond setup progress</p>
          </div>
          <button 
            onClick={() => setIsAddingItem(!isAddingItem)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {isAddingItem ? <X size={16} /> : <Plus size={16} />}
            {isAddingItem ? 'Cancel' : 'Add Custom Item'}
          </button>
        </div>

        {/* PROGRESS BAR */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-300 font-medium">Progress</span>
            <span className="text-slate-400">{stats.completed} of {stats.total} items completed ({Math.round(stats.completionPercent)}%)</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-2.5 mb-3 overflow-hidden">
            <div className={`h-2.5 rounded-full transition-all duration-500 ${progressBarColor}`} style={{ width: `${stats.completionPercent}%` }}></div>
          </div>
          <div className="flex gap-4 text-xs font-medium">
            <span className="flex items-center gap-1 bg-slate-900/50 px-2 py-1 rounded-md text-green-400">
              ✅ {stats.completed} Completed
            </span>
            <span className="flex items-center gap-1 bg-slate-900/50 px-2 py-1 rounded-md text-amber-400">
              🔄 {stats.inProgress} In Progress
            </span>
            <span className="flex items-center gap-1 bg-slate-900/50 px-2 py-1 rounded-md text-slate-400">
              ⏳ {stats.notStarted} Not Started
            </span>
          </div>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="flex px-6 border-b border-slate-700 overflow-x-auto scrollbar-hide">
        {(['ALL', 'NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap py-3 px-4 text-sm font-medium transition-colors border-b-2 ${
              activeTab === tab 
                ? 'border-sky-400 text-sky-400' 
                : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            {tab === 'ALL' ? `All (${stats.total})` :
             tab === 'NOT_STARTED' ? `Not Started (${stats.notStarted})` :
             tab === 'IN_PROGRESS' ? `In Progress (${stats.inProgress})` :
             `Completed (${stats.completed})`}
          </button>
        ))}
      </div>

      <div className="p-6">
        {/* INLINE ADD FORM */}
        <div className={`overflow-hidden transition-all duration-300 ${isAddingItem ? 'max-h-[300px] mb-6 opacity-100' : 'max-h-0 opacity-0'}`}>
          <form onSubmit={handleSubmit(onAddSubmit)} className="bg-slate-750 p-4 rounded-xl border border-sky-900/30">
            <h4 className="font-medium text-white mb-3 flex items-center gap-2">
              <Plus size={16} className="text-sky-400" /> New Infrastructure Item
            </h4>
            <div className="flex flex-col sm:flex-row gap-3 mb-3">
              <div className="flex-1">
                <input
                  {...register('itemName')}
                  placeholder="Item Name (e.g., pH Meter)"
                  className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
                />
                {errors.itemName && <span className="text-red-400 text-xs mt-1">{errors.itemName.message}</span>}
              </div>
              <div className="w-full sm:w-40 shrink-0">
                <select
                  {...register('status')}
                  className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
                >
                  <option value="NOT_STARTED">Not Started</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
            </div>
            <div className="mb-3">
              <input
                {...register('description')}
                placeholder="Brief description (optional)"
                className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button 
                type="button" 
                onClick={() => setIsAddingItem(false)}
                className="px-3 py-1.5 text-sm text-slate-300 hover:text-white"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-1.5 bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium rounded-lg disabled:opacity-50"
              >
                {isSubmitting ? 'Adding...' : 'Add Item'}
              </button>
            </div>
          </form>
        </div>

        {/* ITEM LIST */}
        <div className="space-y-3">
          {displayItems.length === 0 && !isAddingItem && (
            <div className="text-center py-12 px-4 border border-dashed border-slate-700 rounded-xl">
              <div className="bg-slate-800/50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 size={24} className="text-slate-500" />
              </div>
              <p className="text-slate-300 font-medium">No items found in this category.</p>
              <p className="text-slate-500 text-sm mt-1">Try switching tabs or add a new item.</p>
            </div>
          )}

          {displayItems.map((item) => {
            const isEditing = editingItemId === item.id;
            
            if (isEditing) {
              return (
                <form key={item.id} onSubmit={handleEditSubmit(onEditSave)} className="bg-slate-700 p-4 rounded-xl border border-sky-500/50 animate-fade-in">
                  <div className="flex flex-col sm:flex-row gap-3 mb-3">
                    <div className="flex-1">
                      <input
                        {...editRegister('itemName')}
                        className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
                      />
                    </div>
                    <div className="w-full sm:w-40 shrink-0">
                      <select
                        {...editRegister('status')}
                        className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
                      >
                        <option value="NOT_STARTED">Not Started</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-3">
                    <textarea
                      {...editRegister('description')}
                      rows={2}
                      className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:border-sky-500 focus:outline-none resize-none"
                    ></textarea>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button 
                      type="button" 
                      onClick={() => setEditingItemId(null)}
                      className="px-3 py-1.5 text-sm text-slate-300 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={isEditSubmitting}
                      className="px-4 py-1.5 bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium rounded-lg disabled:opacity-50"
                    >
                      {isEditSubmitting ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </form>
              );
            }

            const isCompleted = item.status === 'COMPLETED';
            const isUpdating = updatingStatusId === item.id;

            return (
              <div 
                key={item.id} 
                className={`group flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 rounded-lg border border-slate-600/50 transition-colors
                  ${isCompleted ? 'bg-slate-800/80' : 'bg-slate-750 hover:bg-slate-700'}`}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <button
                    onClick={() => handleStatusToggle(item)}
                    disabled={isUpdating}
                    className="shrink-0 mt-0.5"
                    title={`Click to mark as ${item.status === 'NOT_STARTED' ? 'In Progress' : item.status === 'IN_PROGRESS' ? 'Completed' : 'Not Started'}`}
                  >
                    {isUpdating ? (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-500 border-t-slate-200 animate-spin"></div>
                    ) : (
                      <>
                        {item.status === 'NOT_STARTED' && <Circle size={20} className="text-slate-500 hover:text-amber-400 transition-colors" />}
                        {item.status === 'IN_PROGRESS' && (
                          <div className="relative w-5 h-5 group/icon">
                            <Circle size={20} className="text-amber-400/30 absolute" />
                            <div className="absolute inset-0 overflow-hidden w-[10px]">
                              <Circle size={20} className="text-amber-400" />
                            </div>
                          </div>
                        )}
                        {item.status === 'COMPLETED' && <CheckCircle2 size={20} className="text-green-400 hover:text-slate-400 transition-colors" />}
                      </>
                    )}
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-medium text-sm sm:text-base truncate ${isCompleted ? 'line-through text-slate-400' : 'text-white'}`}>
                      {item.itemName}
                    </h4>
                    {item.description && (
                      <p className={`text-xs mt-0.5 line-clamp-2 ${isCompleted ? 'text-slate-500' : 'text-slate-400'}`}>
                        {item.description}
                      </p>
                    )}
                    {isCompleted && item.completedDate && (
                      <p className="text-[10px] text-green-500 mt-1">
                        Completed on: {new Date(item.completedDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto pl-8 sm:pl-0">
                  <div className="flex-1 sm:hidden"></div>
                  {/* Status Badge */}
                  <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider
                    ${item.status === 'NOT_STARTED' ? 'bg-slate-700 text-slate-400' : 
                      item.status === 'IN_PROGRESS' ? 'bg-amber-500/20 text-amber-400' : 
                      'bg-green-500/20 text-green-400'}`}
                  >
                    {item.status === 'NOT_STARTED' ? 'Not Started' : item.status === 'IN_PROGRESS' ? 'In Progress' : 'Done'}
                  </span>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => startEdit(item)}
                      className="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-slate-800 rounded transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id, item.itemName)}
                      className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {shouldCollapseCompleted && !showCompleted && activeTab === 'ALL' && (
            <button
              onClick={() => setShowCompleted(true)}
              className="w-full py-3 px-4 border border-dashed border-slate-600 rounded-lg text-sm text-slate-400 hover:text-slate-300 hover:bg-slate-800/50 transition-colors flex items-center justify-center gap-2"
            >
              ▼ Show {completedItems.length} completed items
            </button>
          )}
          {shouldCollapseCompleted && showCompleted && activeTab === 'ALL' && (
            <button
              onClick={() => setShowCompleted(false)}
              className="w-full py-2 text-sm text-slate-500 hover:text-slate-300 transition-colors"
            >
              ▲ Hide completed items
            </button>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Delete Infrastructure Item"
        message={`Are you sure you want to delete '${deleteDialog.name}'? This action cannot be undone.`}
        confirmText="Delete Item"
        onConfirm={executeDelete}
        onCancel={() => setDeleteDialog({ isOpen: false, id: '', name: '' })}
      />
    </div>
  );
};
