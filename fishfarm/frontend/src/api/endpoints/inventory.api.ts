import axiosInstance from '../axios';
import {
  InventoryOverview,
  InventoryStats,
  EnrichedInventoryItem,
  TransactionWithItem,
  MaintenanceWithItem,
  CreateInventoryItemDTO,
  UpdateInventoryItemDTO,
  RecordPurchaseDTO,
  RecordUsageDTO,
  AdjustStockDTO,
  CreateMaintenanceDTO,
  CompleteMaintenanceDTO
} from '../../types/inventory.types';
import { PaginatedResponse, ApiResponse } from '../../types/api.types';

export const inventoryApi = {
  getOverview: async (pondId: string) => {
    const response = await axiosInstance.get<ApiResponse<InventoryOverview>>(`/inventory/overview?pondId=${pondId}`);
    return response.data.data;
  },

  getStats: async (pondId: string) => {
    const response = await axiosInstance.get<ApiResponse<InventoryStats>>(`/inventory/stats?pondId=${pondId}`);
    return response.data.data;
  },

  getItems: async (pondId: string, params?: { category?: string; lowStockOnly?: boolean; page?: number; limit?: number }) => {
    const response = await axiosInstance.get<PaginatedResponse<EnrichedInventoryItem>>(`/inventory`, {
      params: { pondId, ...params }
    });
    return response.data;
  },

  getItemById: async (pondId: string, id: string) => {
    const response = await axiosInstance.get<ApiResponse<EnrichedInventoryItem>>(`/inventory/${id}?pondId=${pondId}`);
    return response.data.data;
  },

  createItem: async (data: CreateInventoryItemDTO) => {
    const response = await axiosInstance.post<ApiResponse<EnrichedInventoryItem>>(`/inventory`, data);
    return response.data.data;
  },

  updateItem: async (pondId: string, id: string, data: UpdateInventoryItemDTO) => {
    const response = await axiosInstance.patch<ApiResponse<EnrichedInventoryItem>>(`/inventory/${id}?pondId=${pondId}`, data);
    return response.data.data;
  },

  deleteItem: async (pondId: string, id: string) => {
    const response = await axiosInstance.delete<ApiResponse<null>>(`/inventory/${id}?pondId=${pondId}`);
    return response.data.data;
  },

  getTransactions: async (pondId: string, params?: { transactionType?: string; startDate?: string; endDate?: string; page?: number; limit?: number }) => {
    const response = await axiosInstance.get<PaginatedResponse<TransactionWithItem>>(`/inventory/transactions`, {
      params: { pondId, ...params }
    });
    return response.data;
  },

  deleteTransaction: async (pondId: string, id: string) => {
    const response = await axiosInstance.delete<ApiResponse<null>>(`/inventory/transactions/${id}?pondId=${pondId}`);
    return response.data.data;
  },

  recordPurchase: async (data: RecordPurchaseDTO) => {
    const response = await axiosInstance.post<ApiResponse<any>>(`/inventory/transactions/purchase`, data);
    return response.data.data;
  },

  recordUsage: async (data: RecordUsageDTO) => {
    const response = await axiosInstance.post<ApiResponse<any>>(`/inventory/transactions/usage`, data);
    return response.data.data;
  },

  adjustStock: async (data: AdjustStockDTO) => {
    const response = await axiosInstance.post<ApiResponse<any>>(`/inventory/transactions/adjust`, data);
    return response.data.data;
  },

  getMaintenanceSchedule: async (pondId: string) => {
    const response = await axiosInstance.get<ApiResponse<MaintenanceWithItem[]>>(`/inventory/maintenance?pondId=${pondId}`);
    return response.data.data;
  },

  scheduleMaintenance: async (data: CreateMaintenanceDTO) => {
    const response = await axiosInstance.post<ApiResponse<any>>(`/inventory/maintenance`, data);
    return response.data.data;
  },

  completeMaintenance: async (id: string, data: CompleteMaintenanceDTO) => {
    const response = await axiosInstance.patch<ApiResponse<any>>(`/inventory/maintenance/${id}/complete`, data);
    return response.data.data;
  }
};
