import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors as staticColors } from '@/utils/theme';

const THEME_KEY = 'app_theme';

// ─── Color maps ────────────────────────────────────────────────────────────────
// Keys match the existing `colors` object so migration is gradual:
// components can use `themeColors.background` instead of `colors.background`

export interface ThemeColors {
  background: string;
  linearBackground: string;
  surface: string;
  surfaceSecondary: string;
  card: string;
  cardBorder: string;

  // Text
  text: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;

  // Brand (unchanged between themes)
  gold: string;
  softGold: string;
  rose: string;
  error: string;
  success: string;
  warning: string;

  // Boudoir
  boudoir800: string;
  boudoir900: string;
  boudoir950: string;

  // UI elements
  separator: string;
  separatorLight: string;
  inputBg: string;
  inputBorder: string;
  placeholder: string;
  icon: string;
  iconActive: string;
  tabBarBg: string;
  tabBarBorder: string;
  headerBg: string;

  // Badges
  badgeBg: string;
  badgeBorder: string;

  // Buttons
  buttonBg: string;
  buttonText: string;
  buttonSecondaryBg: string;
  buttonSecondaryText: string;
  buttonSecondaryBorder: string;

  // Overlays
  overlay: string;
  shimmer: string;
}

const lightColors: ThemeColors = {
  // Backgrounds
  background: '#f5f3f0',
  linearBackground: `linear-gradient(
    to right,
    rgba(253, 245, 230, 0.95) 10%,
    rgba(253, 245, 230, 0.3) 50%,
    rgba(253, 245, 230, 0.95) 90%
  )`,
  surface: '#FFFFFF',
  surfaceSecondary: '#F5F5F5',
  card: '#FFFFFF',
  cardBorder: staticColors.gray[200],

  // Text
  text: staticColors.charcoal,
  textSecondary: staticColors.gray[500],
  textTertiary: staticColors.gray[400],
  textInverse: '#FFFFFF',

  // Brand (unchanged between themes)
  gold: staticColors.gold,
  softGold: staticColors.softGold,
  rose: staticColors.rose,
  error: staticColors.error,
  success: staticColors.success,
  warning: staticColors.warning,

  // Boudoir
  boudoir800: staticColors.boudoir[800],
  boudoir900: staticColors.boudoir[900],
  boudoir950: staticColors.boudoir[950],

  // UI elements
  separator: staticColors.gray[200],
  separatorLight: staticColors.gray[100],
  inputBg: '#FFFFFF',
  inputBorder: staticColors.gray[200],
  placeholder: staticColors.gray[400],
  icon: staticColors.gray[500],
  iconActive: staticColors.gold,
  tabBarBg: '#FFFFFF',
  tabBarBorder: staticColors.gray[200],
  headerBg: '#FFFFFF',

  // Badges
  badgeBg: 'rgba(212,175,55,0.08)',
  badgeBorder: 'rgba(212,175,55,0.15)',

  // Buttons
  buttonBg: staticColors.gold,
  buttonText: '#FFFFFF',
  buttonSecondaryBg: '#F5F5F5',
  buttonSecondaryText: staticColors.charcoal,
  buttonSecondaryBorder: staticColors.gray[300],

  // Overlays
  overlay: 'rgba(0,0,0,0.3)',
  shimmer: 'rgba(255,255,255,0.6)',
} as const;

const darkColors: ThemeColors = {
  // Backgrounds
  background: '#1a0d10',
  linearBackground: `linear-gradient(
    to right,
    rgba(26, 15, 10, 0.95) 0%,
    rgba(26, 15, 10, 0.6) 40%,
    rgba(26, 15, 10, 0.3) 60%,
    rgba(26, 15, 10, 0.6) 100%
  )`,
  surface: '#ffffff0d',
  surfaceSecondary: '#2a1a1e',
  card: '#221418',
  cardBorder: 'rgba(212,175,55,0.15)',

  // Text
  text: '#F5E6E0',
  textSecondary: 'rgba(255,255,255,0.6)',
  textTertiary: 'rgba(255,255,255,0.35)',
  textInverse: '#1a0d10',

  // Brand
  gold: staticColors.gold,
  softGold: staticColors.softGold,
  rose: staticColors.rose,
  error: '#EF4444',
  success: '#22C55E',
  warning: '#F59E0B',

  // Boudoir
  boudoir800: staticColors.boudoir[800],
  boudoir900: staticColors.boudoir[900],
  boudoir950: staticColors.boudoir[950],

  // UI elements
  separator: 'rgba(212,175,55,0.12)',
  separatorLight: 'rgba(255,255,255,0.05)',
  inputBg: '#1F1418',
  inputBorder: 'rgba(212,175,55,0.2)',
  placeholder: 'rgba(255,255,255,0.3)',
  icon: 'rgba(255,255,255,0.4)',
  iconActive: staticColors.gold,
  tabBarBg: '#1a0d10',
  tabBarBorder: 'rgba(212,175,55,0.1)',
  headerBg: '#35121a',

  // Badges
  badgeBg: 'rgba(212,175,55,0.12)',
  badgeBorder: 'rgba(212,175,55,0.25)',

  // Buttons
  buttonBg: staticColors.gold,
  buttonText: '#FFFFFF',
  buttonSecondaryBg: 'rgba(255,255,255,0.08)',
  buttonSecondaryText: '#F5E6E0',
  buttonSecondaryBorder: 'rgba(212,175,55,0.25)',

  // Overlays
  overlay: 'rgba(0,0,0,0.6)',
  shimmer: 'rgba(255,255,255,0.05)',
} as const;

export type ThemeMode = 'light' | 'dark';

// ─── Context ───────────────────────────────────────────────────────────────────

interface ThemeContextValue {
  mode: ThemeMode;
  isDark: boolean;
  themeColors: ThemeColors;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'light',
  isDark: false,
  themeColors: lightColors,
  setMode: () => {},
  toggleMode: () => {},
});

// ─── Provider ──────────────────────────────────────────────────────────────────

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('light');

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((saved) => {
      if (saved === 'dark' || saved === 'light') {
        setModeState(saved);
      }
    });
  }, []);

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    AsyncStorage.setItem(THEME_KEY, m);
  }, []);

  const toggleMode = useCallback(() => {
    setMode(mode === 'light' ? 'dark' : 'light');
  }, [mode, setMode]);

  const value: ThemeContextValue = {
    mode,
    isDark: mode === 'dark',
    themeColors: mode === 'dark' ? darkColors : lightColors,
    setMode,
    toggleMode,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// ─── Hooks ─────────────────────────────────────────────────────────────────────

/** Get full theme context (mode, colors, setters) */
export function useTheme() {
  return useContext(ThemeContext);
}

/** Shorthand: just get the themed colors */
export function useThemeColors(): ThemeColors {
  return useContext(ThemeContext).themeColors;
}
