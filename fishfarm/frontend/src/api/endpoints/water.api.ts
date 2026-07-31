import { axiosInstance } from '../axios';
import { ApiResponse, PaginatedResponse } from '../../types/api.types';
import {
  WaterOverview,
  WaterQualityStats,
  WaterQualityLog,
  WaterTreatmentLog,
  CreateWaterQualityLogForm,
  CreateWaterTreatmentForm
} from '../../types/water.types';

export const waterApi = {
  getWaterOverview: async (pondId: string): Promise<ApiResponse<WaterOverview>> => {
    const res = await axiosInstance.get(`/water/overview?pondId=${pondId}`);
    return res.data;
  },

  getWaterStats: async (
    pondId: string,
    period: '7d' | '30d' | '90d' | 'all' = '30d'
  ): Promise<ApiResponse<WaterQualityStats>> => {
    const res = await axiosInstance.get(`/water/stats?pondId=${pondId}&period=${period}`);
    return res.data;
  },

  getWaterQualityLogs: async (
    pondId: string,
    params?: { page?: number; limit?: number; startDate?: string; endDate?: string }
  ): Promise<PaginatedResponse<WaterQualityLog>> => {
    const query = new URLSearchParams({
      pondId,
      ...Object.fromEntries(
        Object.entries(params ?? {})
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)])
      )
    });
    const res = await axiosInstance.get(`/water/logs?${query}`);
    return res.data;
  },

  createWaterQualityLog: async (
    data: CreateWaterQualityLogForm
  ): Promise<ApiResponse<WaterQualityLog>> => {
    const res = await axiosInstance.post('/water/logs', data);
    return res.data;
  },

  updateWaterQualityLog: async (
    id: string,
    pondId: string,
    data: Partial<CreateWaterQualityLogForm>
  ): Promise<ApiResponse<WaterQualityLog>> => {
    const res = await axiosInstance.put(`/water/logs/${id}?pondId=${pondId}`, data);
    return res.data;
  },

  deleteWaterQualityLog: async (
    id: string,
    pondId: string
  ): Promise<ApiResponse<null>> => {
    const res = await axiosInstance.delete(`/water/logs/${id}?pondId=${pondId}`);
    return res.data;
  },

  createWaterTreatment: async (
    data: CreateWaterTreatmentForm
  ): Promise<ApiResponse<WaterTreatmentLog>> => {
    const res = await axiosInstance.post('/water/treatments', data);
    return res.data;
  },

  getTreatmentLogs: async (
    pondId: string,
    params?: { page?: number; limit?: number }
  ): Promise<PaginatedResponse<WaterTreatmentLog>> => {
    const query = new URLSearchParams({
      pondId,
      ...Object.fromEntries(
        Object.entries(params ?? {})
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)])
      )
    });
    const res = await axiosInstance.get(`/water/treatments?${query}`);
    return res.data;
  },

  updateWaterTreatment: async (
    id: string,
    pondId: string,
    data: Partial<CreateWaterTreatmentForm>
  ): Promise<ApiResponse<WaterTreatmentLog>> => {
    const res = await axiosInstance.put(`/water/treatments/${id}?pondId=${pondId}`, data);
    return res.data;
  },

  deleteWaterTreatment: async (
    id: string,
    pondId: string
  ): Promise<ApiResponse<null>> => {
    const res = await axiosInstance.delete(`/water/treatments/${id}?pondId=${pondId}`);
    return res.data;
  },
};
