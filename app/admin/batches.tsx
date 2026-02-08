import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/hooks/useApp';
import { useTheme, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { getSupabaseClient } from '@/template';

interface Batch {
  id: string;
  name: string;
  class_level: string;
  exam_type: string;
  description: string | null;
  is_active: boolean;
  institute_id: string;
}

export default function AdminBatchesScreen() {
  const { isDarkMode } = useApp();
  const theme = useTheme(isDarkMode);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editBatch, setEditBatch] = useState<Batch | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    class_level: '',
    exam_type: '',
    description: '',
  });

  useEffect(() => {
    loadBatches();
  }, []);

  const loadBatches = async () => {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('batches')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBatches(data || []);
    } catch (error) {
      console.error('Error loading batches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.class_level || !formData.exam_type) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    try {
      const supabase = getSupabaseClient();

      if (editBatch) {
        const { error } = await supabase
          .from('batches')
          .update(formData)
          .eq('id', editBatch.id);

        if (error) throw error;
      } else {
        const { data: institutes } = await supabase.from('institutes').select('id').limit(1);
        const instituteId = institutes?.[0]?.id;

        const { error } = await supabase.from('batches').insert({
          ...formData,
          institute_id: instituteId,
        });

        if (error) throw error;
      }

      setModalVisible(false);
      resetForm();
      loadBatches();
      Alert.alert('Success', `Batch ${editBatch ? 'updated' : 'created'} successfully`);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save batch');
    }
  };

  const handleDelete = (batch: Batch) => {
    Alert.alert(
      'Delete Batch',
      `Are you sure you want to delete "${batch.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const supabase = getSupabaseClient();
              const { error } = await supabase.from('batches').delete().eq('id', batch.id);
              if (error) throw error;
              loadBatches();
              Alert.alert('Success', 'Batch deleted successfully');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete batch');
            }
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setFormData({ name: '', class_level: '', exam_type: '', description: '' });
    setEditBatch(null);
  };

  const openEditModal = (batch: Batch) => {
    setEditBatch(batch);
    setFormData({
      name: batch.name,
      class_level: batch.class_level,
      exam_type: batch.exam_type,
      description: batch.description || '',
    });
    setModalVisible(true);
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
          <Text style={styles.headerTitle}>Manage Batches</Text>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <MaterialIcons name="add-circle" size={28} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <FlatList
        data={batches}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshing={loading}
        onRefresh={loadBatches}
        renderItem={({ item }) => (
          <View style={[styles.batchCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.batchInfo}>
              <Text style={[styles.batchName, { color: theme.text }]}>{item.name}</Text>
              <Text style={[styles.batchMeta, { color: theme.textSecondary }]}>
                {item.class_level} • {item.exam_type}
              </Text>
              {item.description && (
                <Text style={[styles.batchDesc, { color: theme.textSecondary }]}>
                  {item.description}
                </Text>
              )}
            </View>
            <View style={styles.batchActions}>
              <TouchableOpacity onPress={() => openEditModal(item)} style={styles.actionBtn}>
                <MaterialIcons name="edit" size={20} color={theme.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item)} style={styles.actionBtn}>
                <MaterialIcons name="delete" size={20} color={theme.error} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {editBatch ? 'Edit Batch' : 'Add New Batch'}
            </Text>

            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.border }]}
              placeholder="Batch Name (e.g., ARJUNA JEE 2026)"
              placeholderTextColor={theme.textSecondary}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />

            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.border }]}
              placeholder="Class Level (e.g., 11th, 12th)"
              placeholderTextColor={theme.textSecondary}
              value={formData.class_level}
              onChangeText={(text) => setFormData({ ...formData, class_level: text })}
            />

            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.border }]}
              placeholder="Exam Type (e.g., IIT JEE, NEET)"
              placeholderTextColor={theme.textSecondary}
              value={formData.exam_type}
              onChangeText={(text) => setFormData({ ...formData, exam_type: text })}
            />

            <TextInput
              style={[styles.input, styles.textArea, { color: theme.text, borderColor: theme.border }]}
              placeholder="Description (optional)"
              placeholderTextColor={theme.textSecondary}
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: theme.border }]}
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
              >
                <Text style={[styles.modalBtnText, { color: theme.text }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: theme.primary }]}
                onPress={handleSave}
              >
                <Text style={[styles.modalBtnText, { color: '#FFFFFF' }]}>Save</Text>
              </TouchableOpacity>
            </View>
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
  listContent: {
    padding: Spacing.md,
  },
  batchCard: {
    flexDirection: 'row',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  batchInfo: {
    flex: 1,
  },
  batchName: {
    ...Typography.bodyBold,
    marginBottom: 4,
  },
  batchMeta: {
    ...Typography.caption,
    marginBottom: 4,
  },
  batchDesc: {
    ...Typography.small,
  },
  batchActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtn: {
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
  },
  modalTitle: {
    ...Typography.h3,
    marginBottom: Spacing.md,
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
