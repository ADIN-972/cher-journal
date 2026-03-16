import api from './client';
import type { SignupData, LoginResponse } from '@/types';

export const authAPI = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  async signup(data: SignupData): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/signup', data);
    return response.data;
  },

  async resetPassword(email: string): Promise<{ message: string }> {
    const response = await api.post('/auth/reset-password', { email });
    return response.data;
  },
};
