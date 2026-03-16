import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '@stores/authStore';
import { handleApiError } from './errorHandler';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5003/api';

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Failed to get auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle responses and errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    // Handle 401 - logout user
    if (error.response?.status === 401) {
      const authStore = useAuthStore.getState();
      await authStore.logout();
    }

    const appError = handleApiError(error);
    return Promise.reject(appError);
  }
);

export default api;
