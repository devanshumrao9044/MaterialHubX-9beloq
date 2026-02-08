import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/template';
import { useApp } from '@/hooks/useApp';
import { useTheme, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { getSupabaseClient } from '@/template';
import { storeService, StoreProduct } from '@/services/storeService';

export default function ProductDetailScreen() {
  const theme = useTheme(useApp().isDarkMode);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const [product, setProduct] = useState<StoreProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]);

  const loadProduct = async () => {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('store_products')
        .select('*')
        .eq('id', id)
        .eq('approval_status', 'approved')
        .eq('is_available', true)
        .single();

      if (error) throw error;
      setProduct(data);
    } catch (error) {
      console.error('Error loading product:', error);
      Alert.alert('Error', 'Product not found');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to add items to cart', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Login', onPress: () => router.push('/login') },
      ]);
      return;
    }

    if (!product || product.stock_quantity <= 0) {
      Alert.alert('Out of Stock', 'This item is currently unavailable');
      return;
    }

    setAdding(true);
    try {
      const { error } = await storeService.addToCart(user.id, product.id, 1);
      if (error) throw error;

      Alert.alert('Added to Cart!', `${product.title} has been added to your cart`, [
        { text: 'Continue Shopping', style: 'cancel' },
        { text: 'View Cart', onPress: () => router.push('/cart') },
      ]);
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', error.message || 'Failed to add item to cart');
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to purchase');
      return;
    }

    await handleAddToCart();
    if (!adding) {
      router.push('/cart');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!product) {
    return null;
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'book': return '#8B5CF6';
      case 'notes': return '#4CAF50';
      case 'stationary': return '#FF9800';
      default: return theme.primary;
    }
  };

  const discountPercentage = product.original_price && product.original_price > product.price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

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
          <Text style={styles.headerTitle}>Product Details</Text>
          <TouchableOpacity onPress={() => router.push('/cart')}>
            <MaterialIcons name="shopping-cart" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Product Image */}
        <View style={[styles.imageContainer, { backgroundColor: `${getCategoryColor(product.category)}15` }]}>
          {product.image_url ? (
            <Image
              source={{ uri: product.image_url }}
              style={styles.productImage}
              resizeMode="contain"
            />
          ) : (
            <MaterialIcons
              name={product.category === 'book' ? 'book' : product.category === 'notes' ? 'description' : 'edit'}
              size={120}
              color={getCategoryColor(product.category)}
            />
          )}
        </View>

        {/* Product Info */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <View style={[styles.categoryBadge, { backgroundColor: `${getCategoryColor(product.category)}15` }]}>
            <Text style={[styles.categoryText, { color: getCategoryColor(product.category) }]}>
              {product.category}
            </Text>
          </View>

          <Text style={[styles.productTitle, { color: theme.text }]}>
            {product.title}
          </Text>

          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: theme.primary }]}>
              ₹{product.price}
            </Text>
            {product.original_price && product.original_price > product.price && (
              <>
                <Text style={[styles.originalPrice, { color: theme.textSecondary }]}>
                  ₹{product.original_price}
                </Text>
                <View style={[styles.discountBadge, { backgroundColor: theme.success }]}>
                  <Text style={styles.discountText}>{discountPercentage}% OFF</Text>
                </View>
              </>
            )}
          </View>

          <View style={styles.stockRow}>
            <MaterialIcons 
              name={product.stock_quantity > 0 ? 'check-circle' : 'cancel'} 
              size={20} 
              color={product.stock_quantity > 0 ? theme.success : theme.error} 
            />
            <Text style={[styles.stockText, { color: product.stock_quantity > 0 ? theme.success : theme.error }]}>
              {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock'}
            </Text>
          </View>

          {product.description && (
            <>
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Description</Text>
              <Text style={[styles.description, { color: theme.textSecondary }]}>
                {product.description}
              </Text>
            </>
          )}
        </View>

        {/* Features */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Features</Text>
          <View style={styles.featureRow}>
            <MaterialIcons name="verified" size={20} color={theme.success} />
            <Text style={[styles.featureText, { color: theme.text }]}>Original & Authentic</Text>
          </View>
          <View style={styles.featureRow}>
            <MaterialIcons name="local-shipping" size={20} color={theme.primary} />
            <Text style={[styles.featureText, { color: theme.text }]}>Fast Delivery</Text>
          </View>
          <View style={styles.featureRow}>
            <MaterialIcons name="security" size={20} color={theme.success} />
            <Text style={[styles.featureText, { color: theme.text }]}>Secure Payment</Text>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={[styles.footer, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
        <TouchableOpacity
          style={[styles.addCartBtn, { backgroundColor: theme.background, borderColor: theme.primary }]}
          onPress={handleAddToCart}
          disabled={adding || product.stock_quantity <= 0}
        >
          {adding ? (
            <ActivityIndicator size="small" color={theme.primary} />
          ) : (
            <>
              <MaterialIcons name="add-shopping-cart" size={20} color={theme.primary} />
              <Text style={[styles.addCartText, { color: theme.primary }]}>Add to Cart</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.buyNowBtn, { backgroundColor: theme.primary }]}
          onPress={handleBuyNow}
          disabled={adding || product.stock_quantity <= 0}
        >
          {adding ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <MaterialIcons name="flash-on" size={20} color="#FFFFFF" />
              <Text style={styles.buyNowText}>Buy Now</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
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
  imageContainer: {
    height: 300,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  productImage: {
    width: '100%',
    height: '100%',
    borderRadius: BorderRadius.lg,
  },
  section: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
  },
  categoryText: {
    ...Typography.caption,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  productTitle: {
    ...Typography.h2,
    marginBottom: Spacing.md,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
  },
  originalPrice: {
    fontSize: 18,
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  stockText: {
    ...Typography.body,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h3,
    marginBottom: Spacing.md,
  },
  description: {
    ...Typography.body,
    lineHeight: 24,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  featureText: {
    ...Typography.body,
  },
  footer: {
    flexDirection: 'row',
    padding: Spacing.md,
    borderTopWidth: 1,
    gap: Spacing.md,
  },
  addCartBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    gap: Spacing.xs,
  },
  addCartText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buyNowBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  buyNowText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
