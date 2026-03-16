import { create } from 'zustand';


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
        get().markAsSynced(action.id);
      } catch (error: any) {
        get().markAsFailed(action.id, error.message);
      }
    }

    set({ syncing: false });
  },

  markAsSynced: (id) => {
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
          ? {
              ...a,
              status: 'failed' as const,
              lastError: error,
              retryCount: a.retryCount + 1,
            }
          : a
      ),
    }));
  },

  setOnlineStatus: (online) => {
    set({ onlineStatus: online });
    if (online) {
      get().processPendingActions();
    }
  },

  getQueueSize: () => get().queue.length,
}));
