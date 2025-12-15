import { View, StyleSheet, ViewStyle, Pressable, Platform } from 'react-native';
import { Colors, Spacing, BorderRadius } from '@/constants';
import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({
  children,
  onPress,
  style,
  padding = 'md',
}: CardProps) {
  const content = (
    <View style={[styles.card, styles[`padding_${padding}`], style]}>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    // Use boxShadow on web, shadow* on native
    ...(Platform.OS === 'web'
      ? { boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)' }
      : {
          shadowColor: Colors.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 1,
          shadowRadius: 8,
          elevation: 2,
        }),
  } as ViewStyle,
  pressed: {
    opacity: 0.9,
  } as ViewStyle,
  padding_none: {
    padding: 0,
  } as ViewStyle,
  padding_sm: {
    padding: Spacing.sm,
  } as ViewStyle,
  padding_md: {
    padding: Spacing.md,
  } as ViewStyle,
  padding_lg: {
    padding: Spacing.lg,
  } as ViewStyle,
});
