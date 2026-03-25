/**
 * Cher Journal Mobile Design System
 * Mirrors the web app's luxurious boudoir aesthetic
 */

export const colors = {
  // Primary
  rose: '#E11D48',
  roseLight: '#FB7185',
  roseDark: '#BE123C',

  // Gold accents
  gold: '#D4AF37',
  softGold: '#C5A059',
  goldLight: '#E8D5A3',
  goldDark: '#69520e',

  // Boudoir browns
  boudoir: {
    50: '#FDF8F6',
    100: '#F5E6E0',
    200: '#E8CFC5',
    300: '#D4A99A',
    800: '#3D1F1A',
    900: '#2D1620',
    950: '#1A0F0A',
  },

  // Neutrals
  white: '#FFFFFF',
  black: '#000000',
  charcoal: '#333333',
  gray: {
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },

  // Semantic
  error: '#DC2626',
  success: '#16A34A',
  warning: '#D97706',

  // Background
  background: '#f5f3f0',
  backgroundDark: '#1A0F0A',
  surface: '#F9FAFB',
  surfaceDark: '#2D1620',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
} as const;

export const fontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  lg: 17,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
} as const;

export const fontWeight = {
  light: '300' as const,
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  full: 9999,
} as const;
