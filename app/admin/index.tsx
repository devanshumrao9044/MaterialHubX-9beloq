import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/template';
import { useApp } from '@/hooks/useApp';
import { useTheme, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { getSupabaseClient } from '@/template';

const ADMIN_EMAIL = 'admin@materialhubx.com';

export default function AdminDashboardScreen() {
  const { isDarkMode } = useApp();
  const theme = useTheme(isDarkMode);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMaterials: 0,
    totalOrders: 0,
    totalProducts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminAccess();
    loadStats();
  }, [user]);

  const checkAdminAccess = () => {
    if (user?.email !== ADMIN_EMAIL) {
      Alert.alert('Access Denied', 'You do not have admin privileges', [
        { text: 'OK', onPress: () => router.replace('/(tabs)') }
      ]);
    }
  };

  const loadStats = async () => {
    try {
      const supabase = getSupabaseClient();
      
      const [usersRes, materialsRes, ordersRes, productsRes] = await Promise.all([
        supabase.from('user_profiles').select('id', { count: 'exact', head: true }),
        supabase.from('study_materials').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id', { count: 'exact', head: true }),
        supabase.from('store_products').select('id', { count: 'exact', head: true }),
      ]);

      setStats({
        totalUsers: usersRes.count || 0,
        totalMaterials: materialsRes.count || 0,
        totalOrders: ordersRes.count || 0,
        totalProducts: productsRes.count || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const adminCards = [
    { icon: 'school', title: 'Batches', route: '/admin/batches', color: '#6C63FF' },
    { icon: 'library-books', title: 'Materials', route: '/admin/materials', color: '#8B5CF6' },
    { icon: 'people', title: 'Users', route: '/admin/users', color: '#4CAF50' },
    { icon: 'store', title: 'Store', route: '/admin/store', color: '#FFA726' },
    { icon: 'shopping-bag', title: 'Orders', route: '/admin/orders', color: '#2196F3' },
    { icon: 'local-offer', title: 'Coupons', route: '/admin/coupons', color: '#FF6584' },
  ];

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
          <Text style={styles.headerTitle}>Admin Panel</Text>
          <MaterialIcons name="admin-panel-settings" size={24} color="#FFFFFF" />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
      >
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <MaterialIcons name="people" size={32} color={theme.primary} />
            <Text style={[styles.statValue, { color: theme.text }]}>{stats.totalUsers}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total Users</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <MaterialIcons name="library-books" size={32} color={theme.primary} />
            <Text style={[styles.statValue, { color: theme.text }]}>{stats.totalMaterials}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Materials</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <MaterialIcons name="shopping-bag" size={32} color={theme.primary} />
            <Text style={[styles.statValue, { color: theme.text }]}>{stats.totalOrders}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Orders</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <MaterialIcons name="store" size={32} color={theme.primary} />
            <Text style={[styles.statValue, { color: theme.text }]}>{stats.totalProducts}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Products</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Management</Text>

        <View style={styles.adminGrid}>
          {adminCards.map((card, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.adminCard, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => router.push(card.route as any)}
              activeOpacity={0.7}
            >
              <View style={[styles.adminIcon, { backgroundColor: `${card.color}15` }]}>
                <MaterialIcons name={card.icon as any} size={32} color={card.color} />
              </View>
              <Text style={[styles.adminTitle, { color: theme.text }]}>{card.title}</Text>
            </TouchableOpacity>
          ))}
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
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.md,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.xs,
    marginBottom: Spacing.lg,
  },
  statCard: {
    width: '50%',
    padding: Spacing.md,
    paddingHorizontal: Spacing.xs,
  },
  statValue: {
    ...Typography.h2,
    marginTop: Spacing.sm,
  },
  statLabel: {
    ...Typography.caption,
    marginTop: 4,
  },
  sectionTitle: {
    ...Typography.h3,
    marginBottom: Spacing.md,
  },
  adminGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.xs,
  },
  adminCard: {
    width: '50%',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    margin: Spacing.xs,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  adminIcon: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  adminTitle: {
    ...Typography.bodyBold,
  },
});
