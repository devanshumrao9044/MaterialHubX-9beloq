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
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { useApp } from '@/hooks/useApp';
import { useTheme, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { getSupabaseClient } from '@/template';

interface Material {
  id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_type: string;
  subject: string | null;
  chapter: string | null;
  batch_id: string | null;
  created_at: string;
}

interface Batch {
  id: string;
  name: string;
}

export default function AdminMaterialsScreen() {
  const { isDarkMode } = useApp();
  const theme = useTheme(isDarkMode);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [materials, setMaterials] = useState<Material[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    chapter: '',
    batch_id: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const supabase = getSupabaseClient();
      
      const [materialsRes, batchesRes] = await Promise.all([
        supabase.from('study_materials').select('*').order('created_at', { ascending: false }),
        supabase.from('batches').select('id, name').eq('is_active', true),
      ]);

      if (materialsRes.error) throw materialsRes.error;
      if (batchesRes.error) throw batchesRes.error;

      setMaterials(materialsRes.data || []);
      setBatches(batchesRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load materials');
    } finally {
      setLoading(false);
    }
  };

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'video/*', 'image/*'],
        copyToCacheDirectory: true,
      });

      console.log('Document picker result:', result);

      if (!result.canceled && result.assets && result.assets[0]) {
        const file = result.assets[0];
        console.log('Selected file:', file);
        setSelectedFile(file);
        
        if (!formData.title) {
          const fileName = file.name.replace(/\.[^/.]+$/, '');
          setFormData({ ...formData, title: fileName });
        }
      }
    } catch (error) {
      console.error('Error picking file:', error);
      Alert.alert('Error', 'Failed to pick file. Please try again.');
    }
  };

  const uploadMaterial = async () => {
    if (!selectedFile) {
      Alert.alert('Error', 'Please select a file');
      return;
    }
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }
    if (!formData.batch_id) {
      Alert.alert('Error', 'Please select a batch');
      return;
    }

    setUploading(true);
    setUploadProgress('Reading file...');

    try {
      const supabase = getSupabaseClient();
      
      console.log('Starting upload for file:', selectedFile.name);

      // Read file using FileSystem for React Native
      let fileData: Uint8Array;
      
      if (Platform.OS === 'web') {
        setUploadProgress('Processing file (web)...');
        const response = await fetch(selectedFile.uri);
        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();
        fileData = new Uint8Array(arrayBuffer);
      } else {
        setUploadProgress('Processing file (mobile)...');
        // For React Native (iOS/Android), read file as base64 and convert
        const base64 = await FileSystem.readAsStringAsync(selectedFile.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        
        // Convert base64 to Uint8Array
        const binaryString = atob(base64);
        fileData = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          fileData[i] = binaryString.charCodeAt(i);
        }
      }

      console.log('File read successfully, size:', fileData.length, 'bytes');

      // Generate filename
      const timestamp = Date.now();
      const fileExt = selectedFile.name.split('.').pop() || 'file';
      const sanitizedTitle = formData.title.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
      const fileName = `${timestamp}_${sanitizedTitle}.${fileExt}`;
      const filePath = `${formData.batch_id}/${formData.subject || 'general'}/${fileName}`;

      console.log('Uploading to path:', filePath);
      setUploadProgress('Uploading to storage...');

      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('study-materials')
        .upload(filePath, fileData, {
          contentType: selectedFile.mimeType || 'application/octet-stream',
          upsert: false,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      console.log('Upload successful:', uploadData);
      setUploadProgress('Generating public URL...');

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('study-materials')
        .getPublicUrl(filePath);

      console.log('Public URL:', urlData.publicUrl);
      setUploadProgress('Saving to database...');

      // Insert into database
      const { error: dbError } = await supabase.from('study_materials').insert({
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        file_url: urlData.publicUrl,
        file_type: selectedFile.mimeType || 'application/octet-stream',
        subject: formData.subject.trim() || null,
        chapter: formData.chapter.trim() || null,
        batch_id: formData.batch_id,
      });

      if (dbError) {
        console.error('Database error:', dbError);
        
        // Try to delete uploaded file if database insert fails
        await supabase.storage.from('study-materials').remove([filePath]);
        
        throw new Error(`Database error: ${dbError.message}`);
      }

      console.log('Material saved to database successfully');

      Alert.alert('Success!', 'Material uploaded successfully');
      setModalVisible(false);
      resetForm();
      loadData();
    } catch (error: any) {
      console.error('Upload failed:', error);
      Alert.alert(
        'Upload Failed',
        error.message || 'An error occurred while uploading. Please try again.'
      );
    } finally {
      setUploading(false);
      setUploadProgress('');
    }
  };

  const deleteMaterial = (material: Material) => {
    Alert.alert(
      'Delete Material',
      `Are you sure you want to delete "${material.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const supabase = getSupabaseClient();
              
              console.log('🗑️ Starting deletion for material:', material.id, material.title);

              // Step 1: Delete from database first
              console.log('📊 Deleting from database...');
              const { error: dbError } = await supabase
                .from('study_materials')
                .delete()
                .eq('id', material.id);

              if (dbError) {
                console.error('❌ Database deletion error:', dbError);
                throw new Error(`Database deletion failed: ${dbError.message}`);
              }

              console.log('✅ Database deletion successful');

              // Step 2: Try to delete from storage (non-critical)
              try {
                const url = new URL(material.file_url);
                const pathParts = url.pathname.split('/');
                const bucketIndex = pathParts.indexOf('study-materials');
                
                if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
                  const filePath = decodeURIComponent(pathParts.slice(bucketIndex + 1).join('/'));
                  console.log('🗄️ Attempting to delete file from storage:', filePath);

                  const { error: storageError } = await supabase.storage
                    .from('study-materials')
                    .remove([filePath]);

                  if (storageError) {
                    console.warn('⚠️ Storage deletion warning (non-critical):', storageError.message);
                  } else {
                    console.log('✅ File deleted from storage');
                  }
                } else {
                  console.warn('⚠️ Could not extract file path from URL');
                }
              } catch (urlError) {
                console.warn('⚠️ Storage cleanup failed (non-critical):', urlError);
              }

              Alert.alert('Deleted!', `"${material.title}" has been deleted successfully`);
              loadData();
            } catch (error: any) {
              console.error('❌ Deletion failed:', error);
              Alert.alert(
                'Deletion Failed',
                error.message || 'Could not delete material. Please check your permissions and try again.'
              );
            }
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', subject: '', chapter: '', batch_id: '' });
    setSelectedFile(null);
    setUploadProgress('');
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return 'picture-as-pdf';
    if (fileType.includes('video')) return 'video-library';
    if (fileType.includes('image')) return 'image';
    return 'insert-drive-file';
  };

  const getFileColor = (fileType: string) => {
    if (fileType.includes('pdf')) return '#E53935';
    if (fileType.includes('video')) return '#8B5CF6';
    if (fileType.includes('image')) return '#4CAF50';
    return theme.textSecondary;
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
          <Text style={styles.headerTitle}>Study Materials</Text>
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
          data={materials}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshing={loading}
          onRefresh={loadData}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="library-books" size={64} color={theme.textSecondary} />
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                No materials uploaded yet
              </Text>
              <Text style={[styles.emptyHint, { color: theme.textSecondary }]}>
                Click the + button to upload your first material
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={[styles.materialCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.materialHeader}>
                <View style={[styles.fileIcon, { backgroundColor: `${getFileColor(item.file_type)}15` }]}>
                  <MaterialIcons name={getFileIcon(item.file_type) as any} size={32} color={getFileColor(item.file_type)} />
                </View>
                <View style={styles.materialInfo}>
                  <Text style={[styles.materialTitle, { color: theme.text }]}>{item.title}</Text>
                  {item.subject && (
                    <Text style={[styles.materialMeta, { color: theme.textSecondary }]}>
                      {item.subject}{item.chapter ? ` • ${item.chapter}` : ''}
                    </Text>
                  )}
                  {item.description && (
                    <Text style={[styles.materialDesc, { color: theme.textSecondary }]} numberOfLines={2}>
                      {item.description}
                    </Text>
                  )}
                </View>
              </View>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => deleteMaterial(item)}
              >
                <MaterialIcons name="delete" size={20} color={theme.error} />
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      {/* Upload Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Upload Material</Text>

              {/* File Picker */}
              <TouchableOpacity
                style={[styles.filePicker, { borderColor: theme.border, backgroundColor: theme.background }]}
                onPress={pickFile}
                activeOpacity={0.7}
                disabled={uploading}
              >
                <MaterialIcons name="upload-file" size={32} color={theme.primary} />
                <Text style={[styles.filePickerText, { color: theme.text }]} numberOfLines={2}>
                  {selectedFile ? selectedFile.name : 'Choose File (PDF, Video, Image)'}
                </Text>
              </TouchableOpacity>

              {/* Batch Selector */}
              <Text style={[styles.label, { color: theme.text }]}>Batch *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerScroll}>
                <View style={styles.pickerContainer}>
                  {batches.map((batch) => (
                    <TouchableOpacity
                      key={batch.id}
                      style={[
                        styles.batchChip,
                        { borderColor: theme.border },
                        formData.batch_id === batch.id && { backgroundColor: theme.primary },
                      ]}
                      onPress={() => setFormData({ ...formData, batch_id: batch.id })}
                      disabled={uploading}
                    >
                      <Text
                        style={[
                          styles.batchChipText,
                          { color: formData.batch_id === batch.id ? '#FFFFFF' : theme.text },
                        ]}
                      >
                        {batch.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <TextInput
                style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                placeholder="Title *"
                placeholderTextColor={theme.textSecondary}
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
                editable={!uploading}
              />

              <TextInput
                style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                placeholder="Subject (e.g., Physics, Chemistry)"
                placeholderTextColor={theme.textSecondary}
                value={formData.subject}
                onChangeText={(text) => setFormData({ ...formData, subject: text })}
                editable={!uploading}
              />

              <TextInput
                style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                placeholder="Chapter (e.g., Thermodynamics)"
                placeholderTextColor={theme.textSecondary}
                value={formData.chapter}
                onChangeText={(text) => setFormData({ ...formData, chapter: text })}
                editable={!uploading}
              />

              <TextInput
                style={[styles.input, styles.textArea, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                placeholder="Description"
                placeholderTextColor={theme.textSecondary}
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                multiline
                numberOfLines={3}
                editable={!uploading}
              />

              {uploading && uploadProgress && (
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
                  disabled={uploading}
                >
                  <Text style={[styles.modalBtnText, { color: theme.text }]}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: theme.primary, opacity: uploading ? 0.6 : 1 }]}
                  onPress={uploadMaterial}
                  disabled={uploading}
                >
                  {uploading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={[styles.modalBtnText, { color: '#FFFFFF' }]}>Upload</Text>
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
    paddingVertical: Spacing.xl * 2,
  },
  emptyText: {
    ...Typography.body,
    marginTop: Spacing.md,
  },
  emptyHint: {
    ...Typography.caption,
    marginTop: Spacing.xs,
  },
  materialCard: {
    flexDirection: 'row',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  materialHeader: {
    flex: 1,
    flexDirection: 'row',
  },
  fileIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  materialInfo: {
    flex: 1,
  },
  materialTitle: {
    ...Typography.bodyBold,
    marginBottom: 4,
  },
  materialMeta: {
    ...Typography.caption,
    marginBottom: 4,
  },
  materialDesc: {
    ...Typography.small,
  },
  deleteBtn: {
    padding: Spacing.sm,
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
  filePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  filePickerText: {
    ...Typography.body,
    marginLeft: Spacing.md,
    flex: 1,
  },
  label: {
    ...Typography.bodyBold,
    marginBottom: Spacing.sm,
  },
  pickerScroll: {
    marginBottom: Spacing.md,
  },
  pickerContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  batchChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  batchChipText: {
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
    marginTop: Spacing.sm,
  },
  modalBtn: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  modalBtnText: {
    ...Typography.bodyBold,
  },
});
