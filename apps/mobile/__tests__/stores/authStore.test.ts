import { useAuthStore } from '@/stores/authStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage');

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: true,
      error: null,
    });
    jest.clearAllMocks();
  });

  describe('restoreToken', () => {
    it('should restore token from storage and set authenticated', async () => {
      const mockToken = 'test-token-123';
      const mockUser = {
        id: '1',
        publicId: 'pub-1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        status: 'ACTIVE',
        role: 'USER',
        createdAt: '2026-01-01T00:00:00Z',
      };

      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce(mockToken) // First call: authToken
        .mockResolvedValueOnce(JSON.stringify(mockUser)); // Second call: authUser

      await useAuthStore.getState().restoreToken();

      const { token, isAuthenticated, loading } = useAuthStore.getState();
      expect(token).toBe(mockToken);
      expect(isAuthenticated).toBe(true);
      expect(loading).toBe(false);
    });

    it('should handle missing token gracefully', async () => {
      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce(null) // authToken
        .mockResolvedValueOnce(null); // authUser

      await useAuthStore.getState().restoreToken();

      const { token, isAuthenticated } = useAuthStore.getState();
      expect(token).toBeNull();
      expect(isAuthenticated).toBe(false);
    });
  });

  describe('logout', () => {
    it('should clear user, token, and auth state', async () => {
      useAuthStore.setState({
        user: {
          id: '1',
          publicId: 'pub-1',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          status: 'ACTIVE',
          role: 'USER',
          createdAt: '2026-01-01T00:00:00Z',
        },
        token: 'test-token',
        isAuthenticated: true,
      });

      await useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('authToken');
    });
  });

  describe('clearError', () => {
    it('should clear error message', () => {
      useAuthStore.setState({ error: 'Test error' });
      useAuthStore.getState().clearError();
      expect(useAuthStore.getState().error).toBeNull();
    });
  });
});
