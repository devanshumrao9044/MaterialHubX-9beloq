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
import { storeService, StoreProduct } from '@/services/storeService';

export default function StoreScreen() {
  const { isDarkMode } = useApp();
  const theme = useTheme(isDarkMode);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState(0);

  const categories = [
    { id: 'all', name: 'All', icon: 'apps' },
    { id: 'book', name: 'Books', icon: 'book' },
    { id: 'notes', name: 'Notes', icon: 'description' },
    { id: 'stationary', name: 'Stationary', icon: 'edit' },
  ];

  useEffect(() => {
    loadProducts();
    if (user) {
      loadCartCount();
    }
  }, [selectedCategory, user]);

  const loadProducts = async () => {
    try {
      const { data, error } = await storeService.getProducts(
        selectedCategory === 'all' ? undefined : selectedCategory
      );
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCartCount = async () => {
    if (!user) return;
    try {
      const { data } = await storeService.getCartItems(user.id);
      setCartCount(data?.length || 0);
    } catch (error) {
      console.error('Error loading cart count:', error);
    }
  };

  const handleAddToCart = async (product: StoreProduct) => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to add items to cart', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Login', onPress: () => router.push('/login') },
      ]);
      return;
    }

    if (product.stock_quantity <= 0) {
      Alert.alert('Out of Stock', 'This item is currently unavailable');
      return;
    }

    setAddingToCart(product.id);
    try {
      const { error } = await storeService.addToCart(user.id, product.id, 1);
      if (error) throw error;

      Alert.alert('Added to Cart!', `${product.title} has been added to your cart`);
      loadCartCount();
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', error.message || 'Failed to add item to cart');
    } finally {
      setAddingToCart(null);
    }
  };

  const handleBuyNow = async (product: StoreProduct) => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to purchase');
      return;
    }

    // Add to cart and navigate to checkout
    await handleAddToCart(product);
    router.push('/cart');
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'book': return '#8B5CF6';
      case 'notes': return '#4CAF50';
      case 'stationary': return '#FF9800';
      default: return theme.primary;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <LinearGradient
        colors={theme.gradient}
        style={[styles.header, { paddingTop: insets.top + Spacing.md }]}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Material Store</Text>
            <Text style={styles.headerSubtitle}>Books, Notes & Stationary</Text>
          </View>
          <TouchableOpacity style={styles.cartBtn} onPress={() => router.push('/cart')}>
            <MaterialIcons name="shopping-cart" size={24} color="#FFFFFF" />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.categoryBar}>
          <FlatList
            horizontal
            data={categories}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.categoryChip,
                  selectedCategory === item.id && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory(item.id)}
              >
                <MaterialIcons
                  name={item.icon as any}
                  size={18}
                  color={selectedCategory === item.id ? '#6C63FF' : '#FFFFFF'}
                />
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedCategory === item.id && styles.categoryChipTextActive,
                  ]}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          numColumns={2}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="shopping-bag" size={64} color={theme.textSecondary} />
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                No products available in this category
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.itemCard, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => router.push(`/product/${item.id}`)}
              activeOpacity={0.9}
            >
              <View style={[styles.itemIcon, { backgroundColor: `${getCategoryColor(item.category)}15` }]}>
                <MaterialIcons
                  name={item.category === 'book' ? 'book' : item.category === 'notes' ? 'description' : 'edit'}
                  size={40}
                  color={getCategoryColor(item.category)}
                />
              </View>

              <View style={styles.itemInfo}>
                <Text style={[styles.itemName, { color: theme.text }]} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={[styles.itemDesc, { color: theme.textSecondary }]} numberOfLines={2}>
                  {item.description || 'Quality educational material'}
                </Text>

                <View style={styles.priceContainer}>
                  <Text style={[styles.itemPrice, { color: theme.primary }]}>
                    ₹{item.price}
                  </Text>
                  {item.original_price && item.original_price > item.price && (
                    <Text style={[styles.originalPrice, { color: theme.textSecondary }]}>
                      ₹{item.original_price}
                    </Text>
                  )}
                </View>

                <Text style={[styles.stockText, { color: theme.textSecondary }]}>
                  Stock: {item.stock_quantity} available
                </Text>
              </View>

              <View style={styles.itemActions}>
                <TouchableOpacity
                  style={[styles.addCartBtn, { backgroundColor: theme.primary, opacity: addingToCart === item.id ? 0.6 : 1 }]}
                  onPress={() => handleAddToCart(item)}
                  disabled={addingToCart === item.id || item.stock_quantity <= 0}
                >
                  {addingToCart === item.id ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <MaterialIcons name="add-shopping-cart" size={16} color="#FFFFFF" />
                      <Text style={styles.btnText}>Add</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.buyNowBtn, { backgroundColor: theme.success }]}
                  onPress={() => handleBuyNow(item)}
                  disabled={item.stock_quantity <= 0}
                >
                  <Text style={styles.btnText}>Buy</Text>
                </TouchableOpacity>
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
    paddingBottom: Spacing.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  cartBtn: {
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF5252',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  categoryBar: {
    marginTop: Spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginRight: Spacing.sm,
    gap: 4,
  },
  categoryChipActive: {
    backgroundColor: '#FFFFFF',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  categoryChipTextActive: {
    color: '#6C63FF',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: Spacing.md,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
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
  itemCard: {
    width: '48%',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  itemIcon: {
    width: '100%',
    height: 100,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  itemInfo: {
    marginBottom: Spacing.sm,
  },
  itemName: {
    ...Typography.bodyBold,
    marginBottom: 4,
    minHeight: 36,
  },
  itemDesc: {
    ...Typography.small,
    marginBottom: Spacing.xs,
    lineHeight: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: 2,
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: '700',
  },
  originalPrice: {
    fontSize: 14,
    textDecorationLine: 'line-through',
  },
  stockText: {
    ...Typography.caption,
  },
  itemActions: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  addCartBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  buyNowBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
