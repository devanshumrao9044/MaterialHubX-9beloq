import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme, Spacing, Typography, BorderRadius } from '@/constants/theme';

interface ExploreItemProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
}

export function ExploreItem({ icon, title, subtitle, onPress }: ExploreItemProps) {
  const theme = useTheme();

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: theme.primary }]}>
        <MaterialIcons name={icon} size={24} color="#FFFFFF" />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
      <MaterialIcons name="chevron-right" size={24} color={theme.textSecondary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...Typography.bodyBold,
    marginBottom: 2,
  },
  subtitle: {
    ...Typography.caption,
  },
});
