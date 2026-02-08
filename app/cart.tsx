import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
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

export default function CartScreen() {
  const theme = useTheme(useApp().isDarkMode);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

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

  const handleUpdateQuantity = async (cartItemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    setUpdating(cartItemId);
    try {
      const { error } = await storeService.updateCartQuantity(cartItemId, newQuantity);
      if (error) throw error;
      loadCart();
    } catch (error: any) {
      console.error('Error updating quantity:', error);
      Alert.alert('Error', error.message || 'Failed to update quantity');
    } finally {
      setUpdating(null);
    }
  };

  const handleRemoveItem = async (cartItemId: string, productName: string) => {
    Alert.alert(
      'Remove Item',
      `Remove ${productName} from cart?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setUpdating(cartItemId);
            try {
              const { error } = await storeService.removeFromCart(cartItemId);
              if (error) throw error;
              loadCart();
            } catch (error: any) {
              console.error('Error removing item:', error);
              Alert.alert('Error', error.message || 'Failed to remove item');
            } finally {
              setUpdating(null);
            }
          },
        },
      ]
    );
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => {
      return sum + (item.store_products.price * item.quantity);
    }, 0);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('Cart is Empty', 'Add some items to cart before checkout');
      return;
    }
    router.push('/checkout');
  };

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <LinearGradient
          colors={theme.gradient}
          style={[styles.header, { paddingTop: insets.top + Spacing.md }]}
        >
          <Text style={styles.headerTitle}>Shopping Cart</Text>
        </LinearGradient>
        <View style={styles.centerContainer}>
          <MaterialIcons name="shopping-cart" size={64} color={theme.textSecondary} />
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            Please login to view cart
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
          <Text style={styles.headerTitle}>Shopping Cart</Text>
          <View style={{ width: 24 }} />
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : cartItems.length === 0 ? (
        <View style={styles.centerContainer}>
          <MaterialIcons name="shopping-cart" size={64} color={theme.textSecondary} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>Your Cart is Empty</Text>
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            Add some items from the store
          </Text>
          <TouchableOpacity
            style={[styles.shopBtn, { backgroundColor: theme.primary }]}
            onPress={() => router.push('/(tabs)/store')}
          >
            <Text style={styles.shopBtnText}>Browse Store</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <View style={[styles.cartCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={styles.cartItemContent}>
                  <View style={styles.itemDetails}>
                    <Text style={[styles.itemTitle, { color: theme.text }]}>
                      {item.store_products.title}
                    </Text>
                    <Text style={[styles.itemPrice, { color: theme.primary }]}>
                      ₹{item.store_products.price} × {item.quantity}
                    </Text>
                    <Text style={[styles.itemTotal, { color: theme.text }]}>
                      Total: ₹{(item.store_products.price * item.quantity).toFixed(2)}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => handleRemoveItem(item.id, item.store_products.title)}
                    disabled={updating === item.id}
                  >
                    <MaterialIcons name="delete" size={20} color={theme.error} />
                  </TouchableOpacity>
                </View>

                <View style={styles.quantityContainer}>
                  <TouchableOpacity
                    style={[styles.quantityBtn, { borderColor: theme.border }]}
                    onPress={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1 || updating === item.id}
                  >
                    <MaterialIcons name="remove" size={20} color={theme.text} />
                  </TouchableOpacity>

                  <Text style={[styles.quantityText, { color: theme.text }]}>
                    {item.quantity}
                  </Text>

                  <TouchableOpacity
                    style={[styles.quantityBtn, { borderColor: theme.border }]}
                    onPress={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                    disabled={item.quantity >= item.store_products.stock_quantity || updating === item.id}
                  >
                    <MaterialIcons name="add" size={20} color={theme.text} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />

          <View style={[styles.footer, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
            <View style={styles.totalContainer}>
              <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>Total Amount</Text>
              <Text style={[styles.totalAmount, { color: theme.primary }]}>
                ₹{calculateTotal().toFixed(2)}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.checkoutBtn, { backgroundColor: theme.primary }]}
              onPress={handleCheckout}
            >
              <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
              <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
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
  shopBtn: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  shopBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    padding: Spacing.md,
  },
  cartCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  cartItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  itemDetails: {
    flex: 1,
  },
  itemTitle: {
    ...Typography.bodyBold,
    marginBottom: 4,
  },
  itemPrice: {
    ...Typography.body,
    marginBottom: 2,
  },
  itemTotal: {
    ...Typography.bodyBold,
    fontSize: 16,
  },
  removeBtn: {
    padding: Spacing.sm,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  quantityBtn: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    ...Typography.h3,
    minWidth: 40,
    textAlign: 'center',
  },
  footer: {
    padding: Spacing.md,
    borderTopWidth: 1,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  totalLabel: {
    ...Typography.body,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '700',
  },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  checkoutBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
