import { create } from 'zustand';
import type { User, SignupData } from '@/types';
import { authAPI } from '@/services/api/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  restoreToken: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  loading: true,
  error: null,
  isAuthenticated: false,

  restoreToken: async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const userJson = await AsyncStorage.getItem('authUser');

      if (token && userJson) {
        const user = JSON.parse(userJson);
        set({
          token,
          user,
          isAuthenticated: true,
          loading: false,
        });
      } else {
        set({ loading: false });
      }
    } catch (error) {
      console.error('Failed to restore token:', error);
      set({ loading: false });
    }
  },

  login: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const { token, user } = await authAPI.login(email, password);

      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('authUser', JSON.stringify(user));

      set({
        token,
        user,
        isAuthenticated: true,
        loading: false,
      });
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Erreur de connexion';
      set({
        error: message,
        loading: false,
      });
      throw error;
    }
  },

  signup: async (data: SignupData) => {
    set({ loading: true, error: null });
    try {
      const { token, user } = await authAPI.signup(data);

      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('authUser', JSON.stringify(user));

      set({
        token,
        user,
        isAuthenticated: true,
        loading: false,
      });
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Erreur d\'inscription';
      set({
        error: message,
        loading: false,
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('authUser');
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        error: null,
      });
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  },

  clearError: () => set({ error: null }),
}));
