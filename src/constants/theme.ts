/**
 * Ember Kitchen design tokens.
 * Light-first: warm cream paper, ink-brown text and a confident tomato red.
 * Dark mode swaps to a deep, smoky maroon-black while keeping the same red as the hero colour.
 */
import '@/global.css';

import { Platform } from 'react-native';

const palette = {
  red700: '#9E1510',
  red600: '#B91C16',
  red500: '#D7261E',
  red400: '#EF4A3F',
  red300: '#FF7A6E',
  red100: '#FDE4E0',
  red50: '#FFF1EE',
  saffron: '#FFB703',
  saffronDeep: '#B07A00',
  saffronSoft: '#FFF3CC',
  cream: '#FFF8F0',
  creamDeep: '#F8EBDD',
  ink: '#2A1411',
  smoke950: '#150A09',
  smoke900: '#1D0F0D',
  smoke800: '#2A1613',
  smoke700: '#3A1D19',
  white: '#FFFFFF',
  leaf: '#2E9E5B',
} as const;

export const Colors = {
  // Brand constants (theme independent)
  primary: palette.red500,
  primaryDark: palette.red700,
  primaryTint: palette.red100,
  gold: palette.saffron,
  palette,

  // Hero surfaces (banners, auth header, splash) stay red in both modes
  hero: palette.red500,
  heroDeep: palette.red700,
  heroGlow: palette.red400,
  heroText: '#FFFFFF',
  heroMuted: 'rgba(255,255,255,0.78)',
  heroChip: 'rgba(255,255,255,0.18)',

  light: {
    text: palette.ink,
    textSecondary: '#7A5F57',
    background: palette.cream,
    paper: palette.cream,
    card: '#FFFFFF',
    cardAlt: '#FCEFE3',
    backgroundElement: '#FCEFE3',
    backgroundSelected: '#F4DFCB',
    line: '#F0DFD0',
    tint: palette.red100,
    inkSoft: '#B39C92',
    accent: '#C8201A',
    accentSurface: palette.red50,
    accentText: '#A5140F',
    cta: palette.red500,
    ctaText: '#FFFFFF',
    controlOff: '#E4D2C4',
    controlThumb: '#FFFFFF',
    danger: '#C62828',
    success: '#1F8A4C',
    warning: '#B07A00',
    gold: palette.saffron,
    goldSurface: palette.saffronSoft,
    overlay: 'rgba(42,20,17,0.55)',
  },
  dark: {
    text: '#FBEFE8',
    textSecondary: '#C2A196',
    background: palette.smoke950,
    paper: palette.smoke950,
    card: palette.smoke900,
    cardAlt: palette.smoke800,
    backgroundElement: palette.smoke800,
    backgroundSelected: palette.smoke700,
    line: '#3A201C',
    tint: '#3D1713',
    inkSoft: '#8F7167',
    accent: '#FF6A5F',
    accentSurface: '#2E1512',
    accentText: '#FF8C82',
    cta: '#DC2A22',
    ctaText: '#FFFFFF',
    controlOff: '#4A2B26',
    controlThumb: '#FFFFFF',
    danger: '#FF7B72',
    success: '#4ADE80',
    warning: '#FFC857',
    gold: palette.saffron,
    goldSurface: '#3A2C0A',
    overlay: 'rgba(0,0,0,0.65)',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;
export type AppColors = typeof Colors.light | typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'Georgia',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

/** Headline face used for display text, prices and section titles. */
export const SerifFont = Fonts?.serif as string;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

/** Tighter, squarer corners than before: Ember is crisp and editorial rather than pill-shaped. */
export const Radius = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

/** Bottom padding tab screens need so content clears the tab bar (and the floating cart bar). */
export const TabBarSpace = 150;
