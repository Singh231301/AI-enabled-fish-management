import axiosInstance from '../axios';
import { 
  Task, 
  CreateTaskDTO, 
  UpdateTaskDTO, 
  CompleteTaskDTO, 
  SkipTaskDTO,
  TaskListQuery,
  TaskOverview,
  TaskStats,
  CalendarDay,
  AISuggestedTask
} from '../../types/tasks.types';

export const tasksApi = {
  create: async (data: CreateTaskDTO) => {
    const response = await axiosInstance.post<{ success: boolean; data: Task }>('/tasks', data);
    return response.data;
  },

  getAll: async (params?: TaskListQuery) => {
    const response = await axiosInstance.get<{
      success: boolean;
      tasks: Task[];
      total: number;
      counts: any;
      pagination: {
        page: number;
        limit: number;
        totalPages: number;
        totalItems: number;
      }
    }>('/tasks', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await axiosInstance.get<{ success: boolean; data: Task }>(`/tasks/${id}`);
    return response.data;
  },

  update: async (id: string, data: UpdateTaskDTO) => {
    const response = await axiosInstance.put<{ success: boolean; data: Task }>(`/tasks/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await axiosInstance.delete<{ success: boolean; message: string }>(`/tasks/${id}`);
    return response.data;
  },

  complete: async (id: string, data: CompleteTaskDTO) => {
    const response = await axiosInstance.post<{ success: boolean; data: { task: Task; nextTask: Task | null } }>(
      `/tasks/${id}/complete`, 
      data
    );
    return response.data;
  },

  skip: async (id: string, data: SkipTaskDTO) => {
    const response = await axiosInstance.post<{ success: boolean; data: { task: Task; nextTask: Task | null } }>(
      `/tasks/${id}/skip`, 
      data
    );
    return response.data;
  },

  getOverview: async (pondId?: string) => {
    const response = await axiosInstance.get<{ success: boolean; data: TaskOverview }>('/tasks/overview', { params: { pondId } });
    return response.data;
  },

  getStats: async (pondId?: string) => {
    const response = await axiosInstance.get<{ success: boolean; data: TaskStats }>('/tasks/stats', { params: { pondId } });
    return response.data;
  },

  getCalendar: async (year: number, month: number) => {
    const response = await axiosInstance.get<{ success: boolean; data: CalendarDay[] }>('/tasks/calendar', { 
      params: { year, month } 
    });
    return response.data;
  },

  getAISuggestions: async (pondId: string) => {
    const response = await axiosInstance.get<{ success: boolean; data: AISuggestedTask[] }>('/tasks/ai-suggestions', { 
      params: { pondId } 
    });
    return response.data;
  }
};
