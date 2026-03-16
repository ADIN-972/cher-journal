# Phase 2 Week 8-11: Assets & Offline Caching Implementation Plan

**Goal:** Download and cache chapter cover images locally. Implement intelligent caching with size limits and offline access.

**Architecture:**
- Image service handles downloading and caching to device filesystem
- Chapter list displays cached images with loading states
- Smart cache strategy: LRU (Least Recently Used) with 100MB limit
- Background downloads when online
- Fallback to cached/placeholder images when offline

---

## Task 1: Create ImageCache Service

**Files:**
- Create: `apps/mobile/src/services/cache/imageCache.ts`
- Create: `apps/mobile/src/services/cache/index.ts`

**Implementation:**

```typescript
// apps/mobile/src/services/cache/imageCache.ts

import * as FileSystem from 'expo-file-system';

const CACHE_DIR = `${FileSystem.cacheDirectory}chapter-images`;
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
    const downloadResult = await FileSystem.downloadAsync(imageUrl, cachePath);

    // Get file size
    const info = await FileSystem.getInfoAsync(cachePath);
    const fileSize = info.size || 0;

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
```

```typescript
// apps/mobile/src/services/cache/index.ts

export {
  initImageCache,
  getCachedImagePath,
  downloadAndCacheImage,
  clearImageCache,
  getCacheStats,
} from './imageCache';
```

**Commit:**

```bash
git add apps/mobile/src/services/cache/*.ts
git commit -m "feat: create image cache service with LRU eviction strategy"
```

---

## Task 2: Create ImageLoader Component

**Files:**
- Create: `apps/mobile/src/components/CachedImage.tsx`

**Implementation:**

```typescript
// apps/mobile/src/components/CachedImage.tsx

import React, { useEffect, useState } from 'react';
import { Image, View, ActivityIndicator } from 'react-native';
import {
  downloadAndCacheImage,
  getCachedImagePath,
} from '@/services/cache';

interface CachedImageProps {
  assetId: string;
  imageUrl: string;
  style?: object;
  width?: number;
  height?: number;
}

const CachedImage: React.FC<CachedImageProps> = ({
  assetId,
  imageUrl,
  style,
  width = 150,
  height = 200,
}) => {
  const [localPath, setLocalPath] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadImage();
  }, [assetId, imageUrl]);

  const loadImage = async () => {
    try {
      setLoading(true);
      setError(false);

      // Try to get from cache first
      const cachedPath = await getCachedImagePath(assetId);
      if (cachedPath) {
        setLocalPath(cachedPath);
        setLoading(false);
        return;
      }

      // Not in cache, download
      const downloadedPath = await downloadAndCacheImage(assetId, imageUrl);
      setLocalPath(downloadedPath);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load image:', err);
      setError(true);
      setLoading(false);
    }
  };

  if (error) {
    return (
      <View
        style={{
          width,
          height,
          backgroundColor: '#e5e5e5',
          justifyContent: 'center',
          alignItems: 'center',
          ...style,
        }}
      >
        <Text style={{ color: '#999', fontSize: 12 }}>Image failed to load</Text>
      </View>
    );
  }

  if (loading || !localPath) {
    return (
      <View
        style={{
          width,
          height,
          backgroundColor: '#f0f0f0',
          justifyContent: 'center',
          alignItems: 'center',
          ...style,
        }}
      >
        <ActivityIndicator size="small" color="#E11D48" />
      </View>
    );
  }

  return (
    <Image
      source={{ uri: `file://${localPath}` }}
      style={{ width, height, ...style }}
      onError={() => setError(true)}
    />
  );
};

export default CachedImage;
```

**Commit:**

```bash
git add apps/mobile/src/components/CachedImage.tsx
git commit -m "feat: create CachedImage component for intelligent image loading"
```

---

## Task 3: Integrate CachedImage into ChaptersListScreen

**Files:**
- Modify: `apps/mobile/src/screens/ChaptersListScreen.tsx`

Update to display chapter cover images:

```typescript
// In ChaptersListScreen renderItem - add image display

{item.coverAssetId && (
  <CachedImage
    assetId={item.coverAssetId}
    imageUrl={`${API_BASE_URL}/assets/${item.coverAssetId}`}
    width={80}
    height={120}
    style={{ marginRight: 12, borderRadius: 6 }}
  />
)}
```

**Commit:**

```bash
git add apps/mobile/src/screens/ChaptersListScreen.tsx
git commit -m "feat: display cached chapter cover images in chapter list"
```

---

## Task 4: Initialize Cache on App Startup

**Files:**
- Modify: `apps/mobile/src/app/_layout.tsx`

Add initialization code:

```typescript
import { initImageCache } from '@/services/cache';

useEffect(() => {
  initImageCache();
}, []);
```

**Commit:**

```bash
git add apps/mobile/src/app/_layout.tsx
git commit -m "feat: initialize image cache on app startup"
```

---

## Task 5: Verify TypeScript and Integration

```bash
npm run type-check
```

Expected: No errors ✓

**Commit:**

```bash
git add -A
git commit -m "feat: complete Phase 2 Week 8-11 - Asset caching with offline support"
```

---

## Definition of Done

✅ Chapter cover images cached locally
✅ Images display with loading states
✅ Cache size limited to 100MB
✅ LRU eviction when limit exceeded
✅ Background downloads when online
✅ Fallback to placeholder when offline
✅ TypeScript passes
✅ All commits atomic

---

**Plan saved.**
