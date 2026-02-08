import { getSupabaseClient } from '@/template';

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'flat';
  discount_value: number;
  min_purchase_amount: number;
  max_discount_amount: number | null;
  usage_limit: number | null;
  used_count: number;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

export interface CouponValidation {
  valid: boolean;
  error?: string;
  code?: string;
  discount_type?: 'percentage' | 'flat';
  discount_value?: number;
  discount_amount?: number;
  final_total?: number;
  original_total?: number;
}

class CouponService {
  /**
   * Validate coupon code and calculate discount
   */
  async validateCoupon(code: string, cartTotal: number): Promise<CouponValidation> {
    const supabase = getSupabaseClient();
    
    try {
      const { data, error } = await supabase.rpc('validate_coupon', {
        p_code: code.toUpperCase(),
        p_cart_total: cartTotal,
      });

      if (error) throw error;
      return data as CouponValidation;
    } catch (error) {
      console.error('Error validating coupon:', error);
      return { valid: false, error: 'Failed to validate coupon' };
    }
  }

  /**
   * Get all coupons (admin only)
   */
  async getAllCoupons() {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    return { data: data as Coupon[] | null, error };
  }

  /**
   * Create new coupon (admin only)
   */
  async createCoupon(coupon: Partial<Coupon>) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('coupons')
      .insert({
        ...coupon,
        code: coupon.code?.toUpperCase(),
      })
      .select()
      .single();

    return { data: data as Coupon | null, error };
  }

  /**
   * Update coupon (admin only)
   */
  async updateCoupon(id: string, updates: Partial<Coupon>) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('coupons')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    return { data: data as Coupon | null, error };
  }

  /**
   * Delete coupon (admin only)
   */
  async deleteCoupon(id: string) {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('id', id);

    return { error };
  }

  /**
   * Increment coupon usage count
   */
  async incrementUsage(code: string) {
    const supabase = getSupabaseClient();
    const { error } = await supabase.rpc('sql', {
      query: `
        update coupons 
        set used_count = used_count + 1 
        where code = '${code.toUpperCase()}'
      `,
    });

    return { error };
  }
}

export const couponService = new CouponService();
