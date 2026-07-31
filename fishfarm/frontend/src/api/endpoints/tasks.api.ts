import api from '../axios';
import { ApiResponse } from '../../types/api.types';

export const getTasks = async (): Promise<ApiResponse<any>> => {
  return { success: true, message: 'Stub', data: null };
};
