// A small, original design system used across the in-house component set (src/components/ui).
// Warm ivory/brass palette inspired by the "Atelier" reference template, extended with the
// brand logo's blue accent, coordinated with delaplak-web's theme (src/theme/tokens.ts there).
// Flat/near-square corners, generous whitespace, serif headings + sans body.
// Single white/light design — no dark mode.

const palette = {
  ivory: '#F6F1EA',
  cream: '#EDE6DA',
  sand: '#DBCFBE',
  ink: '#1C1A17',
  charcoal: '#3A362F',
  stone: '#7A7267',
  brass: '#B8863E',
  brassDark: '#96692C',
  brassSoft: '#F1E4CC',
  azure: '#3E7CA6',
  azureDark: '#2A5A78',
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
    background: palette.ivory,
    surface: palette.white,
    surfaceAlt: palette.cream,
    border: palette.sand,
    text: palette.ink,
    textMuted: palette.stone,
    textInverse: palette.white,
    primary: palette.brass,
    primaryHover: palette.brassDark,
    primaryText: palette.white,
    primarySoft: palette.brassSoft,
    accent: palette.azure,
    accentHover: palette.azureDark,
    info: palette.blue500,
    infoSoft: palette.blue100,
    success: palette.green500,
    successSoft: palette.green100,
    danger: palette.red500,
    dangerSoft: palette.red100,
    warning: palette.amber500,
    warningSoft: palette.amber100,
    disabled: palette.sand,
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
  sm: 2,
  md: 4,
  lg: 8,
  full: 999,
};

const serif = 'CormorantGaramond_600SemiBold';
const sansRegular = 'Inter_400Regular';
const sansMedium = 'Inter_500Medium';
const sansSemiBold = 'Inter_600SemiBold';

export const typography = {
  h1: { fontSize: 32, fontWeight: '600' as const, fontFamily: serif },
  h2: { fontSize: 25, fontWeight: '600' as const, fontFamily: serif },
  h3: { fontSize: 20, fontWeight: '600' as const, fontFamily: serif },
  body: { fontSize: 15, fontWeight: '400' as const, fontFamily: sansRegular },
  bodyBold: { fontSize: 15, fontWeight: '600' as const, fontFamily: sansSemiBold },
  small: { fontSize: 13, fontWeight: '400' as const, fontFamily: sansRegular },
  tiny: { fontSize: 11, fontWeight: '500' as const, fontFamily: sansMedium },
};

