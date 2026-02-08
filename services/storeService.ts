import { getSupabaseClient } from '@/template';

export interface StoreProduct {
  id: string;
  title: string;
  description: string | null;
  category: 'book' | 'notes' | 'stationary';
  price: number;
  original_price: number | null;
  image_url: string | null;
  file_url: string | null;
  stock_quantity: number;
  is_available: boolean;
  approval_status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  added_at: string;
  store_products: StoreProduct;
}

export interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  status: 'placed' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'success' | 'failed';
  payment_method: string | null;
  shipping_address: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  created_at: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price_at_purchase: number;
  store_products: StoreProduct;
}

export interface OrderStatusHistory {
  id: string;
  status: string;
  notes: string | null;
  created_at: string;
}

class StoreService {
  /**
   * Get all approved and available products
   */
  async getProducts(category?: string) {
    const supabase = getSupabaseClient();
    let query = supabase
      .from('store_products')
      .select('*')
      .eq('approval_status', 'approved')
      .eq('is_available', true)
      .order('created_at', { ascending: false });

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    return { data: data as StoreProduct[] | null, error };
  }

  /**
   * Add item to cart
   */
  async addToCart(userId: string, productId: string, quantity: number = 1) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('shopping_cart')
      .upsert({
        user_id: userId,
        product_id: productId,
        quantity,
      }, {
        onConflict: 'user_id,product_id',
      })
      .select()
      .single();

    return { data, error };
  }

  /**
   * Get user's cart items
   */
  async getCartItems(userId: string) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('shopping_cart')
      .select(`
        *,
        store_products (*)
      `)
      .eq('user_id', userId)
      .order('added_at', { ascending: false });

    return { data: data as CartItem[] | null, error };
  }

  /**
   * Update cart item quantity
   */
  async updateCartQuantity(cartItemId: string, quantity: number) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('shopping_cart')
      .update({ quantity })
      .eq('id', cartItemId)
      .select()
      .single();

    return { data, error };
  }

  /**
   * Remove item from cart
   */
  async removeFromCart(cartItemId: string) {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('shopping_cart')
      .delete()
      .eq('id', cartItemId);

    return { error };
  }

  /**
   * Clear entire cart
   */
  async clearCart(userId: string) {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('shopping_cart')
      .delete()
      .eq('user_id', userId);

    return { error };
  }

  /**
   * Create order from cart
   */
  async createOrder(
    userId: string,
    shippingAddress: Order['shipping_address'],
    paymentMethod: string,
    couponCode?: string,
    discountAmount?: number
  ) {
    const supabase = getSupabaseClient();

    // Get cart items
    const { data: cartItems, error: cartError } = await this.getCartItems(userId);
    if (cartError || !cartItems || cartItems.length === 0) {
      return { data: null, error: cartError || new Error('Cart is empty') };
    }

    // Calculate total
    const totalAmount = cartItems.reduce((sum, item) => {
      return sum + (item.store_products.price * item.quantity);
    }, 0);

    // Generate order number
    const { data: orderNumber, error: orderNumError } = await supabase.rpc('generate_order_number');
    if (orderNumError) {
      return { data: null, error: orderNumError };
    }

    // Calculate final total after discount
    const finalTotal = couponCode && discountAmount 
      ? totalAmount - discountAmount 
      : totalAmount;

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        order_number: orderNumber,
        total_amount: finalTotal,
        status: 'placed',
        payment_status: 'pending',
        payment_method: paymentMethod,
        shipping_address: shippingAddress,
        coupon_code: couponCode || null,
        discount_amount: discountAmount || 0,
      })
      .select()
      .single();

    if (orderError || !order) {
      return { data: null, error: orderError };
    }

    // Create order items
    const orderItems = cartItems.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price_at_purchase: item.store_products.price,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      // Rollback: delete the order
      await supabase.from('orders').delete().eq('id', order.id);
      return { data: null, error: itemsError };
    }

    // Create initial status history
    await supabase.from('order_status_history').insert({
      order_id: order.id,
      status: 'placed',
      notes: 'Order placed successfully',
    });

    // Clear cart
    await this.clearCart(userId);

    return { data: order, error: null };
  }

  /**
   * Get user's orders
   */
  async getUserOrders(userId: string) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          store_products (*)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    return { data: data as Order[] | null, error };
  }

  /**
   * Get order details by ID
   */
  async getOrderDetails(orderId: string) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          store_products (*)
        )
      `)
      .eq('id', orderId)
      .single();

    return { data: data as Order | null, error };
  }

  /**
   * Get order status history
   */
  async getOrderStatusHistory(orderId: string) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('order_status_history')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });

    return { data: data as OrderStatusHistory[] | null, error };
  }
}

export const storeService = new StoreService();
