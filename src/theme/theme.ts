// A small, original design system used across the in-house component set (src/components/ui).
// Conceptually coordinated with the delaplak-web antd theme (src/theme/tokens.ts there): a
// vivid rose primary paired with a violet accent, generous whitespace, rounded corners and a
// bold type scale — but implemented independently for RN. Single white/light design — no dark mode.

const palette = {
  rose50: '#FCE7F3',
  rose500: '#EC4899',
  rose600: '#DB2777',
  rose700: '#9D174D',
  violet500: '#8B5CF6',
  violet600: '#7C3AED',
  slate50: '#F8FAFC',
  slate100: '#F1F5F9',
  slate200: '#E2E8F0',
  slate300: '#CBD5E1',
  slate400: '#94A3B8',
  slate500: '#64748B',
  slate900: '#0F172A',
  white: '#FFFFFF',
  blue500: '#0EA5E9',
  blue100: '#E0F2FE',
  green500: '#22C55E',
  green100: '#DCFCE7',
  red500: '#EF4444',
  red100: '#FEE2E2',
  amber500: '#F59E0B',
  amber100: '#FEF3C7',
};

export const theme = {
  colors: {
    background: palette.slate50,
    surface: palette.white,
    surfaceAlt: palette.slate100,
    border: palette.slate200,
    text: palette.slate900,
    textMuted: palette.slate500,
    textInverse: palette.white,
    primary: palette.rose500,
    primaryHover: palette.rose600,
    primaryText: palette.white,
    primarySoft: palette.rose50,
    accent: palette.violet500,
    accentHover: palette.violet600,
    info: palette.blue500,
    infoSoft: palette.blue100,
    success: palette.green500,
    successSoft: palette.green100,
    danger: palette.red500,
    dangerSoft: palette.red100,
    warning: palette.amber500,
    warningSoft: palette.amber100,
    disabled: palette.slate300,
  },
};

export type AppTheme = typeof theme;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 20,
  full: 999,
};

export const typography = {
  h1: { fontSize: 30, fontWeight: '800' as const },
  h2: { fontSize: 23, fontWeight: '800' as const },
  h3: { fontSize: 18, fontWeight: '700' as const },
  body: { fontSize: 15, fontWeight: '400' as const },
  bodyBold: { fontSize: 15, fontWeight: '600' as const },
  small: { fontSize: 13, fontWeight: '400' as const },
  tiny: { fontSize: 11, fontWeight: '500' as const },
};

