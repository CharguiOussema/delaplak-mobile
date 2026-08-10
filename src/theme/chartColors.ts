import { theme } from './theme';

// Validated categorical set (dataviz skill's default palette — the brand's own accent hues
// don't clear the chroma-floor/CVD checks as a categorical series, see the web app's
// theme/chartColors.ts for the validator run). Fixed order, never cycled or reassigned.
export const CATEGORICAL_CHART_COLORS = [
  '#2a78d6', // blue
  '#eb6834', // orange
  '#1baf7a', // aqua
  '#eda100', // yellow
  '#e87ba4', // magenta
  '#008300', // green
] as const;

// Status colors stay reserved to actual state (order status, stock level) — the app's own
// existing success/warning/danger tokens, never reused as a categorical series color.
export const STATUS_CHART_COLORS = {
  good: theme.colors.success,
  warning: theme.colors.warning,
  critical: theme.colors.danger,
} as const;

// Single-series contexts (one metric, no cross-series CVD concern) stay on-brand.
export const SEQUENTIAL_CHART_COLOR = theme.colors.primary;
