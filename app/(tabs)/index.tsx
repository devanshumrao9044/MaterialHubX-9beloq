import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/template';
import { useApp } from '@/hooks/useApp';
import { useXPTracker } from '@/hooks/useXPTracker';
import { PreparationMeter } from '@/components/home/PreparationMeter';
import { BatchSelector } from '@/components/home/BatchSelector';
import { QuickAccessCard } from '@/components/ui/QuickAccessCard';
import { ExploreItem } from '@/components/ui/ExploreItem';
import { Drawer } from '@/components/layout/Drawer';
import { useTheme, Spacing, Typography } from '@/constants/theme';

export default function HomeScreen() {
  const { isDarkMode } = useApp();
  const theme = useTheme(isDarkMode);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { totalXP, refreshProfile } = useApp();
  const [drawerVisible, setDrawerVisible] = useState(false);

  useXPTracker(user?.id || null);

  useEffect(() => {
    const interval = setInterval(() => {
      refreshProfile();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Drawer visible={drawerVisible} onClose={() => setDrawerVisible(false)} />

      <LinearGradient
        colors={theme.gradient}
        style={[styles.header, { paddingTop: insets.top }]}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => setDrawerVisible(true)}>
            <MaterialIcons name="menu" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.xpBadge}>
            <MaterialIcons name="star" size={16} color="#FFD700" />
            <Text style={styles.xpText}>{totalXP} XP</Text>
          </View>
        </View>
        <Text style={styles.greeting}>Hello, Student!</Text>
        <Text style={styles.subtitle}>Let us crush your goals today</Text>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        <BatchSelector />
        <PreparationMeter xp={totalXP} />

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Access</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <QuickAccessCard
                icon="school"
                title="My Batches"
                onPress={() => router.push('/batches')}
              />
            </View>
            <View style={styles.gridItem}>
              <QuickAccessCard
                icon="sports-esports"
                title="Battleground"
                onPress={() => router.push('/quiz')}
              />
            </View>
            <View style={styles.gridItem}>
              <QuickAccessCard
                icon="help"
                title="My Doubts"
                onPress={() => router.push('/doubts')}
              />
            </View>
            <View style={styles.gridItem}>
              <QuickAccessCard
                icon="history"
                title="My History"
                onPress={() => {}}
              />
            </View>
            <View style={styles.gridItem}>
              <QuickAccessCard
                icon="download"
                title="Downloads"
                onPress={() => router.push('/downloads')}
              />
            </View>
            <View style={styles.gridItem}>
              <QuickAccessCard
                icon="bookmark"
                title="Bookmarks"
                onPress={() => router.push('/bookmarks')}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Explore</Text>
          <ExploreItem
            icon="assignment"
            title="Test Series"
            subtitle="Explore available test series here"
            onPress={() => router.push('/test-series')}
          />
          <ExploreItem
            icon="library-books"
            title="Library"
            subtitle="Access all your free study material here"
            onPress={() => router.push('/library')}
          />
          <ExploreItem
            icon="leaderboard"
            title="Leaderboard"
            subtitle="See where you stand among peers"
            onPress={() => router.push('/leaderboard')}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  xpText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingTop: Spacing.md,
  },
  section: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.h3,
    marginBottom: Spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.xs,
  },
  gridItem: {
    width: '33.33%',
    padding: Spacing.xs,
  },
});
