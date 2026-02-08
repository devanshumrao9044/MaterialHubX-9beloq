import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, Spacing, Typography } from '@/constants/theme';

export default function BatchesScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <LinearGradient
        colors={theme.gradient}
        style={[styles.header, { paddingTop: insets.top + Spacing.md }]}
      >
        <MaterialIcons name="class" size={32} color="#FFFFFF" />
        <Text style={styles.headerTitle}>My Batches</Text>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.comingSoonContainer}>
          <MaterialIcons name="schedule" size={64} color={theme.textSecondary} />
          <Text style={[styles.comingSoonTitle, { color: theme.text }]}>Coming Soon</Text>
          <Text style={[styles.comingSoonText, { color: theme.textSecondary }]}>
            Batch management features will be available soon
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: Spacing.sm,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  comingSoonContainer: {
    alignItems: 'center',
  },
  comingSoonTitle: {
    ...Typography.h2,
    marginTop: Spacing.md,
  },
  comingSoonText: {
    ...Typography.body,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
});
