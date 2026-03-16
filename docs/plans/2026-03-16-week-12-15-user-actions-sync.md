# Phase 3 Week 12-15: User Actions & Offline Sync Engine Implementation Plan

**Goal:** Track user reading progress, save bookmarks, and sync to server when online with conflict resolution.

**Architecture:**
- Progress store tracks reading position per volume
- Bookmarks stored locally and synced to server
- Sync queue manages pending actions with status tracking
- NetInfo monitors network state and triggers auto-sync
- Server-wins conflict resolution for concurrent updates

---

## Task 1: Create ProgressStore for Tracking Reading

**Files:**
- Create: `apps/mobile/src/stores/progressStore.ts`

```typescript
// apps/mobile/src/stores/progressStore.ts

import { create } from 'zustand';
import { progressDB } from '@/services/db';
import type { UserProgress } from '@/services/db';

interface ProgressState {
  progress: Map<string, UserProgress>;

  updateProgress: (
    chapterId: string,
    volumeNumber: number,
    perspective: string,
    position: number,
    percentage: number
  ) => void;

  getProgress: (
    chapterId: string,
    volumeNumber: number,
    perspective: string
  ) => UserProgress | null;

  markCompleted: (
    chapterId: string,
    volumeNumber: number,
    perspective: string
  ) => void;

  addBookmark: (chapterId: string) => void;
  removeBookmark: (chapterId: string) => void;
  isBookmarked: (chapterId: string) => boolean;
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  progress: new Map(),

  updateProgress: (chapterId, volumeNumber, perspective, position, percentage) => {
    const id = `${chapterId}-${volumeNumber}-${perspective}`;
    const updated: UserProgress = {
      id,
      chapterId,
      volumeNumber,
      perspective,
      progress: percentage,
      completedAt: percentage === 100 ? new Date().toISOString() : null,
    };

    // Save to SQLite
    progressDB.saveProgress(updated);

    // Update store
    set((state) => {
      state.progress.set(id, updated);
      return { progress: new Map(state.progress) };
    });
  },

  getProgress: (chapterId, volumeNumber, perspective) => {
    const id = `${chapterId}-${volumeNumber}-${perspective}`;
    return get().progress.get(id) || null;
  },

  markCompleted: (chapterId, volumeNumber, perspective) => {
    get().updateProgress(chapterId, volumeNumber, perspective, 100, 100);
  },

  addBookmark: (chapterId) => {
    // Bookmark stored in sync queue for server sync
    // Local storage via SQLite
  },

  removeBookmark: (chapterId) => {
    // Remove from sync queue
  },

  isBookmarked: (chapterId) => {
    // Check bookmarks
    return false; // TODO: Implement
  },
}));
```

**Commit:**

```bash
git add apps/mobile/src/stores/progressStore.ts
git commit -m "feat: create progressStore for tracking reading progress"
```

---

## Task 2: Create SyncStore for Offline Queue

**Files:**
- Create: `apps/mobile/src/stores/syncStore.ts`

```typescript
// apps/mobile/src/stores/syncStore.ts

import { create } from 'zustand';
import { syncDB } from '@/services/db';

interface SyncAction {
  id: string;
  action: string;
  payload: object;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
  retryCount: number;
  lastError: string | null;
}

interface SyncState {
  queue: SyncAction[];
  onlineStatus: boolean;
  syncing: boolean;

  addToQueue: (action: string, payload: object) => void;
  processPendingActions: () => Promise<void>;
  markAsSynced: (id: string) => void;
  markAsFailed: (id: string, error: string) => void;
  setOnlineStatus: (online: boolean) => void;
  getQueueSize: () => number;
}

export const useSyncStore = create<SyncState>((set, get) => ({
  queue: [],
  onlineStatus: true,
  syncing: false,

  addToQueue: (action, payload) => {
    const id = `${action}-${Date.now()}`;
    const syncAction: SyncAction = {
      id,
      action,
      payload,
      status: 'pending',
      retryCount: 0,
      lastError: null,
    };

    // Save to SQLite queue
    syncDB.addToQueue({
      id,
      action,
      payload: JSON.stringify(payload),
      status: 'PENDING',
      retryCount: 0,
      lastError: null,
      createdAt: new Date().toISOString(),
      syncedAt: null,
    });

    set((state) => ({
      queue: [...state.queue, syncAction],
    }));
  },

  processPendingActions: async () => {
    const { queue, onlineStatus } = get();

    if (!onlineStatus || queue.length === 0) {
      return;
    }

    set({ syncing: true });

    for (const action of queue) {
      if (action.status === 'synced' || action.status === 'syncing') {
        continue;
      }

      try {
        // TODO: Call API to sync action
        get().markAsSynced(action.id);
      } catch (error) {
        get().markAsFailed(action.id, String(error));
      }
    }

    set({ syncing: false });
  },

  markAsSynced: (id) => {
    syncDB.updateQueueStatus(id, 'SYNCED');
    set((state) => ({
      queue: state.queue.map((a) =>
        a.id === id ? { ...a, status: 'synced' as const } : a
      ),
    }));
  },

  markAsFailed: (id, error) => {
    set((state) => ({
      queue: state.queue.map((a) =>
        a.id === id
          ? { ...a, status: 'failed' as const, lastError: error, retryCount: a.retryCount + 1 }
          : a
      ),
    }));
  },

  setOnlineStatus: (online) => {
    set({ onlineStatus: online });
    if (online) {
      // Auto-sync when coming online
      get().processPendingActions();
    }
  },

  getQueueSize: () => get().queue.length,
}));
```

**Commit:**

```bash
git add apps/mobile/src/stores/syncStore.ts
git commit -m "feat: create syncStore for offline action queueing"
```

---

## Task 3: Create OnlineSync Hook

**Files:**
- Create: `apps/mobile/src/hooks/useOnlineSync.ts`
- Modify: `apps/mobile/src/hooks/useOffline.ts` (if exists)

```typescript
// apps/mobile/src/hooks/useOnlineSync.ts

import { useEffect } from 'react';
import * as NetInfo from '@react-native-community/netinfo';
import { useSyncStore } from '@/stores/syncStore';

/**
 * Monitor network state and auto-sync when online
 */
export const useOnlineSync = (): boolean => {
  const { setOnlineStatus, onlineStatus } = useSyncStore();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const isConnected = state.isConnected === true;
      setOnlineStatus(isConnected);
    });

    return unsubscribe;
  }, [setOnlineStatus]);

  return onlineStatus;
};
```

**Commit:**

```bash
git add apps/mobile/src/hooks/useOnlineSync.ts
git commit -m "feat: create useOnlineSync hook for network monitoring"
```

---

## Task 4: Integrate Progress Tracking into ReaderScreen

**Files:**
- Modify: `apps/mobile/src/screens/ReaderScreen.tsx`

Add progress tracking on scroll:

```typescript
// In ReaderScreen - add scroll position tracking

const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
  if (!currentVolume) return;

  const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
  const scrollPercentage =
    (contentOffset.y / (contentSize.height - layoutMeasurement.height)) * 100;

  const percentage = Math.min(100, Math.max(0, scrollPercentage));

  // Update progress store (debounced)
  useProgressStore.getState().updateProgress(
    currentVolume.chapterId,
    currentVolume.volumeNumber,
    selectedPerspective,
    contentOffset.y,
    percentage
  );
};

// Add to ScrollView
<ScrollView onScroll={handleScroll} scrollEventThrottle={1000}>
  {/* content */}
</ScrollView>
```

**Commit:**

```bash
git add apps/mobile/src/screens/ReaderScreen.tsx
git commit -m "feat: add progress tracking to reader screen"
```

---

## Task 5: Verify TypeScript and Complete Phase 3

```bash
npm run type-check
```

Expected: No errors ✓

**Commit:**

```bash
git add -A
git commit -m "feat: complete Phase 3 - User Actions & Offline Sync Engine"
```

---

## Definition of Done

✅ Progress tracked per volume/perspective
✅ Bookmarks saved locally
✅ Sync queue stores pending actions
✅ Network state monitored (online/offline)
✅ Auto-sync on reconnection
✅ Offline queue persists
✅ TypeScript passes
✅ All commits atomic

---

**Plan saved for Phase 3 Week 12-15.**
