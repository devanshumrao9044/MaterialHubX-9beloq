import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/hooks/useApp';
import { useTheme, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { storeService, Order, OrderStatusHistory } from '@/services/storeService';

export default function OrderDetailScreen() {
  const theme = useTheme(useApp().isDarkMode);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [statusHistory, setStatusHistory] = useState<OrderStatusHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadOrderDetails();
    }
  }, [id]);

  const loadOrderDetails = async () => {
    try {
      const [orderRes, historyRes] = await Promise.all([
        storeService.getOrderDetails(id),
        storeService.getOrderStatusHistory(id),
      ]);

      if (orderRes.error) throw orderRes.error;
      setOrder(orderRes.data);
      setStatusHistory(historyRes.data || []);
    } catch (error) {
      console.error('Error loading order details:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusSteps = [
    { key: 'placed', label: 'Order Placed', icon: 'receipt' },
    { key: 'confirmed', label: 'Confirmed', icon: 'check-circle' },
    { key: 'processing', label: 'Processing', icon: 'settings' },
    { key: 'shipped', label: 'Shipped', icon: 'local-shipping' },
    { key: 'delivered', label: 'Delivered', icon: 'home' },
  ];

  const getCurrentStepIndex = () => {
    if (!order) return 0;
    return statusSteps.findIndex(step => step.key === order.status);
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
    return date.toLocaleString('en-IN', { 
      day: 'numeric', 
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.textSecondary }]}>
          Order not found
        </Text>
      </View>
    );
  }

  const currentStepIndex = getCurrentStepIndex();

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
          <Text style={styles.headerTitle}>Order Details</Text>
          <View style={{ width: 24 }} />
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Order Info */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <View style={styles.orderInfoRow}>
            <View>
              <Text style={[styles.orderNumber, { color: theme.text }]}>
                #{order.order_number}
              </Text>
              <Text style={[styles.orderDate, { color: theme.textSecondary }]}>
                Placed on {formatDate(order.created_at)}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(order.status)}15` }]}>
              <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                {order.status}
              </Text>
            </View>
          </View>
        </View>

        {/* Order Tracking */}
        {order.status !== 'cancelled' && (
          <View style={[styles.section, { backgroundColor: theme.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Order Tracking</Text>
            
            <View style={styles.trackingContainer}>
              {statusSteps.map((step, index) => {
                const isCompleted = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;

                return (
                  <View key={step.key} style={styles.trackingStep}>
                    <View style={styles.trackingIconContainer}>
                      <View
                        style={[
                          styles.trackingIcon,
                          {
                            backgroundColor: isCompleted ? theme.primary : theme.border,
                            borderColor: isCurrent ? theme.primary : theme.border,
                          },
                        ]}
                      >
                        <MaterialIcons
                          name={step.icon as any}
                          size={20}
                          color={isCompleted ? '#FFFFFF' : theme.textSecondary}
                        />
                      </View>
                      {index < statusSteps.length - 1 && (
                        <View
                          style={[
                            styles.trackingLine,
                            { backgroundColor: isCompleted ? theme.primary : theme.border },
                          ]}
                        />
                      )}
                    </View>

                    <View style={styles.trackingInfo}>
                      <Text
                        style={[
                          styles.trackingLabel,
                          { color: isCompleted ? theme.text : theme.textSecondary },
                          isCurrent && { fontWeight: '700' },
                        ]}
                      >
                        {step.label}
                      </Text>
                      {isCompleted && statusHistory.find(h => h.status === step.key) && (
                        <Text style={[styles.trackingDate, { color: theme.textSecondary }]}>
                          {formatDate(statusHistory.find(h => h.status === step.key)!.created_at)}
                        </Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Items */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Order Items</Text>
          {order.order_items?.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={[styles.itemName, { color: theme.text }]}>
                  {item.store_products.title}
                </Text>
                <Text style={[styles.itemMeta, { color: theme.textSecondary }]}>
                  Qty: {item.quantity} × ₹{item.price_at_purchase}
                </Text>
              </View>
              <Text style={[styles.itemTotal, { color: theme.primary }]}>
                ₹{(item.quantity * item.price_at_purchase).toFixed(2)}
              </Text>
            </View>
          ))}

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: theme.text }]}>Total Amount</Text>
            <Text style={[styles.totalAmount, { color: theme.primary }]}>
              ₹{order.total_amount}
            </Text>
          </View>
        </View>

        {/* Shipping Address */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Shipping Address</Text>
          <Text style={[styles.addressText, { color: theme.text }]}>
            {order.shipping_address.fullName}
          </Text>
          <Text style={[styles.addressText, { color: theme.textSecondary }]}>
            {order.shipping_address.phone}
          </Text>
          <Text style={[styles.addressText, { color: theme.textSecondary }]}>
            {order.shipping_address.address}
          </Text>
          <Text style={[styles.addressText, { color: theme.textSecondary }]}>
            {order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.pincode}
          </Text>
        </View>

        {/* Payment Info */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Payment Information</Text>
          <View style={styles.paymentRow}>
            <Text style={[styles.paymentLabel, { color: theme.textSecondary }]}>Method:</Text>
            <Text style={[styles.paymentValue, { color: theme.text }]}>
              {order.payment_method || 'COD'}
            </Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={[styles.paymentLabel, { color: theme.textSecondary }]}>Status:</Text>
            <Text
              style={[
                styles.paymentValue,
                { color: order.payment_status === 'success' ? theme.success : theme.warning },
              ]}
            >
              {order.payment_status}
            </Text>
          </View>
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
  errorText: {
    ...Typography.body,
    textAlign: 'center',
    padding: Spacing.lg,
  },
  content: {
    padding: Spacing.md,
  },
  section: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h3,
    marginBottom: Spacing.md,
  },
  orderInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderNumber: {
    ...Typography.h3,
    marginBottom: 4,
  },
  orderDate: {
    ...Typography.caption,
  },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    ...Typography.bodyBold,
    textTransform: 'capitalize',
  },
  trackingContainer: {
    paddingVertical: Spacing.sm,
  },
  trackingStep: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  trackingIconContainer: {
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  trackingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  trackingLine: {
    width: 2,
    flex: 1,
    marginTop: 4,
  },
  trackingInfo: {
    flex: 1,
    paddingTop: 8,
  },
  trackingLabel: {
    ...Typography.body,
    marginBottom: 2,
  },
  trackingDate: {
    ...Typography.small,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    ...Typography.bodyBold,
    marginBottom: 4,
  },
  itemMeta: {
    ...Typography.caption,
  },
  itemTotal: {
    ...Typography.bodyBold,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.md,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    ...Typography.bodyBold,
    fontSize: 16,
  },
  totalAmount: {
    fontSize: 22,
    fontWeight: '700',
  },
  addressText: {
    ...Typography.body,
    marginBottom: 4,
    lineHeight: 22,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  paymentLabel: {
    ...Typography.body,
  },
  paymentValue: {
    ...Typography.bodyBold,
    textTransform: 'capitalize',
  },
});
