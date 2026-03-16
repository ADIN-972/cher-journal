import { Stack } from 'expo-router';
import { useAuthStore } from '@stores/authStore';
import { useEffect } from 'react';
import { initDatabase } from '@/db';
import { initImageCache } from '@/services/cache';

export default function RootLayout() {
  const { isAuthenticated, loading, restoreToken } = useAuthStore();

  // Initialize database, cache, and restore token on app start
  useEffect(() => {
    const initApp = async () => {
      try {
        await initDatabase();
        await initImageCache();
        await restoreToken();
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };
    initApp();
  }, [restoreToken]);

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
