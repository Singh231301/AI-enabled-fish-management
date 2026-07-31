import api from '../axios';
import type { 
  Pond, PondWithCounts, PondWithFullDetails, 
  InfrastructureItem, InfrastructureStats,
  CreatePondForm, UpdateInfrastructureItemForm
} from '../../types/pond.types';
import type { ApiResponse } from '../../types/api.types';

export const pondApi = {

  getUserPonds: async (): Promise<ApiResponse<PondWithCounts[]>> => {
    const res = await api.get('/ponds');
    return res.data;
  },

  getPondById: async (pondId: string): Promise<ApiResponse<PondWithFullDetails>> => {
    const res = await api.get(`/ponds/${pondId}`);
    return res.data;
  },

  createPond: async (data: CreatePondForm): Promise<ApiResponse<PondWithFullDetails>> => {
    const res = await api.post('/ponds', data);
    return res.data;
  },

  updatePond: async (pondId: string, data: Partial<CreatePondForm>): Promise<ApiResponse<Pond>> => {
    const res = await api.put(`/ponds/${pondId}`, data);
    return res.data;
  },

  deletePond: async (pondId: string): Promise<ApiResponse<null>> => {
    const res = await api.delete(`/ponds/${pondId}`);
    return res.data;
  },

  getInfrastructureItems: async (pondId: string): Promise<ApiResponse<InfrastructureItem[]>> => {
    const res = await api.get(`/ponds/${pondId}/infrastructure`);
    return res.data;
  },

  addInfrastructureItem: async (
    pondId: string, 
    data: Omit<UpdateInfrastructureItemForm, 'id'>
  ): Promise<ApiResponse<InfrastructureItem>> => {
    const res = await api.post(`/ponds/${pondId}/infrastructure`, data);
    return res.data;
  },

  updateInfrastructureItem: async (
    pondId: string, 
    itemId: string, 
    data: UpdateInfrastructureItemForm
  ): Promise<ApiResponse<InfrastructureItem>> => {
    const res = await api.put(`/ponds/${pondId}/infrastructure/${itemId}`, data);
    return res.data;
  },

  deleteInfrastructureItem: async (
    pondId: string, 
    itemId: string
  ): Promise<ApiResponse<null>> => {
    const res = await api.delete(`/ponds/${pondId}/infrastructure/${itemId}`);
    return res.data;
  },

  getInfrastructureStats: async (pondId: string): Promise<ApiResponse<InfrastructureStats>> => {
    const res = await api.get(`/ponds/${pondId}/infrastructure/stats`);
    return res.data;
  }
};
