/**
 * ZoneSafe Design System - Color Palette & Theme
 * Based on COLOR_PALETTE.css
 */

export const colors = {
  // Primary: Aerospace Orange - High-visibility safety orange for CTAs and active states
  primary: '#FF4F0F',
  primaryHover: '#e64608',
  primaryActive: '#cc3d07',

  // Secondary: Floral White - Warm, outdoor-readable background
  background: '#FFFBF1',

  // Accent: Mustard Yellow - Construction signage complement
  accent: '#FFDB4C',
  accentHover: '#ffd033',

  // Neutral: Davy's Gray - Professional text and neutral elements
  neutral: '#4E4B4B',
  neutralLight: '#726e6e',
  neutralLighter: '#969292',

  // Surface: Pure White - Cards, modals, headers
  surface: '#FFFFFF',

  // Text colors
  textPrimary: '#4E4B4B',
  textSecondary: 'rgba(78, 75, 75, 0.8)',
  textLight: '#FFFFFF',

  // State colors (for future use)
  success: '#4ade80',
  warning: '#fbbf24',
  error: '#ef4444',
  info: '#3b82f6',
} as const

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
} as const

export const borderRadius = {
  sm: '4px',
  md: '8px',
  lg: '16px',
  full: '9999px',
} as const

export const typography = {
  fontFamily: {
    base: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  fontSize: {
    xs: '14px',
    sm: '16px',
    base: '18px',
    lg: '20px',
    xl: '24px',
    '2xl': '32px',
    '3xl': '40px',
    '4xl': '48px',
  },
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.6,
  },
} as const

export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px rgba(0, 0, 0, 0.15)',
} as const

export const breakpoints = {
  mobile: '768px',
  tablet: '1024px',
  desktop: '1280px',
} as const

export const theme = {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
  breakpoints,
} as const

export type Theme = typeof theme
