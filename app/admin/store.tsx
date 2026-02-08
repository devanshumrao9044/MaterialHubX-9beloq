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
  Image,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { useApp } from '@/hooks/useApp';
import { useTheme, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { getSupabaseClient } from '@/template';

interface StoreProduct {
  id: string;
  title: string;
  description: string | null;
  category: string;
  price: number;
  original_price: number | null;
  image_url: string | null;
  stock_quantity: number;
  is_available: boolean;
  approval_status: string;
  created_at: string;
}

export default function AdminStoreScreen() {
  const { isDarkMode } = useApp();
  const theme = useTheme(isDarkMode);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [uploadProgress, setUploadProgress] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'book' as 'book' | 'notes' | 'stationary',
    price: '',
    original_price: '',
    stock_quantity: '',
  });

  useEffect(() => {
    loadProducts();
  }, [selectedFilter]);

  const loadProducts = async () => {
    try {
      const supabase = getSupabaseClient();
      let query = supabase.from('store_products').select('*').order('created_at', { ascending: false });
      
      if (selectedFilter !== 'all') {
        query = query.eq('approval_status', selectedFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setSelectedImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!selectedImage) return null;

    try {
      setUploadProgress('Uploading image...');
      const supabase = getSupabaseClient();

      // Read image file
      let imageData: Uint8Array;
      
      if (Platform.OS === 'web') {
        const response = await fetch(selectedImage.uri);
        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();
        imageData = new Uint8Array(arrayBuffer);
      } else {
        const base64 = await FileSystem.readAsStringAsync(selectedImage.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        const binaryString = atob(base64);
        imageData = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          imageData[i] = binaryString.charCodeAt(i);
        }
      }

      // Generate filename
      const timestamp = Date.now();
      const sanitizedTitle = formData.title.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
      const fileName = `${timestamp}_${sanitizedTitle}.jpg`;
      const filePath = `products/${formData.category}/${fileName}`;

      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('study-materials')
        .upload(filePath, imageData, {
          contentType: 'image/jpeg',
          upsert: false,
        });

      if (uploadError) {
        console.error('Image upload error:', uploadError);
        throw new Error(`Image upload failed: ${uploadError.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('study-materials')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error: any) {
      console.error('Image upload error:', error);
      throw error;
    }
  };

  const handleCreateProduct = async () => {
    // Validate all mandatory fields
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Product name is required');
      return;
    }
    if (!formData.description.trim()) {
      Alert.alert('Error', 'Description is required');
      return;
    }
    if (!formData.price) {
      Alert.alert('Error', 'Price is required');
      return;
    }
    if (!formData.stock_quantity) {
      Alert.alert('Error', 'Stock quantity is required');
      return;
    }
    if (!selectedImage) {
      Alert.alert('Error', 'Product image is required');
      return;
    }

    setSubmitting(true);
    setUploadProgress('');

    try {
      // Upload image first
      const imageUrl = await uploadImage();
      if (!imageUrl) {
        throw new Error('Failed to upload image');
      }

      setUploadProgress('Creating product...');
      const supabase = getSupabaseClient();
      
      const { error } = await supabase.from('store_products').insert({
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        price: parseFloat(formData.price),
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        stock_quantity: parseInt(formData.stock_quantity),
        image_url: imageUrl,
        approval_status: 'approved', // Auto-approve for admin
        is_available: true,
      });

      if (error) throw error;

      Alert.alert('Success!', 'Product created successfully');
      setModalVisible(false);
      resetForm();
      loadProducts();
    } catch (error: any) {
      console.error('Error creating product:', error);
      Alert.alert('Error', error.message || 'Failed to create product');
    } finally {
      setSubmitting(false);
      setUploadProgress('');
    }
  };

  const handleApprove = async (productId: string) => {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from('store_products')
        .update({ 
          approval_status: 'approved',
          is_available: true,
        })
        .eq('id', productId);

      if (error) throw error;
      loadProducts();
      Alert.alert('Success', 'Product approved');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to approve product');
    }
  };

  const handleReject = async (productId: string) => {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from('store_products')
        .update({ 
          approval_status: 'rejected',
          is_available: false,
        })
        .eq('id', productId);

      if (error) throw error;
      loadProducts();
      Alert.alert('Success', 'Product rejected');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to reject product');
    }
  };

  const handleToggleAvailability = async (productId: string, currentStatus: boolean) => {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from('store_products')
        .update({ is_available: !currentStatus })
        .eq('id', productId);

      if (error) throw error;
      loadProducts();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update availability');
    }
  };

  const handleDeleteProduct = async (productId: string, productName: string) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${productName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const supabase = getSupabaseClient();
              const { error } = await supabase
                .from('store_products')
                .delete()
                .eq('id', productId);

              if (error) throw error;
              loadProducts();
              Alert.alert('Success', 'Product deleted');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete product');
            }
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'book',
      price: '',
      original_price: '',
      stock_quantity: '',
    });
    setSelectedImage(null);
    setUploadProgress('');
  };

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
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
          <Text style={styles.headerTitle}>Store Management</Text>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <MaterialIcons name="add-circle" size={28} color="#FFFFFF" />
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
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={[styles.productCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              {item.image_url && (
                <Image source={{ uri: item.image_url }} style={styles.productImage} />
              )}
              
              <View style={styles.productHeader}>
                <View style={styles.productInfo}>
                  <Text style={[styles.productTitle, { color: theme.text }]}>{item.title}</Text>
                  <Text style={[styles.productMeta, { color: theme.textSecondary }]}>
                    {item.category} • Stock: {item.stock_quantity}
                  </Text>
                  <Text style={[styles.productPrice, { color: theme.primary }]}>
                    ₹{item.price}
                    {item.original_price && ` (was ₹${item.original_price})`}
                  </Text>
                </View>

                <View style={styles.productActions}>
                  <View style={[styles.statusBadge, { backgroundColor: `${
                    item.approval_status === 'approved' ? theme.success :
                    item.approval_status === 'rejected' ? theme.error :
                    theme.warning
                  }15` }]}>
                    <Text style={[styles.statusText, { color:
                      item.approval_status === 'approved' ? theme.success :
                      item.approval_status === 'rejected' ? theme.error :
                      theme.warning
                    }]}>
                      {item.approval_status}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.actionButtons}>
                {item.approval_status === 'pending' && (
                  <>
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: theme.success }]}
                      onPress={() => handleApprove(item.id)}
                    >
                      <MaterialIcons name="check" size={16} color="#FFFFFF" />
                      <Text style={styles.actionBtnText}>Approve</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: theme.error }]}
                      onPress={() => handleReject(item.id)}
                    >
                      <MaterialIcons name="close" size={16} color="#FFFFFF" />
                      <Text style={styles.actionBtnText}>Reject</Text>
                    </TouchableOpacity>
                  </>
                )}

                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: item.is_available ? theme.warning : theme.success }]}
                  onPress={() => handleToggleAvailability(item.id, item.is_available)}
                >
                  <MaterialIcons 
                    name={item.is_available ? 'visibility-off' : 'visibility'} 
                    size={16} 
                    color="#FFFFFF" 
                  />
                  <Text style={styles.actionBtnText}>
                    {item.is_available ? 'Hide' : 'Show'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: theme.error }]}
                  onPress={() => handleDeleteProduct(item.id, item.title)}
                >
                  <MaterialIcons name="delete" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {/* Create Product Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Add New Product</Text>

              {/* Image Upload with Preview */}
              <TouchableOpacity
                style={[styles.imagePicker, { borderColor: theme.border }]}
                onPress={pickImage}
                disabled={submitting}
              >
                {selectedImage ? (
                  <Image source={{ uri: selectedImage.uri }} style={styles.imagePreview} />
                ) : (
                  <>
                    <MaterialIcons name="add-photo-alternate" size={48} color={theme.primary} />
                    <Text style={[styles.imagePickerText, { color: theme.textSecondary }]}>
                      Upload Product Image *
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <TextInput
                style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                placeholder="Product Name *"
                placeholderTextColor={theme.textSecondary}
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
                editable={!submitting}
              />

              <TextInput
                style={[styles.input, styles.textArea, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                placeholder="Description *"
                placeholderTextColor={theme.textSecondary}
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                multiline
                numberOfLines={3}
                editable={!submitting}
              />

              <Text style={[styles.label, { color: theme.text }]}>Category *</Text>
              <View style={styles.categoryGrid}>
                {['book', 'notes', 'stationary'].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryOption,
                      { borderColor: theme.border, backgroundColor: theme.background },
                      formData.category === cat && { backgroundColor: theme.primary, borderColor: theme.primary },
                    ]}
                    onPress={() => setFormData({ ...formData, category: cat as any })}
                    disabled={submitting}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        { color: theme.text },
                        formData.category === cat && { color: '#FFFFFF' },
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.row}>
                <TextInput
                  style={[styles.input, styles.halfInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                  placeholder="Price *"
                  placeholderTextColor={theme.textSecondary}
                  value={formData.price}
                  onChangeText={(text) => setFormData({ ...formData, price: text })}
                  keyboardType="decimal-pad"
                  editable={!submitting}
                />
                <TextInput
                  style={[styles.input, styles.halfInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                  placeholder="Original Price"
                  placeholderTextColor={theme.textSecondary}
                  value={formData.original_price}
                  onChangeText={(text) => setFormData({ ...formData, original_price: text })}
                  keyboardType="decimal-pad"
                  editable={!submitting}
                />
              </View>

              <TextInput
                style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                placeholder="Stock Quantity *"
                placeholderTextColor={theme.textSecondary}
                value={formData.stock_quantity}
                onChangeText={(text) => setFormData({ ...formData, stock_quantity: text })}
                keyboardType="number-pad"
                editable={!submitting}
              />

              {uploadProgress && (
                <View style={styles.progressContainer}>
                  <ActivityIndicator size="small" color={theme.primary} />
                  <Text style={[styles.progressText, { color: theme.textSecondary }]}>
                    {uploadProgress}
                  </Text>
                </View>
              )}

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
                  onPress={handleCreateProduct}
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
    fontSize: 14,
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
  listContent: {
    padding: Spacing.md,
  },
  productCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  productImage: {
    width: '100%',
    height: 150,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  productInfo: {
    flex: 1,
  },
  productTitle: {
    ...Typography.bodyBold,
    marginBottom: 4,
  },
  productMeta: {
    ...Typography.caption,
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  productPrice: {
    ...Typography.bodyBold,
    fontSize: 16,
  },
  productActions: {},
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    ...Typography.caption,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
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
  imagePicker: {
    height: 200,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  imagePickerText: {
    ...Typography.body,
    marginTop: Spacing.sm,
  },
  label: {
    ...Typography.bodyBold,
    marginBottom: Spacing.sm,
  },
  categoryGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  categoryOption: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    alignItems: 'center',
  },
  categoryText: {
    ...Typography.caption,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  halfInput: {
    flex: 1,
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
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  progressText: {
    ...Typography.small,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.md,
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
