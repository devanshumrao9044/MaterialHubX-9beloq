import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme, Spacing, Typography, BorderRadius } from '@/constants/theme';

interface QuickAccessCardProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  onPress: () => void;
}

export function QuickAccessCard({ icon, title, onPress }: QuickAccessCardProps) {
  const theme = useTheme();

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.card, shadowColor: theme.shadow }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: theme.background }]}>
        <MaterialIcons name={icon} size={28} color={theme.primary} />
      </View>
      <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    minHeight: 110,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  title: {
    ...Typography.caption,
    fontWeight: '600',
    textAlign: 'center',
  },
});
