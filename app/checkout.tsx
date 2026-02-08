import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/template';
import { useApp } from '@/hooks/useApp';
import { useTheme, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { storeService, CartItem } from '@/services/storeService';
import { couponService, CouponValidation } from '@/services/couponService';

export default function CheckoutScreen() {
  const theme = useTheme(useApp().isDarkMode);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState<CouponValidation | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [address, setAddress] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  useEffect(() => {
    if (user) {
      loadCart();
    }
  }, [user]);

  const loadCart = async () => {
    if (!user) return;
    try {
      const { data, error } = await storeService.getCartItems(user.id);
      if (error) throw error;
      setCartItems(data || []);
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => {
      return sum + (item.store_products.price * item.quantity);
    }, 0);
  };

  const getFinalTotal = () => {
    if (couponApplied && couponApplied.valid) {
      return couponApplied.final_total || calculateTotal();
    }
    return calculateTotal();
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      Alert.alert('Error', 'Please enter a coupon code');
      return;
    }

    setValidatingCoupon(true);
    try {
      const cartTotal = calculateTotal();
      const validation = await couponService.validateCoupon(couponCode, cartTotal);

      if (validation.valid) {
        setCouponApplied(validation);
        Alert.alert('Coupon Applied!', `You saved ₹${validation.discount_amount?.toFixed(2)}`);
      } else {
        Alert.alert('Invalid Coupon', validation.error || 'This coupon cannot be applied');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to validate coupon');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponApplied(null);
    setCouponCode('');
  };

  const validateAddress = () => {
    if (!address.fullName.trim()) {
      Alert.alert('Error', 'Please enter full name');
      return false;
    }
    if (!address.phone.trim() || address.phone.length < 10) {
      Alert.alert('Error', 'Please enter valid phone number');
      return false;
    }
    if (!address.address.trim()) {
      Alert.alert('Error', 'Please enter address');
      return false;
    }
    if (!address.city.trim()) {
      Alert.alert('Error', 'Please enter city');
      return false;
    }
    if (!address.state.trim()) {
      Alert.alert('Error', 'Please enter state');
      return false;
    }
    
    // Validate PIN code: must be exactly 6 digits and only numbers
    const pincodeRegex = /^[0-9]{6}$/;
    if (!address.pincode.trim() || !pincodeRegex.test(address.pincode)) {
      Alert.alert('Error', 'Please enter valid 6-digit PIN code (only numbers)');
      return false;
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!user) return;
    
    if (cartItems.length === 0) {
      Alert.alert('Error', 'Cart is empty');
      return;
    }

    if (!validateAddress()) return;

    setPlacing(true);
    try {
      const { data: order, error } = await storeService.createOrder(
        user.id,
        address,
        paymentMethod
      );

      if (error) throw error;

      Alert.alert(
        'Order Placed Successfully!',
        `Your order #${order.order_number} has been placed.\n\nTotal: ₹${order.total_amount}`,
        [
          {
            text: 'View Order',
            onPress: () => router.replace(`/orders/${order.id}`),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error placing order:', error);
      Alert.alert('Error', error.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  if (!user || loading) {
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
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Checkout</Text>
          <View style={{ width: 24 }} />
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Order Summary */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Order Summary</Text>
          {cartItems.map((item) => (
            <View key={item.id} style={styles.orderItem}>
              <Text style={[styles.orderItemName, { color: theme.text }]}>
                {item.store_products.title} × {item.quantity}
              </Text>
              <Text style={[styles.orderItemPrice, { color: theme.primary }]}>
                ₹{(item.store_products.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
          <View style={styles.orderItem}>
            <Text style={[styles.totalLabel, { color: theme.text }]}>Subtotal</Text>
            <Text style={[styles.orderItemPrice, { color: theme.text }]}>
              ₹{calculateTotal().toFixed(2)}
            </Text>
          </View>
          {couponApplied && couponApplied.valid && (
            <View style={styles.orderItem}>
              <Text style={[styles.discountLabel, { color: theme.success }]}>Discount ({couponApplied.code})</Text>
              <Text style={[styles.discountAmount, { color: theme.success }]}>
                -₹{couponApplied.discount_amount?.toFixed(2)}
              </Text>
            </View>
          )}
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <View style={styles.orderItem}>
            <Text style={[styles.totalLabel, { color: theme.text }]}>Total Amount</Text>
            <Text style={[styles.totalAmount, { color: theme.primary }]}>
              ₹{getFinalTotal().toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Coupon Code */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Apply Coupon</Text>

          {couponApplied && couponApplied.valid ? (
            <View style={[styles.couponApplied, { backgroundColor: `${theme.success}15`, borderColor: theme.success }]}>
              <View>
                <Text style={[styles.couponCodeText, { color: theme.success }]}>{couponApplied.code}</Text>
                <Text style={[styles.couponSavingText, { color: theme.success }]}>
                  You saved ₹{couponApplied.discount_amount?.toFixed(2)}!
                </Text>
              </View>
              <TouchableOpacity onPress={handleRemoveCoupon}>
                <MaterialIcons name="close" size={24} color={theme.error} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.couponInputRow}>
              <TextInput
                style={[styles.input, styles.couponInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                placeholder="Enter coupon code"
                placeholderTextColor={theme.textSecondary}
                value={couponCode}
                onChangeText={setCouponCode}
                autoCapitalize="characters"
                editable={!validatingCoupon}
              />
              <TouchableOpacity
                style={[styles.applyBtn, { backgroundColor: theme.primary, opacity: validatingCoupon ? 0.6 : 1 }]}
                onPress={handleApplyCoupon}
                disabled={validatingCoupon}
              >
                {validatingCoupon ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.applyBtnText}>Apply</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Shipping Address */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Shipping Address</Text>

          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
            placeholder="Full Name *"
            placeholderTextColor={theme.textSecondary}
            value={address.fullName}
            onChangeText={(text) => setAddress({ ...address, fullName: text })}
          />

          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
            placeholder="Phone Number *"
            placeholderTextColor={theme.textSecondary}
            value={address.phone}
            onChangeText={(text) => setAddress({ ...address, phone: text })}
            keyboardType="phone-pad"
            maxLength={10}
          />

          <TextInput
            style={[styles.input, styles.textArea, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
            placeholder="Address *"
            placeholderTextColor={theme.textSecondary}
            value={address.address}
            onChangeText={(text) => setAddress({ ...address, address: text })}
            multiline
            numberOfLines={3}
          />

          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.halfInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
              placeholder="City *"
              placeholderTextColor={theme.textSecondary}
              value={address.city}
              onChangeText={(text) => setAddress({ ...address, city: text })}
            />
            <TextInput
              style={[styles.input, styles.halfInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
              placeholder="State *"
              placeholderTextColor={theme.textSecondary}
              value={address.state}
              onChangeText={(text) => setAddress({ ...address, state: text })}
            />
          </View>

          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
            placeholder="PIN Code (6 digits) *"
            placeholderTextColor={theme.textSecondary}
            value={address.pincode}
            onChangeText={(text) => setAddress({ ...address, pincode: text.replace(/[^0-9]/g, '') })}
            keyboardType="number-pad"
            maxLength={6}
          />
        </View>

        {/* Payment Method */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Payment Method</Text>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              { borderColor: theme.border },
              paymentMethod === 'COD' && { borderColor: theme.primary, backgroundColor: `${theme.primary}15` },
            ]}
            onPress={() => setPaymentMethod('COD')}
          >
            <MaterialIcons
              name={paymentMethod === 'COD' ? 'radio-button-checked' : 'radio-button-unchecked'}
              size={24}
              color={theme.primary}
            />
            <View style={styles.paymentInfo}>
              <Text style={[styles.paymentTitle, { color: theme.text }]}>Cash on Delivery</Text>
              <Text style={[styles.paymentDesc, { color: theme.textSecondary }]}>
                Pay when you receive your order
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              { borderColor: theme.border },
              paymentMethod === 'UPI' && { borderColor: theme.primary, backgroundColor: `${theme.primary}15` },
            ]}
            onPress={() => setPaymentMethod('UPI')}
          >
            <MaterialIcons
              name={paymentMethod === 'UPI' ? 'radio-button-checked' : 'radio-button-unchecked'}
              size={24}
              color={theme.primary}
            />
            <View style={styles.paymentInfo}>
              <Text style={[styles.paymentTitle, { color: theme.text }]}>UPI Payment</Text>
              <Text style={[styles.paymentDesc, { color: theme.textSecondary }]}>
                Pay via Google Pay, PhonePe, Paytm
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.placeOrderBtn, { backgroundColor: theme.primary, opacity: placing ? 0.6 : 1 }]}
          onPress={handlePlaceOrder}
          disabled={placing}
        >
          {placing ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.placeOrderText}>Place Order</Text>
              <Text style={styles.placeOrderAmount}>₹{getFinalTotal().toFixed(2)}</Text>
            </>
          )}
        </TouchableOpacity>
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
  orderItemName: {
    ...Typography.body,
    flex: 1,
  },
  orderItemPrice: {
    ...Typography.bodyBold,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.md,
  },
  totalLabel: {
    ...Typography.bodyBold,
    fontSize: 16,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '700',
  },
  discountLabel: {
    ...Typography.body,
  },
  discountAmount: {
    ...Typography.bodyBold,
  },
  couponInputRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  couponInput: {
    flex: 1,
    marginBottom: 0,
  },
  applyBtn: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    minWidth: 80,
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  couponApplied: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
  },
  couponCodeText: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  couponSavingText: {
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    ...Typography.body,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderWidth: 2,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  paymentInfo: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  paymentTitle: {
    ...Typography.bodyBold,
    marginBottom: 2,
  },
  paymentDesc: {
    ...Typography.caption,
  },
  placeOrderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  placeOrderText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  placeOrderAmount: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
});
