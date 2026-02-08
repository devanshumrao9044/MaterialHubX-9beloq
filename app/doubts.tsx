import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
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
import { getSupabaseClient } from '@/template';

interface Doubt {
  id: string;
  subject: string;
  question: string;
  status: 'pending' | 'answered' | 'closed';
  created_at: string;
}

export default function DoubtsScreen() {
  const theme = useTheme(useApp().isDarkMode);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    question: '',
  });

  const subjects = ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'Other'];

  useEffect(() => {
    if (user) {
      loadDoubts();
    }
  }, [user]);

  const loadDoubts = async () => {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('doubts')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDoubts(data || []);
    } catch (error) {
      console.error('Error loading doubts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitDoubt = async () => {
    if (!formData.subject || !formData.question.trim()) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setSubmitting(true);
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('doubts').insert({
        user_id: user?.id,
        subject: formData.subject,
        question: formData.question.trim(),
        status: 'pending',
      });

      if (error) throw error;

      Alert.alert('Success!', 'Your doubt has been submitted. We will get back to you soon.');
      setModalVisible(false);
      setFormData({ subject: '', question: '' });
      loadDoubts();
    } catch (error: any) {
      console.error('Error submitting doubt:', error);
      Alert.alert('Error', error.message || 'Failed to submit doubt');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'answered': return theme.success;
      case 'closed': return theme.textSecondary;
      default: return theme.warning;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'answered': return 'check-circle';
      case 'closed': return 'cancel';
      default: return 'schedule';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
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
          <Text style={styles.headerTitle}>My Doubts</Text>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <MaterialIcons name="add-circle" size={28} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : doubts.length === 0 ? (
        <View style={styles.centerContainer}>
          <MaterialIcons name="help-outline" size={64} color={theme.textSecondary} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>No Doubts Posted</Text>
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            Ask your questions and get expert answers
          </Text>
          <TouchableOpacity
            style={[styles.askBtn, { backgroundColor: theme.primary }]}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.askBtnText}>Ask a Question</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={doubts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={[styles.doubtCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.doubtHeader}>
                <View style={[styles.subjectBadge, { backgroundColor: `${theme.primary}15` }]}>
                  <MaterialIcons name="subject" size={16} color={theme.primary} />
                  <Text style={[styles.subjectText, { color: theme.primary }]}>
                    {item.subject}
                  </Text>
                </View>
                <View style={styles.statusBadge}>
                  <MaterialIcons 
                    name={getStatusIcon(item.status) as any} 
                    size={16} 
                    color={getStatusColor(item.status)} 
                  />
                  <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                    {item.status}
                  </Text>
                </View>
              </View>

              <Text style={[styles.doubtQuestion, { color: theme.text }]}>
                {item.question}
              </Text>

              <Text style={[styles.doubtDate, { color: theme.textSecondary }]}>
                Asked on {formatDate(item.created_at)}
              </Text>
            </View>
          )}
        />
      )}

      {/* Add Doubt Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Ask a Question</Text>

            <Text style={[styles.label, { color: theme.text }]}>Subject *</Text>
            <View style={styles.subjectGrid}>
              {subjects.map((subject) => (
                <TouchableOpacity
                  key={subject}
                  style={[
                    styles.subjectOption,
                    { borderColor: theme.border, backgroundColor: theme.background },
                    formData.subject === subject && { 
                      backgroundColor: theme.primary, 
                      borderColor: theme.primary 
                    },
                  ]}
                  onPress={() => setFormData({ ...formData, subject })}
                  disabled={submitting}
                >
                  <Text
                    style={[
                      styles.subjectOptionText,
                      { color: theme.text },
                      formData.subject === subject && { color: '#FFFFFF' },
                    ]}
                  >
                    {subject}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, { color: theme.text }]}>Your Question *</Text>
            <TextInput
              style={[
                styles.questionInput,
                { color: theme.text, borderColor: theme.border, backgroundColor: theme.background },
              ]}
              placeholder="Describe your doubt in detail..."
              placeholderTextColor={theme.textSecondary}
              value={formData.question}
              onChangeText={(text) => setFormData({ ...formData, question: text })}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              editable={!submitting}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: theme.border }]}
                onPress={() => {
                  setModalVisible(false);
                  setFormData({ subject: '', question: '' });
                }}
                disabled={submitting}
              >
                <Text style={[styles.modalBtnText, { color: theme.text }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: theme.primary }]}
                onPress={handleSubmitDoubt}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={[styles.modalBtnText, { color: '#FFFFFF' }]}>Submit</Text>
                )}
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
  askBtn: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  askBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    padding: Spacing.md,
  },
  doubtCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  doubtHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  subjectBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  subjectText: {
    ...Typography.caption,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    ...Typography.caption,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  doubtQuestion: {
    ...Typography.body,
    marginBottom: Spacing.sm,
    lineHeight: 22,
  },
  doubtDate: {
    ...Typography.small,
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
    maxHeight: '80%',
  },
  modalTitle: {
    ...Typography.h3,
    marginBottom: Spacing.lg,
  },
  label: {
    ...Typography.bodyBold,
    marginBottom: Spacing.sm,
  },
  subjectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  subjectOption: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  subjectOptionText: {
    ...Typography.caption,
    fontWeight: '600',
  },
  questionInput: {
    ...Typography.body,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    minHeight: 120,
    marginBottom: Spacing.md,
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
    minHeight: 48,
    justifyContent: 'center',
  },
  modalBtnText: {
    ...Typography.bodyBold,
  },
});
