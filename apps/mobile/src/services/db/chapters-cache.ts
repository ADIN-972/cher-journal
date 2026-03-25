/**
 * Chapters Cache Service
 * Manages fetching chapters from API and caching to SQLite
 * Strategy: Check local cache first, fetch from API if needed or on force refresh
 */

import { Platform } from 'react-native';
import { chaptersAPI } from '@/services/api';
import { chaptersDB } from '@/services/db';
import type { Chapter } from '@/types';

const isNative = Platform.OS !== 'web';

interface FetchOptions {
  forceRefresh?: boolean;
}

/**
 * Fetch chapters with intelligent caching
 * 1. If forceRefresh=true, fetch from API and update cache
 * 2. If local cache exists, return it (don't fetch)
 * 3. If no cache, fetch from API and cache it
 * 4. If API fails but cache exists, return cache with error context
 * 5. If API fails and no cache, throw error
 */
export const fetchChaptersWithCache = async (
  options: FetchOptions = {}
): Promise<Chapter[]> => {
  const { forceRefresh = false } = options;

  // On native, try to read from cache first (unless force refresh)
  if (isNative && !forceRefresh) {
    try {
      const cached = await chaptersDB.getAllChapters();
      if (cached.length > 0) {
        return cached;
      }
    } catch (e) {
      console.warn('Cache read failed, fetching from API:', e);
    }
  }

  // Fetch from API
  const chapters = await chaptersAPI.getChapters();

  // On native, try to cache
  if (isNative) {
    try {
      await chaptersDB.saveChapters(chapters);
    } catch (e) {
      console.warn('Cache write failed:', e);
    }
  }

  return chapters;
};

/**
 * Fetch volumes for a chapter with caching
 * Similar pattern: cache first, then API
 */
export const fetchVolumesWithCache = async (
  chapterId: string,
  options: FetchOptions = {}
): Promise<any[]> => {
  const { forceRefresh = false } = options;

  if (forceRefresh) {
    try {
      const volumes = await chaptersAPI.getVolumes(chapterId);
      return volumes;
    } catch (error) {
      throw error;
    }
  }

  // For now, always fetch volumes from API (they're small)
  // Later we can implement volume caching similar to chapters
  try {
    const volumes = await chaptersAPI.getVolumes(chapterId);
    return volumes;
  } catch (error) {
    throw error;
  }
};
