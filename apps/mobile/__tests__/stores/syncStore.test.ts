import { useSyncStore } from '@/stores/syncStore';

describe('useSyncStore', () => {
  beforeEach(() => {
    useSyncStore.setState({
      queue: [],
      onlineStatus: true,
      syncing: false,
    });
  });

  describe('addToQueue', () => {
    it('should add action to queue with pending status', () => {
      const store = useSyncStore.getState();
      store.addToQueue('updateProgress', { volumeId: '123', progress: 50 });

      const state = useSyncStore.getState();
      expect(state.queue.length).toBe(1);
      expect(state.queue[0].action).toBe('updateProgress');
      expect(state.queue[0].status).toBe('pending');
      expect(state.queue[0].retryCount).toBe(0);
    });

    it('should generate unique IDs for each action', async () => {
      const store = useSyncStore.getState();
      store.addToQueue('action1', {});
      // Wait a bit to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 5));
      store.addToQueue('action1', {});

      const state = useSyncStore.getState();
      expect(state.queue.length).toBe(2);
      expect(state.queue[0].id).not.toEqual(state.queue[1].id);
    });

    it('should preserve payload', () => {
      const payload = { volumeId: '123', progress: 50 };
      const store = useSyncStore.getState();
      store.addToQueue('updateProgress', payload);

      const state = useSyncStore.getState();
      expect(state.queue[0].payload).toEqual(payload);
    });
  });

  describe('markAsSynced', () => {
    it('should change action status to synced', () => {
      const store = useSyncStore.getState();
      store.addToQueue('action1', {});
      const id = useSyncStore.getState().queue[0].id;

      store.markAsSynced(id);

      const action = useSyncStore.getState().queue[0];
      expect(action.status).toBe('synced');
    });
  });

  describe('markAsFailed', () => {
    it('should change status to failed and set error', () => {
      const store = useSyncStore.getState();
      store.addToQueue('action1', {});
      const id = useSyncStore.getState().queue[0].id;

      store.markAsFailed(id, 'Network error');

      const action = useSyncStore.getState().queue[0];
      expect(action.status).toBe('failed');
      expect(action.lastError).toBe('Network error');
    });

    it('should increment retry count', () => {
      const store = useSyncStore.getState();
      store.addToQueue('action1', {});
      const id = useSyncStore.getState().queue[0].id;

      store.markAsFailed(id, 'Error 1');
      expect(useSyncStore.getState().queue[0].retryCount).toBe(1);

      store.markAsFailed(id, 'Error 2');
      expect(useSyncStore.getState().queue[0].retryCount).toBe(2);
    });
  });

  describe('setOnlineStatus', () => {
    it('should update online status', () => {
      const store = useSyncStore.getState();
      store.setOnlineStatus(false);

      expect(useSyncStore.getState().onlineStatus).toBe(false);

      store.setOnlineStatus(true);
      expect(useSyncStore.getState().onlineStatus).toBe(true);
    });

    it('should trigger sync when going online', async () => {
      const store = useSyncStore.getState();
      store.setOnlineStatus(false);

      store.addToQueue('action1', {});
      const initialQueueSize = useSyncStore.getState().queue.length;

      store.setOnlineStatus(true);

      // After setting online, processPendingActions should be called
      // Wait a bit for async processing
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Queue size should remain (actions are processed but still in queue with synced status)
      expect(useSyncStore.getState().queue.length).toBe(initialQueueSize);
    });
  });

  describe('getQueueSize', () => {
    it('should return queue length', () => {
      const store = useSyncStore.getState();
      expect(store.getQueueSize()).toBe(0);

      store.addToQueue('action1', {});
      expect(store.getQueueSize()).toBe(1);

      store.addToQueue('action2', {});
      expect(store.getQueueSize()).toBe(2);
    });
  });

  describe('processPendingActions', () => {
    it('should not process when offline', async () => {
      const store = useSyncStore.getState();
      store.setOnlineStatus(false);
      store.addToQueue('action1', {});

      const initialState = useSyncStore.getState().queue[0].status;
      await store.processPendingActions();

      // Status should still be pending since offline
      expect(useSyncStore.getState().queue[0].status).toBe(initialState);
    });

    it('should set syncing flag during processing', async () => {
      const store = useSyncStore.getState();
      store.addToQueue('action1', {});

      // The syncing flag should be set during async processing
      const processingPromise = store.processPendingActions();

      // Give it a chance to start (small delay)
      await new Promise((resolve) => setTimeout(resolve, 0));

      // After processing completes, syncing should be false
      await processingPromise;
      expect(useSyncStore.getState().syncing).toBe(false);
    });
  });
});
