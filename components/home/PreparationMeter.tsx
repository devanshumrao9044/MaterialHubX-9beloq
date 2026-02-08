import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GradientCard } from '@/components/ui/GradientCard';
import { useTheme, Spacing, Typography } from '@/constants/theme';

interface PreparationMeterProps {
  xp: number;
}

export function PreparationMeter({ xp }: PreparationMeterProps) {
  const theme = useTheme();
  
  const maxXP = 1000;
  const progress = Math.min((xp / maxXP) * 100, 100);
  const level = Math.floor(xp / 100) + 1;

  return (
    <GradientCard style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Preparation Meter</Text>
          <Text style={styles.subtitle}>Assigned based on comparison with toppers</Text>
        </View>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>L{level}</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View>
          <Text style={styles.xpValue}>{xp} XP</Text>
          <Text style={styles.xpLabel}>Current XP</Text>
        </View>
        <View style={styles.divider} />
        <View>
          <Text style={styles.xpValue}>{maxXP - xp}</Text>
          <Text style={styles.xpLabel}>To Next Level</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { backgroundColor: 'rgba(255,255,255,0.3)' }]}>
          <View
            style={[
              styles.progressFill,
              { width: `${progress}%`, backgroundColor: '#FFFFFF' },
            ]}
          />
        </View>
        <Text style={styles.progressText}>{progress.toFixed(1)}%</Text>
      </View>
    </GradientCard>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  levelBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  levelText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: Spacing.md,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  xpValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  xpLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 4,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    minWidth: 45,
    textAlign: 'right',
  },
});
