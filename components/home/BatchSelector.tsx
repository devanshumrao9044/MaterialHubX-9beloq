import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { useApp } from '@/hooks/useApp';

export function BatchSelector() {
  const theme = useTheme();
  const { institutes, batches, selectedInstitute, selectedBatch, selectInstitute, selectBatch } = useApp();
  const [showInstituteModal, setShowInstituteModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.selector, { backgroundColor: theme.card, borderColor: theme.border }]}
        onPress={() => setShowInstituteModal(true)}
      >
        <MaterialIcons name="school" size={20} color={theme.primary} />
        <Text style={[styles.selectorText, { color: theme.text }]} numberOfLines={1}>
          {selectedInstitute?.name || 'Select Institute'}
        </Text>
        <MaterialIcons name="arrow-drop-down" size={24} color={theme.textSecondary} />
      </TouchableOpacity>

      {selectedInstitute && (
        <TouchableOpacity
          style={[styles.selector, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => setShowBatchModal(true)}
        >
          <MaterialIcons name="class" size={20} color={theme.primary} />
          <Text style={[styles.selectorText, { color: theme.text }]} numberOfLines={1}>
            {selectedBatch?.name || 'Select Batch'}
          </Text>
          <MaterialIcons name="arrow-drop-down" size={24} color={theme.textSecondary} />
        </TouchableOpacity>
      )}

      <Modal
        visible={showInstituteModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowInstituteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Select Institute</Text>
              <TouchableOpacity onPress={() => setShowInstituteModal(false)}>
                <MaterialIcons name="close" size={24} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={institutes}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    { borderBottomColor: theme.border },
                    selectedInstitute?.id === item.id && { backgroundColor: theme.background },
                  ]}
                  onPress={() => {
                    selectInstitute(item.id);
                    setShowInstituteModal(false);
                  }}
                >
                  <Text style={[styles.modalItemText, { color: theme.text }]}>{item.name}</Text>
                  {selectedInstitute?.id === item.id && (
                    <MaterialIcons name="check" size={20} color={theme.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      <Modal
        visible={showBatchModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowBatchModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Select Batch</Text>
              <TouchableOpacity onPress={() => setShowBatchModal(false)}>
                <MaterialIcons name="close" size={24} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={batches}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    { borderBottomColor: theme.border },
                    selectedBatch?.id === item.id && { backgroundColor: theme.background },
                  ]}
                  onPress={() => {
                    selectBatch(item.id);
                    setShowBatchModal(false);
                  }}
                >
                  <View style={styles.batchInfo}>
                    <Text style={[styles.modalItemText, { color: theme.text }]}>{item.name}</Text>
                    <Text style={[styles.batchSubtext, { color: theme.textSecondary }]}>
                      {item.class_level} • {item.exam_type}
                    </Text>
                  </View>
                  {selectedBatch?.id === item.id && (
                    <MaterialIcons name="check" size={20} color={theme.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  selector: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  selectorText: {
    ...Typography.caption,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    maxHeight: '70%',
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingBottom: Spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    ...Typography.h3,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderBottomWidth: 1,
  },
  modalItemText: {
    ...Typography.body,
  },
  batchInfo: {
    flex: 1,
  },
  batchSubtext: {
    ...Typography.small,
    marginTop: 2,
  },
});
