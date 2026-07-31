import api from '../axios';
import type { DashboardApiResponse } from '../../types/dashboard.types';

export const dashboardApi = {
  getDashboard: async (pondId: string): Promise<DashboardApiResponse> => {
    const response = await api.get(`/dashboard/${pondId}`);
    return response.data;
  }
};
