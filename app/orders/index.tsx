import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/template';
import { useApp } from '@/hooks/useApp';
import { useTheme, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { storeService, Order } from '@/services/storeService';

export default function OrdersScreen() {
  const theme = useTheme(useApp().isDarkMode);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    if (!user) return;
    try {
      const { data, error } = await storeService.getUserOrders(user.id);
      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return theme.success;
      case 'cancelled': return theme.error;
      case 'shipped': return '#2196F3';
      case 'processing': return '#FF9800';
      default: return theme.primary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return 'check-circle';
      case 'cancelled': return 'cancel';
      case 'shipped': return 'local-shipping';
      case 'processing': return 'hourglass-empty';
      default: return 'receipt';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short',
      year: 'numeric',
    });
  };

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.centerContainer}>
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            Please login to view orders
          </Text>
        </View>
      </View>
    );
  }

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
          <Text style={styles.headerTitle}>My Orders</Text>
          <View style={{ width: 24 }} />
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.centerContainer}>
          <MaterialIcons name="receipt-long" size={64} color={theme.textSecondary} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>No Orders Yet</Text>
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            Your order history will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.orderCard, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => router.push(`/orders/${item.id}`)}
            >
              <View style={styles.orderHeader}>
                <View>
                  <Text style={[styles.orderNumber, { color: theme.text }]}>
                    #{item.order_number}
                  </Text>
                  <Text style={[styles.orderDate, { color: theme.textSecondary }]}>
                    {formatDate(item.created_at)}
                  </Text>
                </View>

                <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}15` }]}>
                  <MaterialIcons
                    name={getStatusIcon(item.status) as any}
                    size={16}
                    color={getStatusColor(item.status)}
                  />
                  <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                    {item.status}
                  </Text>
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: theme.border }]} />

              <View style={styles.orderDetails}>
                <View style={styles.detailRow}>
                  <MaterialIcons name="shopping-bag" size={16} color={theme.textSecondary} />
                  <Text style={[styles.detailText, { color: theme.textSecondary }]}>
                    {item.order_items?.length || 0} items
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <MaterialIcons name="payment" size={16} color={theme.textSecondary} />
                  <Text style={[styles.detailText, { color: theme.textSecondary }]}>
                    {item.payment_method || 'COD'}
                  </Text>
                </View>

                <View style={styles.amountRow}>
                  <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>Total:</Text>
                  <Text style={[styles.totalAmount, { color: theme.primary }]}>
                    ₹{item.total_amount}
                  </Text>
                </View>
              </View>

              <View style={styles.actionRow}>
                <Text style={[styles.viewDetailsText, { color: theme.primary }]}>
                  View Details
                </Text>
                <MaterialIcons name="chevron-right" size={20} color={theme.primary} />
              </View>
            </TouchableOpacity>
          )}
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
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  emptyTitle: {
    ...Typography.h2,
    marginTop: Spacing.md,
  },
  emptyText: {
    ...Typography.body,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  listContent: {
    padding: Spacing.md,
  },
  orderCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  orderNumber: {
    ...Typography.h3,
    marginBottom: 4,
  },
  orderDate: {
    ...Typography.caption,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  statusText: {
    ...Typography.caption,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  divider: {
    height: 1,
    marginBottom: Spacing.md,
  },
  orderDetails: {
    marginBottom: Spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  detailText: {
    ...Typography.body,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  totalLabel: {
    ...Typography.body,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  viewDetailsText: {
    ...Typography.bodyBold,
  },
});
