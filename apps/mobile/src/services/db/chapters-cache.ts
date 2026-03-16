/**
 * Chapters Cache Service
 * Manages fetching chapters from API and caching to SQLite
 * Strategy: Check local cache first, fetch from API if needed or on force refresh
 */

import { chaptersAPI } from '@/services/api';
import { chaptersDB } from '@/services/db';
import type { Chapter } from '@/types';

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

  // If force refresh, skip cache and fetch from API
  if (forceRefresh) {
    try {
      const chapters = await chaptersAPI.getChapters();
      await chaptersDB.saveChapters(chapters);
      return chapters;
    } catch (error) {
      // If API fails on force refresh, return cached data if available
      const cached = await chaptersDB.getAllChapters();
      if (cached.length > 0) {
        return cached;
      }
      throw error;
    }
  }

  // Check if we have cached chapters
  const cached = await chaptersDB.getAllChapters();
  if (cached.length > 0) {
    return cached;
  }

  // No cache, fetch from API
  try {
    const chapters = await chaptersAPI.getChapters();
    await chaptersDB.saveChapters(chapters);
    return chapters;
  } catch (error) {
    // API failed and no cache available
    throw error;
  }
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
