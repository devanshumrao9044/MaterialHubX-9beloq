import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, BorderRadius } from '@/constants/theme';

interface GradientCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function GradientCard({ children, style }: GradientCardProps) {
  const theme = useTheme();

  return (
    <LinearGradient
      colors={theme.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, style]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    padding: 16,
  },
});
