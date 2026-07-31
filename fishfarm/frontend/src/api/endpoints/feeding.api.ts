import axiosInstance from '../axios';
import { 
  FeedingOverview, 
  TodayFeedingStatus, 
  FeedingStats, 
  FeedingLog, 
  FeedingSchedule, 
  CreateFeedingLogForm, 
  CreateFeedingScheduleForm 
} from '../../types/feeding.types';
import { ApiResponse, PaginatedResponse } from '../../types/api.types';

export const feedingApi = {

  getFeedingOverview: async (pondId: string): Promise<ApiResponse<FeedingOverview>> => {
    const res = await axiosInstance.get(`/feeding/overview?pondId=${pondId}`);
    return res.data;
  },

  getTodayStatus: async (pondId: string): Promise<ApiResponse<TodayFeedingStatus>> => {
    const res = await axiosInstance.get(`/feeding/today?pondId=${pondId}`);
    return res.data;
  },

  getFeedingStats: async (
    pondId: string, 
    period: '7d' | '30d' | '90d' | 'all' = '30d'
  ): Promise<ApiResponse<FeedingStats>> => {
    const res = await axiosInstance.get(`/feeding/stats?pondId=${pondId}&period=${period}`);
    return res.data;
  },

  getFeedingLogs: async (
    pondId: string,
    params?: {
      page?: number;
      limit?: number;
      startDate?: string;
      endDate?: string;
      feedType?: string;
      fishResponse?: string;
    }
  ): Promise<PaginatedResponse<FeedingLog>> => {
    const query = new URLSearchParams({
      pondId,
      ...Object.fromEntries(
        Object.entries(params ?? {})
          .filter(([, v]) => v !== undefined && v !== '')
          .map(([k, v]) => [k, String(v)])
      )
    });
    const res = await axiosInstance.get(`/feeding/logs?${query}`);
    return res.data;
  },

  createFeedingLog: async (data: CreateFeedingLogForm): Promise<ApiResponse<FeedingLog>> => {
    const res = await axiosInstance.post('/feeding/logs', data);
    return res.data;
  },

  updateFeedingLog: async (
    id: string, 
    pondId: string,
    data: Partial<CreateFeedingLogForm>
  ): Promise<ApiResponse<FeedingLog>> => {
    const res = await axiosInstance.put(`/feeding/logs/${id}?pondId=${pondId}`, data);
    return res.data;
  },

  deleteFeedingLog: async (id: string, pondId: string): Promise<ApiResponse<null>> => {
    const res = await axiosInstance.delete(`/feeding/logs/${id}?pondId=${pondId}`);
    return res.data;
  },

  getSchedule: async (pondId: string): Promise<ApiResponse<FeedingSchedule | null>> => {
    const res = await axiosInstance.get(`/feeding/schedule?pondId=${pondId}`);
    return res.data;
  },

  upsertSchedule: async (data: CreateFeedingScheduleForm): Promise<ApiResponse<FeedingSchedule>> => {
    const res = await axiosInstance.post('/feeding/schedule', data);
    return res.data;
  },
};
