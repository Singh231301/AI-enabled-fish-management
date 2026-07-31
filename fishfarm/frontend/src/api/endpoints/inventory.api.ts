import api from '../axios';
import { ApiResponse } from '../../types/api.types';

export const getInventory = async (): Promise<ApiResponse<any>> => {
  return { success: true, message: 'Stub', data: null };
};
