// A small, original design system used across the in-house component set (src/components/ui).
// Conceptually coordinated with a typical modern Antd theme: a clean primary blue, generous
// whitespace, rounded corners and a clear type scale — but implemented independently for RN.
// Single white/light design — no dark mode.

const palette = {
  blue50: '#EFF6FF',
  blue100: '#DBEAFE',
  blue500: '#2F6FED',
  blue600: '#255FD1',
  blue700: '#1D4FB0',
  slate50: '#F8FAFC',
  slate100: '#F1F5F9',
  slate200: '#E2E8F0',
  slate300: '#CBD5E1',
  slate400: '#94A3B8',
  slate500: '#64748B',
  slate900: '#0F172A',
  white: '#FFFFFF',
  green500: '#16A34A',
  green100: '#DCFCE7',
  red500: '#DC2626',
  red100: '#FEE2E2',
  amber500: '#D97706',
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
    primary: palette.blue500,
    primaryHover: palette.blue600,
    primaryText: palette.white,
    primarySoft: palette.blue50,
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
  sm: 6,
  md: 10,
  lg: 16,
  full: 999,
};

export const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const },
  h2: { fontSize: 22, fontWeight: '700' as const },
  h3: { fontSize: 18, fontWeight: '600' as const },
  body: { fontSize: 15, fontWeight: '400' as const },
  bodyBold: { fontSize: 15, fontWeight: '600' as const },
  small: { fontSize: 13, fontWeight: '400' as const },
  tiny: { fontSize: 11, fontWeight: '500' as const },
};

