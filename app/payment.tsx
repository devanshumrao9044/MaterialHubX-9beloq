import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/template';
import { useApp } from '@/hooks/useApp';
import { useTheme, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { getSupabaseClient } from '@/template';

export default function PaymentScreen() {
  const theme = useTheme(useApp().isDarkMode);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const params = useLocalSearchParams<{ orderId: string; amount: string; method: string }>();
  
  const [processing, setProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'success' | 'failed'>('pending');
  const [progress] = useState(new Animated.Value(0));
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    if (params.orderId) {
      loadOrderDetails();
    }
  }, [params.orderId]);

  const loadOrderDetails = async () => {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*, store_products(*))')
        .eq('id', params.orderId)
        .single();

      if (error) throw error;
      setOrder(data);
    } catch (error) {
      console.error('Error loading order:', error);
    }
  };

  const processPayment = async () => {
    setProcessing(true);
    setPaymentStatus('processing');

    // Animate progress
    Animated.timing(progress, {
      toValue: 100,
      duration: 3000,
      useNativeDriver: false,
    }).start();

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const supabase = getSupabaseClient();

      if (params.method === 'COD') {
        // Cash on Delivery - immediate success
        const { error } = await supabase
          .from('orders')
          .update({ payment_status: 'pending', status: 'confirmed' })
          .eq('id', params.orderId);

        if (error) throw error;

        setPaymentStatus('success');
      } else if (params.method === 'UPI') {
        // UPI - simulate payment gateway
        const paymentSuccess = Math.random() > 0.1; // 90% success rate for demo

        if (paymentSuccess) {
          const { error } = await supabase
            .from('orders')
            .update({ payment_status: 'success', status: 'confirmed' })
            .eq('id', params.orderId);

          if (error) throw error;

          setPaymentStatus('success');
        } else {
          const { error } = await supabase
            .from('orders')
            .update({ payment_status: 'failed', status: 'cancelled' })
            .eq('id', params.orderId);

          if (error) throw error;

          setPaymentStatus('failed');
        }
      }

      // Add status history
      await supabase.from('order_status_history').insert({
        order_id: params.orderId,
        status: paymentStatus === 'success' ? 'confirmed' : 'cancelled',
        notes: paymentStatus === 'success' 
          ? `Payment ${params.method === 'COD' ? 'pending (COD)' : 'successful'}`
          : 'Payment failed',
      });
    } catch (error: any) {
      console.error('Payment processing error:', error);
      setPaymentStatus('failed');
      Alert.alert('Error', 'Payment processing failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const progressWidth = progress.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  if (!order || !params.orderId) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
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
          <TouchableOpacity onPress={() => router.back()} disabled={processing}>
            <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payment</Text>
          <View style={{ width: 24 }} />
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Payment Status Card */}
        <View style={[styles.statusCard, { backgroundColor: theme.card }]}>
          {paymentStatus === 'pending' && (
            <>
              <MaterialIcons name="payment" size={64} color={theme.primary} />
              <Text style={[styles.statusTitle, { color: theme.text }]}>Ready to Pay</Text>
              <Text style={[styles.statusDesc, { color: theme.textSecondary }]}>
                Review your order and proceed with payment
              </Text>
            </>
          )}

          {paymentStatus === 'processing' && (
            <>
              <ActivityIndicator size={64} color={theme.primary} />
              <Text style={[styles.statusTitle, { color: theme.text }]}>Processing Payment</Text>
              <Text style={[styles.statusDesc, { color: theme.textSecondary }]}>
                Please wait while we process your payment...
              </Text>
              <View style={[styles.progressBar, { backgroundColor: `${theme.primary}20` }]}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    { backgroundColor: theme.primary, width: progressWidth },
                  ]}
                />
              </View>
            </>
          )}

          {paymentStatus === 'success' && (
            <>
              <View style={[styles.successIcon, { backgroundColor: `${theme.success}20` }]}>
                <MaterialIcons name="check-circle" size={64} color={theme.success} />
              </View>
              <Text style={[styles.statusTitle, { color: theme.success }]}>Payment Successful!</Text>
              <Text style={[styles.statusDesc, { color: theme.textSecondary }]}>
                Your order has been confirmed
              </Text>
              <View style={[styles.orderNumberBox, { backgroundColor: `${theme.success}15`, borderColor: theme.success }]}>
                <Text style={[styles.orderLabel, { color: theme.textSecondary }]}>Order Number</Text>
                <Text style={[styles.orderNumber, { color: theme.success }]}>{order.order_number}</Text>
              </View>
            </>
          )}

          {paymentStatus === 'failed' && (
            <>
              <View style={[styles.errorIcon, { backgroundColor: `${theme.error}20` }]}>
                <MaterialIcons name="error" size={64} color={theme.error} />
              </View>
              <Text style={[styles.statusTitle, { color: theme.error }]}>Payment Failed</Text>
              <Text style={[styles.statusDesc, { color: theme.textSecondary }]}>
                Unfortunately, your payment could not be processed
              </Text>
            </>
          )}
        </View>

        {/* Order Summary */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Order Summary</Text>
          
          {order.order_items?.map((item: any, index: number) => (
            <View key={index} style={styles.orderItem}>
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

          {order.discount_amount > 0 && (
            <View style={styles.orderItem}>
              <Text style={[styles.labelText, { color: theme.text }]}>Subtotal</Text>
              <Text style={[styles.valueText, { color: theme.text }]}>
                ₹{(order.total_amount + order.discount_amount).toFixed(2)}
              </Text>
            </View>
          )}

          {order.discount_amount > 0 && (
            <>
              <View style={styles.orderItem}>
                <Text style={[styles.labelText, { color: theme.success }]}>
                  Discount ({order.coupon_code})
                </Text>
                <Text style={[styles.valueText, { color: theme.success }]}>
                  -₹{order.discount_amount.toFixed(2)}
                </Text>
              </View>
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
            </>
          )}

          <View style={styles.orderItem}>
            <Text style={[styles.totalLabel, { color: theme.text }]}>Total Amount</Text>
            <Text style={[styles.totalAmount, { color: theme.primary }]}>
              ₹{order.total_amount}
            </Text>
          </View>
        </View>

        {/* Payment Method */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Payment Method</Text>
          <View style={styles.paymentMethodBox}>
            <View style={[styles.methodIcon, { backgroundColor: `${theme.primary}15` }]}>
              <MaterialIcons 
                name={params.method === 'COD' ? 'local-shipping' : 'account-balance-wallet'} 
                size={24} 
                color={theme.primary} 
              />
            </View>
            <View>
              <Text style={[styles.methodTitle, { color: theme.text }]}>
                {params.method === 'COD' ? 'Cash on Delivery' : 'UPI Payment'}
              </Text>
              <Text style={[styles.methodDesc, { color: theme.textSecondary }]}>
                {params.method === 'COD' 
                  ? 'Pay when you receive your order'
                  : 'Pay via Google Pay, PhonePe, Paytm'
                }
              </Text>
            </View>
          </View>
        </View>

        {/* Shipping Address */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Delivery Address</Text>
          <View style={styles.addressBox}>
            <MaterialIcons name="location-on" size={20} color={theme.primary} />
            <View style={styles.addressText}>
              <Text style={[styles.addressName, { color: theme.text }]}>
                {order.shipping_address.fullName}
              </Text>
              <Text style={[styles.addressDetails, { color: theme.textSecondary }]}>
                {order.shipping_address.address}
              </Text>
              <Text style={[styles.addressDetails, { color: theme.textSecondary }]}>
                {order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.pincode}
              </Text>
              <Text style={[styles.addressDetails, { color: theme.textSecondary }]}>
                Phone: {order.shipping_address.phone}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        {paymentStatus === 'pending' && (
          <TouchableOpacity
            style={[styles.payButton, { backgroundColor: theme.primary }]}
            onPress={processPayment}
            disabled={processing}
          >
            <MaterialIcons name="lock" size={20} color="#FFFFFF" />
            <Text style={styles.payButtonText}>
              Pay ₹{params.amount} Securely
            </Text>
          </TouchableOpacity>
        )}

        {paymentStatus === 'success' && (
          <>
            <TouchableOpacity
              style={[styles.successButton, { backgroundColor: theme.primary }]}
              onPress={() => router.replace(`/orders/${params.orderId}`)}
            >
              <MaterialIcons name="visibility" size={20} color="#FFFFFF" />
              <Text style={styles.successButtonText}>Track Order</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryButton, { borderColor: theme.border }]}
              onPress={() => router.replace('/(tabs)/store')}
            >
              <Text style={[styles.secondaryButtonText, { color: theme.text }]}>
                Continue Shopping
              </Text>
            </TouchableOpacity>
          </>
        )}

        {paymentStatus === 'failed' && (
          <>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: theme.primary }]}
              onPress={() => {
                setPaymentStatus('pending');
                progress.setValue(0);
              }}
            >
              <MaterialIcons name="refresh" size={20} color="#FFFFFF" />
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryButton, { borderColor: theme.border }]}
              onPress={() => router.back()}
            >
              <Text style={[styles.secondaryButtonText, { color: theme.text }]}>
                Change Payment Method
              </Text>
            </TouchableOpacity>
          </>
        )}
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
  content: {
    padding: Spacing.md,
  },
  statusCard: {
    alignItems: 'center',
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  successIcon: {
    borderRadius: 100,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  errorIcon: {
    borderRadius: 100,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  statusDesc: {
    ...Typography.body,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  progressBar: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    marginTop: Spacing.md,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  orderNumberBox: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    alignItems: 'center',
    minWidth: 200,
  },
  orderLabel: {
    ...Typography.caption,
    marginBottom: 4,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
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
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  itemInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  itemName: {
    ...Typography.body,
    marginBottom: 2,
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
  labelText: {
    ...Typography.body,
  },
  valueText: {
    ...Typography.bodyBold,
  },
  totalLabel: {
    ...Typography.bodyBold,
    fontSize: 16,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '700',
  },
  paymentMethodBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodTitle: {
    ...Typography.bodyBold,
    marginBottom: 2,
  },
  methodDesc: {
    ...Typography.caption,
  },
  addressBox: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  addressText: {
    flex: 1,
  },
  addressName: {
    ...Typography.bodyBold,
    marginBottom: 4,
  },
  addressDetails: {
    ...Typography.small,
    marginBottom: 2,
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  successButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  successButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
