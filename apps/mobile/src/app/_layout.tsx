import { Stack } from 'expo-router';
import { useAuthStore } from '@stores/authStore';
import { useEffect } from 'react';
import { initDatabase } from '@/db';
import { initImageCache } from '@/services/cache';

export default function RootLayout() {
  const { isAuthenticated, loading, restoreToken } = useAuthStore();

  // Initialize database, cache, and restore token on app start
  useEffect(() => {
    try {
      initDatabase();
      initImageCache();
    } catch (error) {
      console.error('Failed to initialize app:', error);
    }
    restoreToken();
  }, []);

  if (loading) {
    // TODO: Create SplashScreen component
    return null;
  }

  return (
    <Stack>
      {!isAuthenticated ? (
        <Stack.Screen
          name="(auth)"
          options={{ headerShown: false }}
        />
      ) : (
        <Stack.Screen
          name="(main)"
          options={{ headerShown: false }}
        />
      )}
    </Stack>
  );
}
