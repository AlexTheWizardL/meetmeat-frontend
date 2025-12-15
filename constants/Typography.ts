/**
 * MeetMeAt Design System - Typography
 */

import { TextStyle } from 'react-native';
import { Colors } from './Colors';

export const Typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: 40,
  } as TextStyle,

  h2: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.text,
    lineHeight: 32,
  } as TextStyle,

  h3: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    lineHeight: 28,
  } as TextStyle,

  body: {
    fontSize: 16,
    fontWeight: '400',
    color: Colors.text,
    lineHeight: 24,
  } as TextStyle,

  bodySmall: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.text,
    lineHeight: 20,
  } as TextStyle,

  caption: {
    fontSize: 12,
    fontWeight: '400',
    color: Colors.muted,
    lineHeight: 16,
  } as TextStyle,

  button: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  } as TextStyle,
} as const;

export type TypographyKey = keyof typeof Typography;
