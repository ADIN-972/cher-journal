import api from './client';
import type { SignupData, LoginResponse, User, ApiResponse } from '@/types';

/**
 * Extract sessionToken from set-cookie header
 */
function extractSessionToken(headers: any): string | null {
  const setCookie = headers['set-cookie'];
  if (!setCookie) return null;

  const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];
  for (const cookie of cookies) {
    const match = cookie.match(/sessionToken=([^;]+)/);
    if (match) return match[1];
  }
  return null;
}

export const authAPI = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await api.post<ApiResponse<{ user: User; sessionToken?: string }>>('/auth/login', {
      email,
      password,
    });

    const user = response.data.data.user;
    // Prefer token from body, fallback to set-cookie header
    const token = response.data.data.sessionToken || extractSessionToken(response.headers) || '';

    return { token, user };
  },

  async signup(data: SignupData): Promise<LoginResponse> {
    const response = await api.post<ApiResponse<{ user: User; sessionToken?: string }>>('/auth/register', data);

    const user = response.data.data.user;
    const token = response.data.data.sessionToken || extractSessionToken(response.headers) || '';

    return { token, user };
  },

  async resetPassword(email: string): Promise<{ message: string }> {
    const response = await api.post<ApiResponse<{ message: string }>>('/auth/forgot-password', { email });
    return { message: response.data.data.message || 'Email envoye' };
  },

  async getMe(): Promise<User> {
    const response = await api.get<ApiResponse<{ user: User }>>('/auth/me');
    return response.data.data.user;
  },

  async sendVerificationCode(): Promise<{ message: string }> {
    const response = await api.post<ApiResponse<{ message: string }>>('/auth/send-verification');
    return { message: response.data.data.message || 'Code envoye' };
  },

  async verifyEmail(code: string): Promise<{ user: User }> {
    const response = await api.post<ApiResponse<{ user: User }>>('/auth/verify-email', { code });
    return { user: response.data.data.user };
  },
};
