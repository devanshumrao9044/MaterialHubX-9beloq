import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { GradientCard } from '@/components/ui/GradientCard';

export default function QuizScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <LinearGradient
        colors={theme.gradient}
        style={[styles.header, { paddingTop: insets.top + Spacing.md }]}
      >
        <MaterialIcons name="quiz" size={32} color="#FFFFFF" />
        <Text style={styles.headerTitle}>Battleground</Text>
        <Text style={styles.headerSubtitle}>Test your knowledge</Text>
      </LinearGradient>

      <View style={styles.content}>
        <GradientCard style={styles.battleCard}>
          <MaterialIcons name="emoji-events" size={48} color="#FFFFFF" />
          <Text style={styles.battleTitle}>Daily Challenge</Text>
          <Text style={styles.battleSubtitle}>Complete today quiz to earn XP</Text>
          <TouchableOpacity style={styles.battleButton}>
            <Text style={styles.battleButtonText}>Start Battle</Text>
          </TouchableOpacity>
        </GradientCard>

        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <MaterialIcons name="trending-up" size={32} color={theme.primary} />
            <Text style={[styles.statValue, { color: theme.text }]}>0</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Quizzes Taken</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <MaterialIcons name="star" size={32} color="#FFD700" />
            <Text style={[styles.statValue, { color: theme.text }]}>0</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Best Score</Text>
          </View>
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
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: Spacing.xs,
  },
  content: {
    flex: 1,
    padding: Spacing.md,
  },
  battleCard: {
    alignItems: 'center',
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  battleTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: Spacing.md,
  },
  battleSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  battleButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.lg,
  },
  battleButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    marginTop: Spacing.sm,
  },
  statLabel: {
    fontSize: 12,
    marginTop: Spacing.xs,
  },
});
