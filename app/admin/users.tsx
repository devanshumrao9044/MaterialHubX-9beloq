import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
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
  selected_institute_id: string | null;
  selected_batch_id: string | null;
  last_active_at: string;
}

export default function AdminUsersScreen() {
  const theme = useTheme(useApp().isDarkMode);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = users.filter(
        (user) =>
          user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.username?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

  const loadUsers = async () => {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('total_xp', { ascending: false });

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('Loaded users:', data?.length);
      setUsers(data || []);
      setFilteredUsers(data || []);
    } catch (error: any) {
      console.error('Error loading users:', error);
      Alert.alert('Error', error.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = (user: UserProfile) => {
    if (user.email === 'admin@materialhubx.com') {
      Alert.alert('Error', 'Cannot delete admin user');
      return;
    }

    Alert.alert(
      'Delete User',
      `Are you sure you want to delete user "${user.email}"? This will delete all their data permanently.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const supabase = getSupabaseClient();
              
              console.log('Deleting user:', user.id);

              // Delete from user_profiles (cascade will handle related data)
              const { error } = await supabase
                .from('user_profiles')
                .delete()
                .eq('id', user.id);

              if (error) {
                console.error('Delete error:', error);
                throw new Error(`Failed to delete user: ${error.message}`);
              }

              console.log('User deleted successfully');
              Alert.alert('Success', 'User deleted successfully');
              loadUsers();
            } catch (error: any) {
              console.error('Delete failed:', error);
              Alert.alert('Error', error.message || 'Failed to delete user');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
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
          <Text style={styles.headerTitle}>User Management</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={[styles.searchBar, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
          <MaterialIcons name="search" size={20} color="#FFFFFF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by email or username..."
            placeholderTextColor="rgba(255,255,255,0.6)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialIcons name="clear" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <>
          <View style={[styles.statsBar, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.primary }]}>{users.length}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total Users</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.success }]}>{filteredUsers.length}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Filtered</Text>
            </View>
          </View>

          <FlatList
            data={filteredUsers}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            refreshing={loading}
            onRefresh={loadUsers}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MaterialIcons name="person-off" size={64} color={theme.textSecondary} />
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                  {searchQuery ? 'No users found matching your search' : 'No users registered yet'}
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <View style={[styles.userCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={styles.userHeader}>
                  <View style={[styles.userAvatar, { backgroundColor: theme.primary }]}>
                    <Text style={styles.avatarText}>
                      {item.username?.[0]?.toUpperCase() || item.email[0].toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={[styles.userName, { color: theme.text }]}>
                      {item.username || 'No username set'}
                    </Text>
                    <Text style={[styles.userEmail, { color: theme.textSecondary }]}>
                      {item.email}
                    </Text>
                    <View style={styles.userMeta}>
                      <View style={styles.xpBadge}>
                        <MaterialIcons name="star" size={14} color="#FFD700" />
                        <Text style={[styles.xpText, { color: theme.text }]}>
                          {item.total_xp} XP
                        </Text>
                      </View>
                      <Text style={[styles.lastActive, { color: theme.textSecondary }]}>
                        Active: {formatDate(item.last_active_at)}
                      </Text>
                    </View>
                  </View>
                </View>

                {item.email !== 'admin@materialhubx.com' && (
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDeleteUser(item)}
                  >
                    <MaterialIcons name="delete" size={20} color={theme.error} />
                  </TouchableOpacity>
                )}
              </View>
            )}
          />
        </>
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
  },
  statsBar: {
    flexDirection: 'row',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    ...Typography.caption,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: Spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl * 2,
  },
  emptyText: {
    ...Typography.body,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  userCard: {
    flexDirection: 'row',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  userHeader: {
    flex: 1,
    flexDirection: 'row',
  },
  userAvatar: {
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
    ...Typography.small,
    marginBottom: 4,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  xpText: {
    ...Typography.caption,
    fontWeight: '600',
  },
  lastActive: {
    ...Typography.caption,
  },
  deleteBtn: {
    padding: Spacing.sm,
  },
});
