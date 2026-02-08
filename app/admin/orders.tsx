import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/hooks/useApp';
import { useTheme, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { getSupabaseClient } from '@/template';

interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
  payment_status: string;
  payment_method: string | null;
  created_at: string;
  user_profiles: {
    username: string | null;
    email: string;
  };
}

export default function AdminOrdersScreen() {
  const theme = useTheme(useApp().isDarkMode);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadOrders();
  }, [selectedFilter]);

  const loadOrders = async () => {
    try {
      const supabase = getSupabaseClient();
      let query = supabase
        .from('orders')
        .select(`
          *,
          user_profiles!inner (username, email)
        `)
        .order('created_at', { ascending: false });
      
      if (selectedFilter !== 'all') {
        query = query.eq('status', selectedFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedOrder) return;

    setUpdating(true);
    try {
      const supabase = getSupabaseClient();
      
      // Update order status
      const { error: orderError } = await supabase
        .from('orders')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedOrder.id);

      if (orderError) throw orderError;

      // Add status history
      const { error: historyError } = await supabase
        .from('order_status_history')
        .insert({
          order_id: selectedOrder.id,
          status: newStatus,
          notes: `Status updated by admin`,
        });

      if (historyError) throw historyError;

      Alert.alert('Success', `Order status updated to ${newStatus}`);
      setStatusModalVisible(false);
      setSelectedOrder(null);
      loadOrders();
    } catch (error: any) {
      console.error('Error updating order:', error);
      Alert.alert('Error', error.message || 'Failed to update order status');
    } finally {
      setUpdating(false);
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'placed', label: 'Placed' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'processing', label: 'Processing' },
    { key: 'shipped', label: 'Shipped' },
    { key: 'delivered', label: 'Delivered' },
  ];

  const statusOptions = [
    { key: 'placed', label: 'Placed', icon: 'receipt' },
    { key: 'confirmed', label: 'Confirmed', icon: 'check-circle' },
    { key: 'processing', label: 'Processing', icon: 'settings' },
    { key: 'shipped', label: 'Shipped', icon: 'local-shipping' },
    { key: 'delivered', label: 'Delivered', icon: 'home' },
    { key: 'cancelled', label: 'Cancelled', icon: 'cancel' },
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
          <Text style={styles.headerTitle}>Order Management</Text>
          <TouchableOpacity onPress={loadOrders}>
            <MaterialIcons name="refresh" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.filterBar}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterChip,
                selectedFilter === filter.key && styles.filterChipActive,
              ]}
              onPress={() => setSelectedFilter(filter.key)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === filter.key && styles.filterTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.centerContainer}>
          <MaterialIcons name="receipt-long" size={64} color={theme.textSecondary} />
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            No orders found
          </Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={[styles.orderCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.orderHeader}>
                <View>
                  <Text style={[styles.orderNumber, { color: theme.text }]}>
                    #{item.order_number}
                  </Text>
                  <Text style={[styles.userName, { color: theme.textSecondary }]}>
                    {item.user_profiles.username || item.user_profiles.email}
                  </Text>
                  <Text style={[styles.orderDate, { color: theme.textSecondary }]}>
                    {formatDate(item.created_at)}
                  </Text>
                </View>

                <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}15` }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                    {item.status}
                  </Text>
                </View>
              </View>

              <View style={styles.orderDetails}>
                <View style={styles.detailRow}>
                  <MaterialIcons name="payment" size={16} color={theme.textSecondary} />
                  <Text style={[styles.detailText, { color: theme.textSecondary }]}>
                    {item.payment_method || 'COD'} • {item.payment_status}
                  </Text>
                </View>

                <View style={styles.amountRow}>
                  <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>Amount:</Text>
                  <Text style={[styles.totalAmount, { color: theme.primary }]}>
                    ₹{item.total_amount}
                  </Text>
                </View>
              </View>

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: theme.primary }]}
                  onPress={() => router.push(`/orders/${item.id}`)}
                >
                  <MaterialIcons name="visibility" size={16} color="#FFFFFF" />
                  <Text style={styles.actionBtnText}>View</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: theme.success }]}
                  onPress={() => {
                    setSelectedOrder(item);
                    setStatusModalVisible(true);
                  }}
                >
                  <MaterialIcons name="edit" size={16} color="#FFFFFF" />
                  <Text style={styles.actionBtnText}>Update Status</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {/* Update Status Modal */}
      <Modal visible={statusModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Update Order Status
            </Text>
            {selectedOrder && (
              <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>
                Order #{selectedOrder.order_number}
              </Text>
            )}

            <View style={styles.statusOptions}>
              {statusOptions.map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.statusOption,
                    { borderColor: theme.border },
                    selectedOrder?.status === option.key && { 
                      borderColor: theme.primary,
                      backgroundColor: `${theme.primary}15`,
                    },
                  ]}
                  onPress={() => handleUpdateStatus(option.key)}
                  disabled={updating}
                >
                  <MaterialIcons 
                    name={option.icon as any} 
                    size={24} 
                    color={selectedOrder?.status === option.key ? theme.primary : theme.textSecondary} 
                  />
                  <Text
                    style={[
                      styles.statusOptionText,
                      { color: selectedOrder?.status === option.key ? theme.primary : theme.text },
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: theme.border }]}
              onPress={() => {
                setStatusModalVisible(false);
                setSelectedOrder(null);
              }}
              disabled={updating}
            >
              <Text style={[styles.closeBtnText, { color: theme.text }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  filterBar: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  filterChipActive: {
    backgroundColor: '#FFFFFF',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  filterTextActive: {
    color: '#6C63FF',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    ...Typography.body,
    marginTop: Spacing.md,
  },
  listContent: {
    padding: Spacing.md,
  },
  orderCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  orderNumber: {
    ...Typography.h3,
    marginBottom: 2,
  },
  userName: {
    ...Typography.caption,
    marginBottom: 2,
  },
  orderDate: {
    ...Typography.caption,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    height: 24,
  },
  statusText: {
    ...Typography.caption,
    fontWeight: '600',
    textTransform: 'capitalize',
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
    ...Typography.caption,
    textTransform: 'capitalize',
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    gap: Spacing.sm,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: Spacing.md,
  },
  modalContent: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  modalTitle: {
    ...Typography.h3,
    marginBottom: 4,
  },
  modalSubtitle: {
    ...Typography.body,
    marginBottom: Spacing.lg,
  },
  statusOptions: {
    marginBottom: Spacing.lg,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  statusOptionText: {
    ...Typography.bodyBold,
  },
  closeBtn: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  closeBtnText: {
    ...Typography.bodyBold,
  },
});
