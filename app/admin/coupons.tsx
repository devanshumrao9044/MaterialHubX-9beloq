import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/hooks/useApp';
import { useTheme, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { couponService, Coupon } from '@/services/couponService';

export default function AdminCouponsScreen() {
  const theme = useTheme(useApp().isDarkMode);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage' as 'percentage' | 'flat',
    discount_value: '',
    min_purchase_amount: '',
    max_discount_amount: '',
    usage_limit: '',
    expires_at: '',
  });

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      const { data, error } = await couponService.getAllCoupons();
      if (error) throw error;
      setCoupons(data || []);
    } catch (error) {
      console.error('Error loading coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCoupon = async () => {
    if (!formData.code.trim()) {
      Alert.alert('Error', 'Coupon code is required');
      return;
    }
    if (!formData.discount_value) {
      Alert.alert('Error', 'Discount value is required');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await couponService.createCoupon({
        code: formData.code.toUpperCase().trim(),
        discount_type: formData.discount_type,
        discount_value: parseFloat(formData.discount_value),
        min_purchase_amount: formData.min_purchase_amount ? parseFloat(formData.min_purchase_amount) : 0,
        max_discount_amount: formData.max_discount_amount ? parseFloat(formData.max_discount_amount) : null,
        usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
        expires_at: formData.expires_at || null,
        is_active: true,
      });

      if (error) throw error;

      Alert.alert('Success!', 'Coupon created successfully');
      setModalVisible(false);
      resetForm();
      loadCoupons();
    } catch (error: any) {
      console.error('Error creating coupon:', error);
      Alert.alert('Error', error.message || 'Failed to create coupon');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await couponService.updateCoupon(id, {
        is_active: !currentStatus,
      });

      if (error) throw error;
      loadCoupons();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update coupon');
    }
  };

  const handleDeleteCoupon = async (id: string, code: string) => {
    Alert.alert(
      'Delete Coupon',
      `Are you sure you want to delete coupon "${code}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await couponService.deleteCoupon(id);
              if (error) throw error;
              loadCoupons();
              Alert.alert('Success', 'Coupon deleted');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete coupon');
            }
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setFormData({
      code: '',
      discount_type: 'percentage',
      discount_value: '',
      min_purchase_amount: '',
      max_discount_amount: '',
      usage_limit: '',
      expires_at: '',
    });
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

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
          <Text style={styles.headerTitle}>Coupon Management</Text>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <MaterialIcons name="add-circle" size={28} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <FlatList
          data={coupons}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="local-offer" size={64} color={theme.textSecondary} />
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                No coupons created yet
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={[styles.couponCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.couponHeader}>
                <View>
                  <Text style={[styles.couponCode, { color: theme.primary }]}>
                    {item.code}
                  </Text>
                  <Text style={[styles.couponDesc, { color: theme.text }]}>
                    {item.discount_type === 'percentage' 
                      ? `${item.discount_value}% off`
                      : `₹${item.discount_value} off`
                    }
                  </Text>
                  {item.min_purchase_amount > 0 && (
                    <Text style={[styles.couponMeta, { color: theme.textSecondary }]}>
                      Min purchase: ₹{item.min_purchase_amount}
                    </Text>
                  )}
                  {item.usage_limit && (
                    <Text style={[styles.couponMeta, { color: theme.textSecondary }]}>
                      Used: {item.used_count}/{item.usage_limit}
                    </Text>
                  )}
                </View>

                <View style={styles.statusBadges}>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: item.is_active ? `${theme.success}15` : `${theme.error}15` }
                  ]}>
                    <Text style={[
                      styles.statusText,
                      { color: item.is_active ? theme.success : theme.error }
                    ]}>
                      {item.is_active ? 'Active' : 'Disabled'}
                    </Text>
                  </View>
                  {isExpired(item.expires_at) && (
                    <View style={[styles.statusBadge, { backgroundColor: `${theme.error}15` }]}>
                      <Text style={[styles.statusText, { color: theme.error }]}>
                        Expired
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: item.is_active ? theme.warning : theme.success }]}
                  onPress={() => handleToggleStatus(item.id, item.is_active)}
                >
                  <MaterialIcons 
                    name={item.is_active ? 'pause' : 'play-arrow'} 
                    size={16} 
                    color="#FFFFFF" 
                  />
                  <Text style={styles.actionBtnText}>
                    {item.is_active ? 'Disable' : 'Enable'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: theme.error }]}
                  onPress={() => handleDeleteCoupon(item.id, item.code)}
                >
                  <MaterialIcons name="delete" size={16} color="#FFFFFF" />
                  <Text style={styles.actionBtnText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {/* Create Coupon Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Create Coupon</Text>

              <TextInput
                style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                placeholder="Coupon Code (e.g., SAVE20) *"
                placeholderTextColor={theme.textSecondary}
                value={formData.code}
                onChangeText={(text) => setFormData({ ...formData, code: text.toUpperCase() })}
                autoCapitalize="characters"
                editable={!submitting}
              />

              <Text style={[styles.label, { color: theme.text }]}>Discount Type *</Text>
              <View style={styles.typeButtons}>
                <TouchableOpacity
                  style={[
                    styles.typeBtn,
                    { borderColor: theme.border, backgroundColor: theme.background },
                    formData.discount_type === 'percentage' && { backgroundColor: theme.primary, borderColor: theme.primary },
                  ]}
                  onPress={() => setFormData({ ...formData, discount_type: 'percentage' })}
                  disabled={submitting}
                >
                  <Text
                    style={[
                      styles.typeBtnText,
                      { color: theme.text },
                      formData.discount_type === 'percentage' && { color: '#FFFFFF' },
                    ]}
                  >
                    Percentage (%)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.typeBtn,
                    { borderColor: theme.border, backgroundColor: theme.background },
                    formData.discount_type === 'flat' && { backgroundColor: theme.primary, borderColor: theme.primary },
                  ]}
                  onPress={() => setFormData({ ...formData, discount_type: 'flat' })}
                  disabled={submitting}
                >
                  <Text
                    style={[
                      styles.typeBtnText,
                      { color: theme.text },
                      formData.discount_type === 'flat' && { color: '#FFFFFF' },
                    ]}
                  >
                    Flat Amount (₹)
                  </Text>
                </TouchableOpacity>
              </View>

              <TextInput
                style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                placeholder={formData.discount_type === 'percentage' ? 'Discount (e.g., 20)' : 'Amount (e.g., 100)'}
                placeholderTextColor={theme.textSecondary}
                value={formData.discount_value}
                onChangeText={(text) => setFormData({ ...formData, discount_value: text })}
                keyboardType="decimal-pad"
                editable={!submitting}
              />

              <TextInput
                style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                placeholder="Minimum Purchase Amount (optional)"
                placeholderTextColor={theme.textSecondary}
                value={formData.min_purchase_amount}
                onChangeText={(text) => setFormData({ ...formData, min_purchase_amount: text })}
                keyboardType="decimal-pad"
                editable={!submitting}
              />

              {formData.discount_type === 'percentage' && (
                <TextInput
                  style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                  placeholder="Max Discount Amount (optional)"
                  placeholderTextColor={theme.textSecondary}
                  value={formData.max_discount_amount}
                  onChangeText={(text) => setFormData({ ...formData, max_discount_amount: text })}
                  keyboardType="decimal-pad"
                  editable={!submitting}
                />
              )}

              <TextInput
                style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                placeholder="Usage Limit (optional)"
                placeholderTextColor={theme.textSecondary}
                value={formData.usage_limit}
                onChangeText={(text) => setFormData({ ...formData, usage_limit: text })}
                keyboardType="number-pad"
                editable={!submitting}
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: theme.border }]}
                  onPress={() => {
                    setModalVisible(false);
                    resetForm();
                  }}
                  disabled={submitting}
                >
                  <Text style={[styles.modalBtnText, { color: theme.text }]}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: theme.primary, opacity: submitting ? 0.6 : 1 }]}
                  onPress={handleCreateCoupon}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={[styles.modalBtnText, { color: '#FFFFFF' }]}>Create</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
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
  },
  listContent: {
    padding: Spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyText: {
    ...Typography.body,
    marginTop: Spacing.md,
  },
  couponCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  couponHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  couponCode: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  couponDesc: {
    ...Typography.bodyBold,
    marginBottom: 4,
  },
  couponMeta: {
    ...Typography.caption,
    marginBottom: 2,
  },
  statusBadges: {
    gap: Spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    ...Typography.caption,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
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
    maxHeight: '90%',
  },
  modalTitle: {
    ...Typography.h3,
    marginBottom: Spacing.md,
  },
  label: {
    ...Typography.bodyBold,
    marginBottom: Spacing.sm,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    alignItems: 'center',
  },
  typeBtnText: {
    ...Typography.caption,
    fontWeight: '600',
  },
  input: {
    ...Typography.body,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  modalBtn: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
  },
  modalBtnText: {
    ...Typography.bodyBold,
  },
});
