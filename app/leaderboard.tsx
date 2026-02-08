import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/template';
import { useApp } from '@/hooks/useApp';
import { useTheme, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { leaderboardService, LeaderboardEntry } from '@/services/leaderboardService';

export default function LeaderboardScreen() {
  const theme = useTheme(useApp().isDarkMode);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState<number | null>(null);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const { data, error } = await leaderboardService.getGlobalLeaderboard(100);
      if (error) throw error;
      
      setLeaderboard(data || []);

      // Find current user's rank
      if (user) {
        const userEntry = data?.find(entry => entry.user_id === user.id);
        setUserRank(userEntry?.rank || null);
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMedalIcon = (rank: number) => {
    if (rank === 1) return { icon: 'emoji-events', color: '#FFD700' };
    if (rank === 2) return { icon: 'emoji-events', color: '#C0C0C0' };
    if (rank === 3) return { icon: 'emoji-events', color: '#CD7F32' };
    return null;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <LinearGradient
        colors={theme.gradient}
        style={[styles.header, { paddingTop: insets.top + Spacing.md }]}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Leaderboard</Text>
          <TouchableOpacity onPress={loadLeaderboard}>
            <MaterialIcons name="refresh" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSubtitle}>Global Rankings</Text>
        
        {user && userRank && (
          <View style={styles.userRankCard}>
            <Text style={styles.userRankLabel}>Your Rank</Text>
            <View style={styles.userRankRow}>
              <Text style={styles.userRankNumber}>#{userRank}</Text>
              <Text style={styles.userRankTotal}>/ {leaderboard.length}</Text>
            </View>
          </View>
        )}
      </LinearGradient>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <FlatList
          data={leaderboard}
          keyExtractor={(item) => item.user_id}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 20 }]}
          refreshing={loading}
          onRefresh={loadLeaderboard}
          renderItem={({ item }) => {
            const medal = getMedalIcon(item.rank);
            const isCurrentUser = user?.id === item.user_id;

            return (
              <View
                style={[
                  styles.rankCard,
                  { backgroundColor: theme.card, borderColor: theme.border },
                  isCurrentUser && { borderColor: theme.primary, borderWidth: 2 },
                ]}
              >
                <View style={styles.rankBadge}>
                  {medal ? (
                    <MaterialIcons name={medal.icon} size={24} color={medal.color} />
                  ) : (
                    <Text style={[styles.rankText, { color: theme.textSecondary }]}>
                      #{item.rank}
                    </Text>
                  )}
                </View>

                <View style={[styles.avatarContainer, { backgroundColor: isCurrentUser ? theme.primary : '#8B5CF6' }]}>
                  <Text style={styles.avatarText}>
                    {item.username?.[0]?.toUpperCase() || 'U'}
                  </Text>
                </View>

                <View style={styles.userInfo}>
                  <Text style={[styles.username, { color: theme.text }]}>
                    {item.username || 'User'}
                    {isCurrentUser && ' (You)'}
                  </Text>
                  <View style={styles.xpContainer}>
                    <MaterialIcons name="star" size={14} color="#FFD700" />
                    <Text style={[styles.xpText, { color: theme.textSecondary }]}>
                      {item.total_xp} XP
                    </Text>
                  </View>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyContainer}>
                <MaterialIcons name="emoji-events" size={64} color={theme.textSecondary} />
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                  No rankings yet. Start earning XP to appear here!
                </Text>
              </View>
            ) : null
          }
        />
      )}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  userRankCard: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  userRankLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  userRankRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  userRankNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userRankTotal: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: Spacing.md,
  },
  rankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  rankBadge: {
    width: 32,
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  rankText: {
    ...Typography.bodyBold,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
  },
  username: {
    ...Typography.bodyBold,
    marginBottom: 4,
  },
  xpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  xpText: {
    ...Typography.caption,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyText: {
    ...Typography.body,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
});
