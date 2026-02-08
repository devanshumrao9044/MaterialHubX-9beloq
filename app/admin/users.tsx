import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/hooks/useApp';
import { useTheme, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { getSupabaseClient } from '@/template';

interface UserProfile {
  id: string;
  username: string | null;
  email: string;
  total_xp: number;
  created_at: string;
  last_active_at: string | null;
}

export default function AdminUsersScreen() {
  const { isDarkMode } = useApp();
  const theme = useTheme(isDarkMode);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = (user: UserProfile) => {
    Alert.alert(
      'Reset Password',
      `Reset password for ${user.email}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          onPress: () => {
            Alert.alert('Info', 'Password reset functionality requires Edge Function implementation');
          },
        },
      ]
    );
  };

  const handleBanUser = (user: UserProfile) => {
    Alert.alert(
      'Ban User',
      `Are you sure you want to ban ${user.email}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Ban',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Info', 'User ban functionality requires Edge Function implementation');
          },
        },
      ]
    );
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <Text style={styles.headerTitle}>Manage Users</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={20} color="#FFFFFF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            placeholderTextColor="rgba(255,255,255,0.6)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </LinearGradient>

      <View style={styles.statsBar}>
        <Text style={[styles.statsText, { color: theme.textSecondary }]}>
          Total Users: {users.length}
        </Text>
      </View>

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshing={loading}
        onRefresh={loadUsers}
        renderItem={({ item }) => (
          <View style={[styles.userCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.userHeader}>
              <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
                <Text style={styles.avatarText}>
                  {item.username?.[0]?.toUpperCase() || item.email[0].toUpperCase()}
                </Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={[styles.userName, { color: theme.text }]}>
                  {item.username || 'No name'}
                </Text>
                <Text style={[styles.userEmail, { color: theme.textSecondary }]}>
                  {item.email}
                </Text>
                <View style={styles.xpBadge}>
                  <MaterialIcons name="star" size={14} color="#FFD700" />
                  <Text style={[styles.xpText, { color: theme.textSecondary }]}>
                    {item.total_xp} XP
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.userActions}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: theme.primary }]}
                onPress={() => handleResetPassword(item)}
              >
                <MaterialIcons name="lock-reset" size={18} color="#FFFFFF" />
                <Text style={styles.actionText}>Reset</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: theme.error }]}
                onPress={() => handleBanUser(item)}
              >
                <MaterialIcons name="block" size={18} color="#FFFFFF" />
                <Text style={styles.actionText}>Ban</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    color: '#FFFFFF',
    fontSize: 16,
  },
  statsBar: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  statsText: {
    ...Typography.caption,
    fontWeight: '600',
  },
  listContent: {
    padding: Spacing.md,
  },
  userCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  userHeader: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  avatar: {
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
  userName: {
    ...Typography.bodyBold,
    marginBottom: 2,
  },
  userEmail: {
    ...Typography.caption,
    marginBottom: 4,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  xpText: {
    ...Typography.small,
    fontWeight: '600',
  },
  userActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
