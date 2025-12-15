/**
 * MeetMeAt Design System - Colors
 * Based on project design system specification
 */

export const Colors = {
  primary: '#6C5CE7',
  background: '#FFFFFF',
  inputBg: '#F5F5F7',
  text: '#1A1A2E',
  muted: '#8E8E93',
  danger: '#E74C3C',

  // Semantic colors
  success: '#27AE60',
  warning: '#F39C12',

  // Overlay/shadows
  overlay: 'rgba(0, 0, 0, 0.5)',
  shadow: 'rgba(0, 0, 0, 0.1)',

  // Border
  border: '#E5E5EA',
} as const;

export type ColorKey = keyof typeof Colors;
