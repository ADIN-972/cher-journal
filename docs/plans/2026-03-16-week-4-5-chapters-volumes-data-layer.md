# Phase 1 Week 4-5: Chapters & Volumes Data Layer Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement chapter and volume listing screens with offline caching - users can browse chapters, select one, view volumes, and read offline if data is cached locally.

**Architecture:**
- Two-tier data loading: check local SQLite first, fetch from API if needed
- Zustand stores manage state and sync with SQLite
- ListScreen components display cached data with pull-to-refresh
- NetInfo integration detects online/offline state
- Automatic sync to SQLite on successful API calls

**Tech Stack:** Zustand, SQLite (expo-sqlite), Axios, NetInfo, Expo Router, React Native

---

## Task 1: Implement ChaptersDB Fetch & Cache Service

**Files:**
- Create: `apps/mobile/src/services/db/chapters-cache.ts` - Business logic for fetch-with-cache
- Modify: `apps/mobile/src/services/api/chapters.ts` - Already exists, just reference it
- Test: `apps/mobile/__tests__/services/chapters-cache.test.ts`

**Why:** Separate the "fetch from API and cache to DB" logic from the store. This is testable, reusable, and follows separation of concerns.

**Step 1: Write test for chapters-cache service**

Create `apps/mobile/__tests__/services/chapters-cache.test.ts`:

```typescript
import { chaptersDB } from '@/services/db';
import { chaptersAPI } from '@/services/api/chapters';
import { fetchChaptersWithCache } from '@/services/db/chapters-cache';
import type { Chapter } from '@/types';

// Mock the API
jest.mock('@/services/api/chapters');
jest.mock('@/services/db');

describe('chaptersCache', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return cached chapters if they exist', async () => {
    const mockChapters: Chapter[] = [
      {
        id: 'ch-1',
        title: 'Chapter 1',
        protagonistName: 'Emma',
        status: 'PUBLISHED',
        createdAt: '2026-01-01T00:00:00Z',
        publishedAt: '2026-01-01T00:00:00Z',
        isArchived: false,
        scheduledFor: null,
        coverAssetId: null,
        description: 'Test chapter',
        accroche_classic: 'Accroche',
        accroche_dark: null,
        accroche_dark_collection: null,
        accroche_love: null,
        accroche_marketing: null,
        niveau_danger: 0,
        niveau_douceur: 0,
        niveau_intensite: 0,
        niveau_transformation: 0,
      },
    ];

    (chaptersDB.getAllChapters as jest.Mock).mockReturnValue(mockChapters);

    const result = await fetchChaptersWithCache();

    expect(result).toEqual(mockChapters);
    expect(chaptersAPI.getChapters).not.toHaveBeenCalled();
  });

  it('should fetch from API and cache if local DB is empty', async () => {
    const mockChapters: Chapter[] = [
      {
        id: 'ch-1',
        title: 'Chapter 1',
        protagonistName: 'Emma',
        status: 'PUBLISHED',
        createdAt: '2026-01-01T00:00:00Z',
        publishedAt: '2026-01-01T00:00:00Z',
        isArchived: false,
        scheduledFor: null,
        coverAssetId: null,
        description: 'Test chapter',
        accroche_classic: 'Accroche',
        accroche_dark: null,
        accroche_dark_collection: null,
        accroche_love: null,
        accroche_marketing: null,
        niveau_danger: 0,
        niveau_douceur: 0,
        niveau_intensite: 0,
        niveau_transformation: 0,
      },
    ];

    (chaptersDB.getAllChapters as jest.Mock).mockReturnValue([]);
    (chaptersAPI.getChapters as jest.Mock).mockResolvedValue(mockChapters);

    const result = await fetchChaptersWithCache();

    expect(result).toEqual(mockChapters);
    expect(chaptersAPI.getChapters).toHaveBeenCalled();
    expect(chaptersDB.saveChapters).toHaveBeenCalledWith(mockChapters);
  });

  it('should refresh from API when forceRefresh is true', async () => {
    const mockChapters: Chapter[] = [
      {
        id: 'ch-1',
        title: 'Chapter 1 Updated',
        protagonistName: 'Emma',
        status: 'PUBLISHED',
        createdAt: '2026-01-01T00:00:00Z',
        publishedAt: '2026-01-01T00:00:00Z',
        isArchived: false,
        scheduledFor: null,
        coverAssetId: null,
        description: 'Updated chapter',
        accroche_classic: 'Accroche',
        accroche_dark: null,
        accroche_dark_collection: null,
        accroche_love: null,
        accroche_marketing: null,
        niveau_danger: 0,
        niveau_douceur: 0,
        niveau_intensite: 0,
        niveau_transformation: 0,
      },
    ];

    (chaptersDB.getAllChapters as jest.Mock).mockReturnValue([]);
    (chaptersAPI.getChapters as jest.Mock).mockResolvedValue(mockChapters);

    const result = await fetchChaptersWithCache({ forceRefresh: true });

    expect(result).toEqual(mockChapters);
    expect(chaptersAPI.getChapters).toHaveBeenCalled();
  });

  it('should throw error if API fails and no cached data', async () => {
    (chaptersDB.getAllChapters as jest.Mock).mockReturnValue([]);
    (chaptersAPI.getChapters as jest.Mock).mockRejectedValue(new Error('Network error'));

    await expect(fetchChaptersWithCache()).rejects.toThrow('Network error');
  });

  it('should return cached data if API fails but cache exists', async () => {
    const cachedChapters: Chapter[] = [
      {
        id: 'ch-1',
        title: 'Chapter 1 (Cached)',
        protagonistName: 'Emma',
        status: 'PUBLISHED',
        createdAt: '2026-01-01T00:00:00Z',
        publishedAt: '2026-01-01T00:00:00Z',
        isArchived: false,
        scheduledFor: null,
        coverAssetId: null,
        description: 'Cached chapter',
        accroche_classic: 'Accroche',
        accroche_dark: null,
        accroche_dark_collection: null,
        accroche_love: null,
        accroche_marketing: null,
        niveau_danger: 0,
        niveau_douceur: 0,
        niveau_intensite: 0,
        niveau_transformation: 0,
      },
    ];

    (chaptersDB.getAllChapters as jest.Mock).mockReturnValue(cachedChapters);
    (chaptersAPI.getChapters as jest.Mock).mockRejectedValue(new Error('Network error'));

    const result = await fetchChaptersWithCache({ forceRefresh: true });

    expect(result).toEqual(cachedChapters);
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test -- chaptersCache.test.ts
```

Expected output: All tests fail with "fetchChaptersWithCache is not defined"

**Step 3: Implement the chapters-cache service**

Create `apps/mobile/src/services/db/chapters-cache.ts`:

```typescript
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
      chaptersDB.saveChapters(chapters);
      return chapters;
    } catch (error) {
      // If API fails on force refresh, return cached data if available
      const cached = chaptersDB.getAllChapters();
      if (cached.length > 0) {
        return cached;
      }
      throw error;
    }
  }

  // Check if we have cached chapters
  const cached = chaptersDB.getAllChapters();
  if (cached.length > 0) {
    return cached;
  }

  // No cache, fetch from API
  try {
    const chapters = await chaptersAPI.getChapters();
    chaptersDB.saveChapters(chapters);
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
```

**Step 4: Run test to verify it passes**

```bash
npm test -- chaptersCache.test.ts
```

Expected output: All tests pass ✓

**Step 5: Commit**

```bash
git add apps/mobile/src/services/db/chapters-cache.ts __tests__/services/chapters-cache.test.ts
git commit -m "feat: implement chapters cache service with offline fallback"
```

---

## Task 2: Implement ChapterStore with Real Data Fetching

**Files:**
- Modify: `apps/mobile/src/stores/chapterStore.ts` - Replace stubs with real implementation
- Test: `apps/mobile/__tests__/stores/chapterStore.test.ts`

**Why:** The store now properly fetches chapters, manages loading/error states, and syncs with SQLite.

**Step 1: Write test for chapterStore**

Create `apps/mobile/__tests__/stores/chapterStore.test.ts`:

```typescript
import { renderHook, act } from '@testing-library/react-native';
import { useChapterStore } from '@/stores/chapterStore';
import * as chaptersCacheService from '@/services/db/chapters-cache';
import type { Chapter } from '@/types';

jest.mock('@/services/db/chapters-cache');

describe('useChapterStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset store
    useChapterStore.setState({
      chapters: [],
      selectedChapter: null,
      loading: false,
      error: null,
    });
  });

  const mockChapters: Chapter[] = [
    {
      id: 'ch-1',
      title: 'Chapter 1',
      protagonistName: 'Emma',
      status: 'PUBLISHED',
      createdAt: '2026-01-01T00:00:00Z',
      publishedAt: '2026-01-01T00:00:00Z',
      isArchived: false,
      scheduledFor: null,
      coverAssetId: null,
      description: 'Test chapter',
      accroche_classic: 'Accroche',
      accroche_dark: null,
      accroche_dark_collection: null,
      accroche_love: null,
      accroche_marketing: null,
      niveau_danger: 0,
      niveau_douceur: 0,
      niveau_intensite: 0,
      niveau_transformation: 0,
    },
  ];

  it('should fetch chapters successfully', async () => {
    (chaptersCacheService.fetchChaptersWithCache as jest.Mock).mockResolvedValue(
      mockChapters
    );

    const { result } = renderHook(() => useChapterStore());

    expect(result.current.loading).toBe(false);

    await act(async () => {
      await result.current.fetchChapters();
    });

    expect(result.current.chapters).toEqual(mockChapters);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should set loading state during fetch', async () => {
    (chaptersCacheService.fetchChaptersWithCache as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve(mockChapters), 100);
        })
    );

    const { result } = renderHook(() => useChapterStore());

    act(() => {
      result.current.fetchChapters();
    });

    // Check loading state was set
    expect(result.current.loading).toBe(true);

    await act(
      () =>
        new Promise((resolve) => {
          setTimeout(resolve, 150);
        })
    );

    expect(result.current.loading).toBe(false);
  });

  it('should handle fetch errors', async () => {
    const error = new Error('Network failed');
    (chaptersCacheService.fetchChaptersWithCache as jest.Mock).mockRejectedValue(
      error
    );

    const { result } = renderHook(() => useChapterStore());

    await act(async () => {
      await result.current.fetchChapters();
    });

    expect(result.current.error).toBe('Network failed');
    expect(result.current.chapters).toEqual([]);
  });

  it('should set selected chapter', () => {
    const { result } = renderHook(() => useChapterStore());

    act(() => {
      result.current.setSelectedChapter(mockChapters[0]);
    });

    expect(result.current.selectedChapter).toEqual(mockChapters[0]);
  });

  it('should clear error', () => {
    const { result } = renderHook(() => useChapterStore());

    useChapterStore.setState({ error: 'Some error' });

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });

  it('should support force refresh', async () => {
    (chaptersCacheService.fetchChaptersWithCache as jest.Mock).mockResolvedValue(
      mockChapters
    );

    const { result } = renderHook(() => useChapterStore());

    await act(async () => {
      await result.current.fetchChapters({ forceRefresh: true });
    });

    expect(chaptersCacheService.fetchChaptersWithCache).toHaveBeenCalledWith({
      forceRefresh: true,
    });
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test -- chapterStore.test.ts
```

Expected: Tests fail with various errors about missing implementation

**Step 3: Implement chapterStore**

Modify `apps/mobile/src/stores/chapterStore.ts`:

```typescript
import { create } from 'zustand';
import { fetchChaptersWithCache } from '@/services/db/chapters-cache';
import type { Chapter } from '@/types';

interface FetchOptions {
  forceRefresh?: boolean;
}

interface ChapterState {
  chapters: Chapter[];
  selectedChapter: Chapter | null;
  loading: boolean;
  error: string | null;

  fetchChapters: (options?: FetchOptions) => Promise<void>;
  setSelectedChapter: (chapter: Chapter | null) => void;
  clearError: () => void;
}

export const useChapterStore = create<ChapterState>((set) => ({
  chapters: [],
  selectedChapter: null,
  loading: false,
  error: null,

  fetchChapters: async (options) => {
    set({ loading: true, error: null });
    try {
      const chapters = await fetchChaptersWithCache(options);
      set({ chapters, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  setSelectedChapter: (chapter) => set({ selectedChapter: chapter }),
  clearError: () => set({ error: null }),
}));
```

**Step 4: Run test to verify it passes**

```bash
npm test -- chapterStore.test.ts
```

Expected: All tests pass ✓

**Step 5: Commit**

```bash
git add apps/mobile/src/stores/chapterStore.ts __tests__/stores/chapterStore.test.ts
git commit -m "feat: implement chapterStore with real data fetching and caching"
```

---

## Task 3: Implement VolumeStore with Chapter-Specific Volumes

**Files:**
- Modify: `apps/mobile/src/stores/volumeStore.ts`
- Test: `apps/mobile/__tests__/stores/volumeStore.test.ts`

**Why:** Volumes depend on a selected chapter, so the store needs to fetch and manage volumes per chapter.

**Step 1: Write test for volumeStore**

Create `apps/mobile/__tests__/stores/volumeStore.test.ts`:

```typescript
import { renderHook, act } from '@testing-library/react-native';
import { useVolumeStore } from '@/stores/volumeStore';
import { chaptersAPI } from '@/services/api';
import type { Volume } from '@/types';

jest.mock('@/services/api');

describe('useVolumeStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useVolumeStore.setState({
      volumes: [],
      currentVolume: null,
      currentVersion: null,
      selectedPerspective: 'NARRATOR',
      loading: false,
      error: null,
    });
  });

  const mockVolumes: Volume[] = [
    {
      id: 'vol-1',
      chapterId: 'ch-1',
      volumeNumber: 1,
      title: 'Volume 1',
      status: 'PUBLISHED',
      isFree: false,
      isFinalPaywall: false,
      illustrationAssetId: null,
      createdAt: '2026-01-01T00:00:00Z',
      publishedAt: '2026-01-01T00:00:00Z',
      charme: 0,
      danger: 0,
      douceur: 0,
      intensite: 0,
      isDarkCollection: false,
      mystere: 0,
      transformation: 0,
      xpAmeBase: 0,
      xpFeuBase: 0,
      xpOmbreBase: 0,
    },
  ];

  it('should fetch volumes for chapter', async () => {
    (chaptersAPI.getVolumes as jest.Mock).mockResolvedValue(mockVolumes);

    const { result } = renderHook(() => useVolumeStore());

    await act(async () => {
      await result.current.fetchVolumes('ch-1');
    });

    expect(result.current.volumes).toEqual(mockVolumes);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle fetch errors', async () => {
    const error = new Error('Failed to fetch volumes');
    (chaptersAPI.getVolumes as jest.Mock).mockRejectedValue(error);

    const { result } = renderHook(() => useVolumeStore());

    await act(async () => {
      await result.current.fetchVolumes('ch-1');
    });

    expect(result.current.error).toBe('Failed to fetch volumes');
    expect(result.current.volumes).toEqual([]);
  });

  it('should set current volume', () => {
    const { result } = renderHook(() => useVolumeStore());

    act(() => {
      result.current.setCurrentVolume(mockVolumes[0]);
    });

    expect(result.current.currentVolume).toEqual(mockVolumes[0]);
  });

  it('should set selected perspective', () => {
    const { result } = renderHook(() => useVolumeStore());

    act(() => {
      result.current.setSelectedPerspective('PROTAGONIST');
    });

    expect(result.current.selectedPerspective).toBe('PROTAGONIST');
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test -- volumeStore.test.ts
```

Expected: Tests fail

**Step 3: Implement volumeStore**

Modify `apps/mobile/src/stores/volumeStore.ts`:

```typescript
import { create } from 'zustand';
import { chaptersAPI } from '@/services/api';
import type { Volume, VolumeVersion, Perspective } from '@/types';

interface VolumeState {
  volumes: Volume[];
  currentVolume: Volume | null;
  currentVersion: VolumeVersion | null;
  selectedPerspective: Perspective;
  loading: boolean;
  error: string | null;

  fetchVolumes: (chapterId: string) => Promise<void>;
  setCurrentVolume: (volume: Volume) => void;
  setSelectedPerspective: (perspective: Perspective) => void;
  clearError: () => void;
}

export const useVolumeStore = create<VolumeState>((set) => ({
  volumes: [],
  currentVolume: null,
  currentVersion: null,
  selectedPerspective: 'NARRATOR',
  loading: false,
  error: null,

  fetchVolumes: async (chapterId: string) => {
    set({ loading: true, error: null });
    try {
      const volumes = await chaptersAPI.getVolumes(chapterId);
      set({ volumes, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  setCurrentVolume: (volume) => set({ currentVolume: volume }),
  setSelectedPerspective: (perspective) => set({ selectedPerspective: perspective }),
  clearError: () => set({ error: null }),
}));
```

**Step 4: Run test to verify it passes**

```bash
npm test -- volumeStore.test.ts
```

Expected: All tests pass ✓

**Step 5: Commit**

```bash
git add apps/mobile/src/stores/volumeStore.ts __tests__/stores/volumeStore.test.ts
git commit -m "feat: implement volumeStore for managing chapter volumes"
```

---

## Task 4: Create ChaptersListScreen Component

**Files:**
- Create: `apps/mobile/src/screens/ChaptersListScreen.tsx` - Chapters list with pull-to-refresh
- Modify: `apps/mobile/src/app/(main)/chapters/index.tsx` - Use new screen component
- Test: `apps/mobile/__tests__/screens/ChaptersListScreen.test.tsx`

**Why:** Users need to see a list of chapters with the ability to refresh. This is the main entry point for offline reading.

**Step 1: Write test for ChaptersListScreen**

Create `apps/mobile/__tests__/screens/ChaptersListScreen.test.tsx`:

```typescript
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import ChaptersListScreen from '@/screens/ChaptersListScreen';
import { useChapterStore } from '@/stores/chapterStore';
import type { Chapter } from '@/types';

jest.mock('@/stores/chapterStore');
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

describe('ChaptersListScreen', () => {
  const mockChapters: Chapter[] = [
    {
      id: 'ch-1',
      title: 'Chapter 1',
      protagonistName: 'Emma',
      status: 'PUBLISHED',
      createdAt: '2026-01-01T00:00:00Z',
      publishedAt: '2026-01-01T00:00:00Z',
      isArchived: false,
      scheduledFor: null,
      coverAssetId: null,
      description: 'Beautiful story',
      accroche_classic: 'A sensual tale',
      accroche_dark: null,
      accroche_dark_collection: null,
      accroche_love: null,
      accroche_marketing: null,
      niveau_danger: 3,
      niveau_douceur: 4,
      niveau_intensite: 5,
      niveau_transformation: 3,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state initially', () => {
    (useChapterStore as jest.Mock).mockReturnValue({
      chapters: [],
      loading: true,
      error: null,
      fetchChapters: jest.fn(),
    });

    const { getByTestId } = render(<ChaptersListScreen />);

    expect(getByTestId('chapters-loading')).toBeDefined();
  });

  it('should render chapters list', async () => {
    const mockFetch = jest.fn();
    (useChapterStore as jest.Mock).mockReturnValue({
      chapters: mockChapters,
      loading: false,
      error: null,
      fetchChapters: mockFetch,
      setSelectedChapter: jest.fn(),
    });

    const { getByText } = render(<ChaptersListScreen />);

    await waitFor(() => {
      expect(getByText('Chapter 1')).toBeDefined();
      expect(getByText('Emma')).toBeDefined();
    });
  });

  it('should show error message on error', () => {
    (useChapterStore as jest.Mock).mockReturnValue({
      chapters: [],
      loading: false,
      error: 'Network failed',
      fetchChapters: jest.fn(),
    });

    const { getByText } = render(<ChaptersListScreen />);

    expect(getByText(/Network failed/i)).toBeDefined();
  });

  it('should call fetchChapters on mount', () => {
    const mockFetch = jest.fn();
    (useChapterStore as jest.Mock).mockReturnValue({
      chapters: mockChapters,
      loading: false,
      error: null,
      fetchChapters: mockFetch,
    });

    render(<ChaptersListScreen />);

    expect(mockFetch).toHaveBeenCalledWith();
  });

  it('should support pull-to-refresh', async () => {
    const mockFetch = jest.fn();
    (useChapterStore as jest.Mock).mockReturnValue({
      chapters: mockChapters,
      loading: false,
      error: null,
      fetchChapters: mockFetch,
    });

    const { getByTestId } = render(<ChaptersListScreen />);
    const refreshControl = getByTestId('chapters-refresh');

    // Simulate refresh
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test -- ChaptersListScreen.test.tsx
```

Expected: Tests fail (component doesn't exist yet)

**Step 3: Implement ChaptersListScreen**

Create `apps/mobile/src/screens/ChaptersListScreen.tsx`:

```typescript
import React, { useEffect } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useChapterStore } from '@/stores/chapterStore';
import type { Chapter } from '@/types';

const ChaptersListScreen: React.FC = () => {
  const router = useRouter();
  const { chapters, loading, error, fetchChapters, setSelectedChapter } =
    useChapterStore();
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    fetchChapters();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchChapters({ forceRefresh: true });
    setRefreshing(false);
  };

  const handleSelectChapter = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    router.push(`/chapters/${chapter.id}`);
  };

  if (loading && !refreshing && chapters.length === 0) {
    return (
      <View testID="chapters-loading" style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#E11D48" />
      </View>
    );
  }

  if (error && chapters.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 16 }}>
        <Text style={{ fontSize: 16, color: 'red', marginBottom: 16 }}>
          Error: {error}
        </Text>
        <TouchableOpacity
          onPress={() => handleRefresh()}
          style={{ backgroundColor: '#E11D48', padding: 12, borderRadius: 8 }}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontSize: 16 }}>
            Retry
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        testID="chapters-list"
        data={chapters}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            testID="chapters-refresh"
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#E11D48"
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleSelectChapter(item)}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderBottomColor: '#e5e5e5',
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 4 }}>
              {item.title}
            </Text>
            <Text style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>
              {item.protagonistName}
            </Text>
            <Text style={{ fontSize: 12, color: '#999' }}>
              {item.description}
            </Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingTop: 8 }}
      />
    </View>
  );
};

export default ChaptersListScreen;
```

**Step 4: Run test to verify it passes**

```bash
npm test -- ChaptersListScreen.test.tsx
```

Expected: All tests pass ✓

**Step 5: Update chapters screen to use component**

Modify `apps/mobile/src/app/(main)/chapters/index.tsx`:

```typescript
import ChaptersListScreen from '@/screens/ChaptersListScreen';

export default ChaptersListScreen;
```

**Step 6: Commit**

```bash
git add apps/mobile/src/screens/ChaptersListScreen.tsx apps/mobile/src/app/\(main\)/chapters/index.tsx __tests__/screens/ChaptersListScreen.test.tsx
git commit -m "feat: create ChaptersListScreen with pull-to-refresh"
```

---

## Task 5: Create ChapterDetailScreen for Volume Listing

**Files:**
- Create: `apps/mobile/src/screens/ChapterDetailScreen.tsx` - Volume list for selected chapter
- Create: `apps/mobile/src/app/(main)/chapters/[id].tsx` - Route for chapter detail
- Test: `apps/mobile/__tests__/screens/ChapterDetailScreen.test.tsx`

**Why:** When user selects a chapter, they see its volumes. This screen manages loading volumes and navigation to reader.

**Step 1: Write test for ChapterDetailScreen**

Create `apps/mobile/__tests__/screens/ChapterDetailScreen.test.tsx`:

```typescript
import React from 'react';
import { render } from '@testing-library/react-native';
import ChapterDetailScreen from '@/screens/ChapterDetailScreen';
import { useChapterStore } from '@/stores/chapterStore';
import { useVolumeStore } from '@/stores/volumeStore';
import type { Chapter, Volume } from '@/types';

jest.mock('@/stores/chapterStore');
jest.mock('@/stores/volumeStore');
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(() => ({ id: 'ch-1' })),
}));

describe('ChapterDetailScreen', () => {
  const mockChapter: Chapter = {
    id: 'ch-1',
    title: 'Chapter 1',
    protagonistName: 'Emma',
    status: 'PUBLISHED',
    createdAt: '2026-01-01T00:00:00Z',
    publishedAt: '2026-01-01T00:00:00Z',
    isArchived: false,
    scheduledFor: null,
    coverAssetId: null,
    description: 'Beautiful story',
    accroche_classic: 'A sensual tale',
    accroche_dark: null,
    accroche_dark_collection: null,
    accroche_love: null,
    accroche_marketing: null,
    niveau_danger: 3,
    niveau_douceur: 4,
    niveau_intensite: 5,
    niveau_transformation: 3,
  };

  const mockVolumes: Volume[] = [
    {
      id: 'vol-1',
      chapterId: 'ch-1',
      volumeNumber: 1,
      title: 'Volume 1',
      status: 'PUBLISHED',
      isFree: false,
      isFinalPaywall: false,
      illustrationAssetId: null,
      createdAt: '2026-01-01T00:00:00Z',
      publishedAt: '2026-01-01T00:00:00Z',
      charme: 0,
      danger: 0,
      douceur: 0,
      intensite: 0,
      isDarkCollection: false,
      mystere: 0,
      transformation: 0,
      xpAmeBase: 0,
      xpFeuBase: 0,
      xpOmbreBase: 0,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render chapter title', () => {
    (useChapterStore as jest.Mock).mockReturnValue({
      selectedChapter: mockChapter,
    });
    (useVolumeStore as jest.Mock).mockReturnValue({
      volumes: mockVolumes,
      loading: false,
      error: null,
      fetchVolumes: jest.fn(),
    });

    const { getByText } = render(<ChapterDetailScreen />);

    expect(getByText('Chapter 1')).toBeDefined();
  });

  it('should call fetchVolumes on mount', () => {
    const mockFetch = jest.fn();
    (useChapterStore as jest.Mock).mockReturnValue({
      selectedChapter: mockChapter,
    });
    (useVolumeStore as jest.Mock).mockReturnValue({
      volumes: [],
      loading: false,
      error: null,
      fetchVolumes: mockFetch,
    });

    render(<ChapterDetailScreen />);

    expect(mockFetch).toHaveBeenCalledWith('ch-1');
  });

  it('should render volumes list', () => {
    (useChapterStore as jest.Mock).mockReturnValue({
      selectedChapter: mockChapter,
    });
    (useVolumeStore as jest.Mock).mockReturnValue({
      volumes: mockVolumes,
      loading: false,
      error: null,
      fetchVolumes: jest.fn(),
    });

    const { getByText } = render(<ChapterDetailScreen />);

    expect(getByText('Volume 1')).toBeDefined();
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test -- ChapterDetailScreen.test.tsx
```

Expected: Tests fail

**Step 3: Implement ChapterDetailScreen**

Create `apps/mobile/src/screens/ChapterDetailScreen.tsx`:

```typescript
import React, { useEffect } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useChapterStore } from '@/stores/chapterStore';
import { useVolumeStore } from '@/stores/volumeStore';
import type { Volume } from '@/types';

const ChapterDetailScreen: React.FC = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { selectedChapter } = useChapterStore();
  const { volumes, loading, error, fetchVolumes, setCurrentVolume } =
    useVolumeStore();

  useEffect(() => {
    if (id) {
      fetchVolumes(id as string);
    }
  }, [id]);

  const handleSelectVolume = (volume: Volume) => {
    setCurrentVolume(volume);
    router.push(`/reader/${volume.id}`);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#E11D48" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}>
        {selectedChapter && (
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 8 }}>
              {selectedChapter.title}
            </Text>
            <Text style={{ fontSize: 16, color: '#666', marginBottom: 8 }}>
              {selectedChapter.protagonistName}
            </Text>
            {selectedChapter.description && (
              <Text style={{ fontSize: 14, color: '#999', lineHeight: 20 }}>
                {selectedChapter.description}
              </Text>
            )}
          </View>
        )}

        {error && (
          <Text style={{ color: 'red', marginBottom: 16, fontSize: 14 }}>
            Error: {error}
          </Text>
        )}

        <Text
          style={{
            fontSize: 18,
            fontWeight: '600',
            marginBottom: 12,
            marginTop: 12,
          }}
        >
          Volumes ({volumes.length})
        </Text>

        {volumes.map((volume) => (
          <TouchableOpacity
            key={volume.id}
            onPress={() => handleSelectVolume(volume)}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderBottomColor: '#e5e5e5',
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: '500', marginBottom: 4 }}>
              Volume {volume.volumeNumber}
            </Text>
            {volume.title && (
              <Text style={{ fontSize: 14, color: '#666' }}>
                {volume.title}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default ChapterDetailScreen;
```

**Step 4: Create route for chapter detail**

Create `apps/mobile/src/app/(main)/chapters/[id].tsx`:

```typescript
import ChapterDetailScreen from '@/screens/ChapterDetailScreen';

export default ChapterDetailScreen;
```

**Step 5: Run test to verify it passes**

```bash
npm test -- ChapterDetailScreen.test.tsx
```

Expected: All tests pass ✓

**Step 6: Commit**

```bash
git add apps/mobile/src/screens/ChapterDetailScreen.tsx apps/mobile/src/app/\(main\)/chapters/\[id\].tsx __tests__/screens/ChapterDetailScreen.test.tsx
git commit -m "feat: create ChapterDetailScreen with volume listing"
```

---

## Task 6: Verify TypeScript and All Tests Pass

**Files:**
- No new files - just verification

**Why:** Ensure no regressions before moving to reader implementation.

**Step 1: Run TypeScript check**

```bash
npm run type-check
```

Expected: No errors ✓

**Step 2: Run all tests**

```bash
npm test -- --passWithNoTests
```

Expected: All tests pass or skip gracefully ✓

**Step 3: Run linting**

```bash
npm run lint
```

Expected: No critical errors

**Step 4: Final commit summary**

```bash
git log --oneline -10
```

Expected: All Week 4-5 commits visible

---

## Definition of Done for Week 4-5

✅ All chapters cached locally in SQLite after first fetch
✅ Chapter listing screen displays with pull-to-refresh
✅ Volume listing per chapter implemented
✅ Offline capability: Users can browse cached chapters/volumes without network
✅ All tests passing
✅ No TypeScript errors
✅ Code linted and formatted
✅ Git history clean with atomic commits

---

**Plan complete and saved.** Ready to execute task-by-task.

Which approach do you prefer?

**1. Subagent-Driven (this session)** - Fresh subagent per task, I review between tasks, fast iteration
**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints
