import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDark: true, // Default to dark mode

      toggleTheme: () => {
        set((state) => {
          const newIsDark = !state.isDark;
          applyTheme(newIsDark);
          return { isDark: newIsDark };
        });
      },

      setTheme: (isDark: boolean) => {
        applyTheme(isDark);
        set({ isDark });
      },
    }),
    {
      name: 'theme-storage',
      partialize: (state) => ({
        isDark: state.isDark,
      }),
    }
  )
);

// Helper function to apply theme to DOM
const applyTheme = (isDark: boolean) => {
  const html = document.documentElement;
  if (isDark) {
    html.classList.add('dark');
  } else {
    html.classList.remove('dark');
  }
};

// Initialize theme on app startup
export const initializeTheme = () => {
  const { isDark } = useThemeStore.getState();
  applyTheme(isDark);
};
