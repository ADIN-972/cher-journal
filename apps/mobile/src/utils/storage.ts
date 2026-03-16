/**
 * AsyncStorage Utilities
 * Typed helpers for AsyncStorage operations
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '@/types';

const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  AUTH_USER: 'authUser',
  PREFERENCE_PREFIX: 'pref:',
} as const;

/**
 * Token Management
 */
export const tokenStorage = {
  async set(token: string): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  },

  async get(): Promise<string | null> {
    return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  async remove(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  },
};

/**
 * User Data Management
 */
export const userStorage = {
  async set(user: User): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
  },

  async get(): Promise<User | null> {
    const userJson = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_USER);
    if (!userJson) return null;
    try {
      return JSON.parse(userJson) as User;
    } catch {
      return null;
    }
  },

  async remove(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_USER);
  },
};

/**
 * User Preferences
 */
export const preferenceStorage = {
  async set<T>(key: string, value: T): Promise<void> {
    const storageKey = `${STORAGE_KEYS.PREFERENCE_PREFIX}${key}`;
    await AsyncStorage.setItem(storageKey, JSON.stringify(value));
  },

  async get<T>(key: string, defaultValue?: T): Promise<T | null> {
    const storageKey = `${STORAGE_KEYS.PREFERENCE_PREFIX}${key}`;
    const value = await AsyncStorage.getItem(storageKey);
    if (!value) return defaultValue ?? null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return defaultValue ?? null;
    }
  },

  async remove(key: string): Promise<void> {
    const storageKey = `${STORAGE_KEYS.PREFERENCE_PREFIX}${key}`;
    await AsyncStorage.removeItem(storageKey);
  },
};

/**
 * Clear all authentication data
 */
export const clearAuthStorage = async (): Promise<void> => {
  await Promise.all([
    AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN),
    AsyncStorage.removeItem(STORAGE_KEYS.AUTH_USER),
  ]);
};

/**
 * Clear all storage
 */
export const clearAllStorage = async (): Promise<void> => {
  await AsyncStorage.clear();
};
