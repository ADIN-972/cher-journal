import { Stack, Redirect } from 'expo-router';
import { Platform } from 'react-native';
import { useAuthStore } from '@stores/authStore';
import { ThemeProvider } from '@/theme/ThemeContext';
import { useEffect } from 'react';
import { registerForPushNotifications } from '@/services/pushNotifications';
import { useFonts, Cinzel_400Regular, Cinzel_700Bold } from '@expo-google-fonts/cinzel';
import { useFonts as useGreatVibes, GreatVibes_400Regular } from '@expo-google-fonts/great-vibes';
import {
  useFonts as useJosefinSans,
  JosefinSans_300Light,
  JosefinSans_400Regular,
  JosefinSans_700Bold,
} from '@expo-google-fonts/josefin-sans';
import {
  useFonts as useNewsreader,
  Newsreader_400Regular,
  Newsreader_400Regular_Italic,
  Newsreader_700Bold,
} from '@expo-google-fonts/newsreader';
import {
  useFonts as usePlayfair,
  PlayfairDisplay_400Regular,
  PlayfairDisplay_700Bold,
  PlayfairDisplay_400Regular_Italic,
} from '@expo-google-fonts/playfair-display';
import { MaterialSymbols_400Regular } from '@expo-google-fonts/material-symbols/400Regular';

export default function RootLayout() {
  const { isAuthenticated, emailVerified, loading, restoreToken } = useAuthStore();

  const [cinzelLoaded] = useFonts({ Cinzel_400Regular, Cinzel_700Bold });
  const [greatVibesLoaded] = useGreatVibes({ GreatVibes_400Regular });
  const [josefinLoaded] = useJosefinSans({
    JosefinSans_300Light,
    JosefinSans_400Regular,
    JosefinSans_700Bold,
  });
  const [newsreaderLoaded] = useNewsreader({
    Newsreader_400Regular,
    Newsreader_400Regular_Italic,
    Newsreader_700Bold,
  });
  const [playfairLoaded] = usePlayfair({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_700Bold,
    PlayfairDisplay_400Regular_Italic,
  });
  const [materialSymbolsLoaded] = useFonts({ MaterialSymbols_400Regular });

  const fontsLoaded =
    cinzelLoaded &&
    greatVibesLoaded &&
    josefinLoaded &&
    newsreaderLoaded &&
    playfairLoaded &&
    materialSymbolsLoaded;

  // Inject web fonts and global styles on web platform
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    // Load Google Fonts via stylesheet
    const fontsLink = document.createElement('link');
    fontsLink.href =
      'https://fonts.googleapis.com/css2?family=Cinzel:wght@400..900&family=Great+Vibes&family=Josefin+Sans:ital,wght@0,100..700;1,100..700&family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap';
    fontsLink.rel = 'stylesheet';
    document.head.appendChild(fontsLink);

    // Load Material Symbols Outlined
    const iconsLink = document.createElement('link');
    iconsLink.href =
      'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200';
    iconsLink.rel = 'stylesheet';
    document.head.appendChild(iconsLink);

    // Load all
    const allLinks = document.createElement('link');
    allLinks.href =
      '"https://fonts.googleapis.com/css2?family=Cinzel:wght@400..900&family=Great+Vibes&family=Josefin+Sans:ital,wght@0,100..700;1,100..700&family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap';
    allLinks.rel = 'stylesheet';
    document.head.appendChild(allLinks);

    // Inject global CSS for Material Symbols and body
    const style = document.createElement('style');
    style.textContent = `
      .material-symbols-outlined {
        font-family: 'Material Symbols Outlined';
        font-weight: normal;
        font-style: normal;
        font-size: 24px;
        line-height: 1;
        letter-spacing: normal;
        text-transform: none;
        display: inline-block;
        white-space: nowrap;
        direction: ltr;
        -webkit-font-smoothing: antialiased;
        font-feature-settings: 'liga';
      }
      body {
        margin: 0;
        padding: 0;
        background-color: #fff8f0;
        font-family:
          -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu",
          "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
      }
      * { scrollbar-width: none; -ms-overflow-style: none; }
      *::-webkit-scrollbar { display: none; }
    `;
    document.head.appendChild(style);
  }, []);

  // Initialize database, cache, and restore token on app start
  useEffect(() => {
    const initApp = async () => {
      try {
        // SQLite and file system cache are only available on native
        if (Platform.OS !== 'web') {
          const { initDatabase } = await import('@/db');
          const { initImageCache } = await import('@/services/cache');
          await initDatabase();
          await initImageCache();
        }
        await restoreToken();
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };
    initApp();
  }, [restoreToken]);

  // Register push notifications when authenticated
  useEffect(() => {
    if (isAuthenticated && Platform.OS !== 'web') {
      registerForPushNotifications().catch(() => {});
    }
  }, [isAuthenticated]);

  if (loading || !fontsLoaded) {
    return null;
  }

  // Three states:
  // 1. Not authenticated -> show auth screens (login/signup)
  // 2. Authenticated but email not verified -> redirect to verify-email
  // 3. Authenticated and verified -> show main app
  const needsVerification = isAuthenticated && !emailVerified;

  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {!isAuthenticated || needsVerification ? (
          <>
            <Stack.Screen name="(auth)" />
            {needsVerification && <Redirect href="/(auth)/verify-email" />}
          </>
        ) : (
          <>
            <Stack.Screen name="(main)" />
            <Stack.Screen
              name="reader/[id]"
              options={{
                animation: 'slide_from_right',
                gestureEnabled: true,
              }}
            />
          </>
        )}
      </Stack>
    </ThemeProvider>
  );
}
