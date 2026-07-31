import api from '../axios';
import {
  FishOverview,
  FishStocking,
  MortalityLog,
  FishGrowthSample,
  CreateStockingForm,
  CreateMortalityForm,
  CreateGrowthSampleForm,
  MortalitySummary,
  GrowthSummary
} from '../../types/fish.types';
import { ApiResponse, PaginatedResponse } from '../../types/api.types';

export const fishApi = {

  getFishOverview: async (pondId: string): Promise<ApiResponse<FishOverview>> => {
    const res = await api.get(`/fish/overview?pondId=${pondId}`);
    return res.data;
  },

  // STOCKING
  getStockings: async (pondId: string): Promise<ApiResponse<FishStocking[]>> => {
    const res = await api.get(`/fish/stocking?pondId=${pondId}`);
    return res.data;
  },

  createStocking: async (data: CreateStockingForm): Promise<ApiResponse<FishStocking>> => {
    const res = await api.post('/fish/stocking', data);
    return res.data;
  },

  updateStocking: async (
    id: string, pondId: string, 
    data: Partial<CreateStockingForm>
  ): Promise<ApiResponse<FishStocking>> => {
    const res = await api.put(`/fish/stocking/${id}?pondId=${pondId}`, data);
    return res.data;
  },

  deleteStocking: async (id: string, pondId: string): Promise<ApiResponse<null>> => {
    const res = await api.delete(`/fish/stocking/${id}?pondId=${pondId}`);
    return res.data;
  },

  // MORTALITY
  getMortalityLogs: async (
    pondId: string, 
    params?: { page?: number; limit?: number; startDate?: string; endDate?: string }
  ): Promise<PaginatedResponse<MortalityLog>> => {
    const query = new URLSearchParams({ 
      pondId, 
      ...Object.fromEntries(
        Object.entries(params ?? {})
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)])
      )
    });
    const res = await api.get(`/fish/mortality?${query}`);
    return res.data;
  },

  createMortality: async (data: CreateMortalityForm): Promise<ApiResponse<MortalityLog>> => {
    const res = await api.post('/fish/mortality', data);
    return res.data;
  },

  getMortalitySummary: async (pondId: string): Promise<ApiResponse<MortalitySummary>> => {
    const res = await api.get(`/fish/mortality/summary?pondId=${pondId}`);
    return res.data;
  },

  updateMortality: async (
    id: string, 
    data: Partial<CreateMortalityForm>
  ): Promise<ApiResponse<MortalityLog>> => {
    const res = await api.put(`/fish/mortality/${id}`, data);
    return res.data;
  },

  deleteMortality: async (id: string, pondId: string): Promise<ApiResponse<null>> => {
    const res = await api.delete(`/fish/mortality/${id}?pondId=${pondId}`);
    return res.data;
  },

  // GROWTH
  getGrowthSamples: async (
    pondId: string, 
    params?: { page?: number; limit?: number }
  ): Promise<PaginatedResponse<FishGrowthSample>> => {
    const query = new URLSearchParams({ 
      pondId, 
      ...Object.fromEntries(
        Object.entries(params ?? {})
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)])
      )
    });
    const res = await api.get(`/fish/growth?${query}`);
    return res.data;
  },

  createGrowthSample: async (data: CreateGrowthSampleForm): Promise<ApiResponse<FishGrowthSample>> => {
    const res = await api.post('/fish/growth', data);
    return res.data;
  },

  getGrowthSummary: async (pondId: string): Promise<ApiResponse<GrowthSummary>> => {
    const res = await api.get(`/fish/growth/summary?pondId=${pondId}`);
    return res.data;
  },

  updateGrowthSample: async (
    id: string, 
    data: Partial<CreateGrowthSampleForm>
  ): Promise<ApiResponse<FishGrowthSample>> => {
    const res = await api.put(`/fish/growth/${id}`, data);
    return res.data;
  },

  deleteGrowthSample: async (id: string, pondId: string): Promise<ApiResponse<null>> => {
    const res = await api.delete(`/fish/growth/${id}?pondId=${pondId}`);
    return res.data;
  }
};
