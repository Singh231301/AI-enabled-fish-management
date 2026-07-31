import api from '../axios';
import { ApiResponse } from '../../types/api.types';
import { LoginForm, RegisterForm, AuthResponse, User } from '../../types/auth.types';

export const login = async (data: LoginForm): Promise<ApiResponse<AuthResponse>> => {
  const response = await api.post('/auth/login', data);
  return response.data;
};

export const register = async (data: RegisterForm): Promise<ApiResponse<AuthResponse>> => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

export const getMe = async (): Promise<ApiResponse<User>> => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const updateProfile = async (data: Partial<User>): Promise<ApiResponse<User>> => {
  const response = await api.put('/auth/me', data);
  return response.data;
};

export const changePassword = async (data: any): Promise<ApiResponse<void>> => {
  const response = await api.post('/auth/change-password', data);
  return response.data;
};
