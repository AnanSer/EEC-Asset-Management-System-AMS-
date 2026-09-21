/**
 * EEC brand color tokens as JS constants.
 * These mirror the Tailwind theme defined in tailwind.config.ts.
 * Use for non-Tailwind contexts (e.g., chart libraries, SVGs).
 */

export const EEC_COLORS = {
  primary:    '#083D4A',
  accent:     '#00A7D6',
  active:     '#C96F59',
  background: '#F4F8FA',
  card:       '#FFFFFF',
  text:       '#1E293B',
} as const;

export type EECColorKey = keyof typeof EEC_COLORS;
