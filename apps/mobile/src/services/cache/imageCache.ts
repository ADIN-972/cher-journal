import * as FileSystem from 'expo-file-system';

// Use the cache directory from FileSystem
// cacheDirectory should be available in SDK 54's expo-file-system
const CACHE_DIR = `${(FileSystem as any).cacheDirectory || (FileSystem as any).libraryDirectory || '/tmp'}chapter-images`;
const MAX_CACHE_SIZE = 100 * 1024 * 1024; // 100MB

interface CacheEntry {
  id: string;
  path: string;
  size: number;
  lastAccessed: number;
}

let cacheIndex: Map<string, CacheEntry> = new Map();
let totalSize = 0;

/**
 * Initialize cache directory
 */
export const initImageCache = async (): Promise<void> => {
  try {
    const info = await FileSystem.getInfoAsync(CACHE_DIR);
    if (!info.exists) {
      await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
    }
  } catch (error) {
    console.warn('Failed to initialize image cache:', error);
  }
};

/**
 * Generate cache key from asset ID
 */
const getCacheKey = (assetId: string): string => `${CACHE_DIR}/${assetId}.jpg`;

/**
 * Get cached image path, or null if not cached
 */
export const getCachedImagePath = async (
  assetId: string
): Promise<string | null> => {
  const cachePath = getCacheKey(assetId);
  try {
    const info = await FileSystem.getInfoAsync(cachePath);
    if (info.exists) {
      // Update last accessed time
      if (cacheIndex.has(assetId)) {
        const entry = cacheIndex.get(assetId)!;
        entry.lastAccessed = Date.now();
      }
      return cachePath;
    }
  } catch (error) {
    console.warn('Error checking cached image:', error);
  }
  return null;
};

/**
 * Download and cache image from URL
 */
export const downloadAndCacheImage = async (
  assetId: string,
  imageUrl: string
): Promise<string> => {
  // Check if already cached
  const cached = await getCachedImagePath(assetId);
  if (cached) return cached;

  const cachePath = getCacheKey(assetId);

  try {
    await FileSystem.downloadAsync(imageUrl, cachePath);

    // Get file size
    const info = await FileSystem.getInfoAsync(cachePath);
    const fileSize = info.exists ? ((info as any).size || 0) : 0;

    // Update cache index
    cacheIndex.set(assetId, {
      id: assetId,
      path: cachePath,
      size: fileSize,
      lastAccessed: Date.now(),
    });

    totalSize += fileSize;

    // Clean up if cache exceeds limit
    if (totalSize > MAX_CACHE_SIZE) {
      await evictLRUEntries();
    }

    return cachePath;
  } catch (error) {
    console.error('Failed to download image:', error);
    throw error;
  }
};

/**
 * Evict least recently used entries until size is acceptable
 */
const evictLRUEntries = async (): Promise<void> => {
  const sortedEntries = Array.from(cacheIndex.values()).sort(
    (a, b) => a.lastAccessed - b.lastAccessed
  );

  for (const entry of sortedEntries) {
    if (totalSize <= MAX_CACHE_SIZE * 0.8) {
      break;
    }

    try {
      await FileSystem.deleteAsync(entry.path);
      cacheIndex.delete(entry.id);
      totalSize -= entry.size;
    } catch (error) {
      console.warn('Failed to delete cached image:', error);
    }
  }
};

/**
 * Clear entire image cache
 */
export const clearImageCache = async (): Promise<void> => {
  try {
    await FileSystem.deleteAsync(CACHE_DIR);
    await initImageCache();
    cacheIndex.clear();
    totalSize = 0;
  } catch (error) {
    console.error('Failed to clear cache:', error);
  }
};

/**
 * Get cache statistics
 */
export const getCacheStats = (): { size: number; count: number } => ({
  size: totalSize,
  count: cacheIndex.size,
});
