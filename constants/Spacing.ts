/**
 * MeetMeAt Design System - Spacing
 * Based on project design system specification
 */

export const Spacing = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
} as const;

export const BorderRadius = {
  sm: 8,    // inputs
  md: 12,   // cards
  lg: 16,   // modals
  full: 9999, // avatars (50%)
} as const;

export type SpacingKey = keyof typeof Spacing;
export type BorderRadiusKey = keyof typeof BorderRadius;
