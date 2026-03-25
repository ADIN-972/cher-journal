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
  emailVerified: boolean;

  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  restoreToken: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
  setEmailVerified: (verified: boolean) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  loading: true,
  error: null,
  isAuthenticated: false,
  emailVerified: false,

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
          emailVerified: user.emailVerified ?? false,
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

      if (token) {
        await AsyncStorage.setItem('authToken', token);
      }
      await AsyncStorage.setItem('authUser', JSON.stringify(user));

      set({
        token,
        user,
        isAuthenticated: true,
        emailVerified: user.emailVerified ?? false,
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
        emailVerified: user.emailVerified ?? false,
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
        emailVerified: false,
        error: null,
      });
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  },

  updateUser: async (data: Partial<User>) => {
    const current = useAuthStore.getState().user;
    if (!current) return;
    const updated = { ...current, ...data };
    set({ user: updated });
    await AsyncStorage.setItem('authUser', JSON.stringify(updated));
  },

  setEmailVerified: async (verified: boolean) => {
    const current = useAuthStore.getState().user;
    if (!current) return;
    const updated = { ...current, emailVerified: verified };
    set({ user: updated, emailVerified: verified });
    await AsyncStorage.setItem('authUser', JSON.stringify(updated));
  },

  clearError: () => set({ error: null }),
}));
