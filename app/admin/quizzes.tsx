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
import { quizService, Quiz, QuizQuestion } from '@/services/quizService';
import { getSupabaseClient } from '@/template';

interface Batch {
  id: string;
  name: string;
}

export default function AdminQuizzesScreen() {
  const theme = useTheme(useApp().isDarkMode);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [questionModalVisible, setQuestionModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  
  const [quizFormData, setQuizFormData] = useState({
    title: '',
    description: '',
    batch_id: '',
    subject: '',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    time_limit_minutes: '',
    quiz_type: 'practice' as 'practice' | 'test' | 'battleground',
  });

  const [questionFormData, setQuestionFormData] = useState({
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: 'A' as 'A' | 'B' | 'C' | 'D',
    explanation: '',
    marks: '1',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const supabase = getSupabaseClient();
      const [quizzesRes, batchesRes] = await Promise.all([
        quizService.getAllQuizzes(),
        supabase.from('batches').select('id, name').eq('is_active', true),
      ]);

      if (quizzesRes.error) throw quizzesRes.error;
      if (batchesRes.error) throw batchesRes.error;

      setQuizzes(quizzesRes.data || []);
      setBatches(batchesRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuiz = async () => {
    if (!quizFormData.title.trim()) {
      Alert.alert('Error', 'Quiz title is required');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await quizService.createQuiz({
        title: quizFormData.title.trim(),
        description: quizFormData.description.trim() || null,
        batch_id: quizFormData.batch_id || null,
        subject: quizFormData.subject.trim() || null,
        difficulty: quizFormData.difficulty,
        time_limit_minutes: quizFormData.time_limit_minutes ? parseInt(quizFormData.time_limit_minutes) : null,
        quiz_type: quizFormData.quiz_type,
        is_active: true,
      });

      if (error) throw error;

      Alert.alert('Success!', 'Quiz created successfully. Now add questions to it.');
      setModalVisible(false);
      resetQuizForm();
      loadData();
    } catch (error: any) {
      console.error('Error creating quiz:', error);
      Alert.alert('Error', error.message || 'Failed to create quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddQuestion = async () => {
    if (!selectedQuiz) return;
    
    if (!questionFormData.question_text.trim()) {
      Alert.alert('Error', 'Question text is required');
      return;
    }
    if (!questionFormData.option_a.trim() || !questionFormData.option_b.trim() || 
        !questionFormData.option_c.trim() || !questionFormData.option_d.trim()) {
      Alert.alert('Error', 'All options are required');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await quizService.addQuestion({
        quiz_id: selectedQuiz.id,
        question_text: questionFormData.question_text.trim(),
        option_a: questionFormData.option_a.trim(),
        option_b: questionFormData.option_b.trim(),
        option_c: questionFormData.option_c.trim(),
        option_d: questionFormData.option_d.trim(),
        correct_answer: questionFormData.correct_answer,
        explanation: questionFormData.explanation.trim() || null,
        marks: parseInt(questionFormData.marks),
      });

      if (error) throw error;

      Alert.alert('Success!', 'Question added successfully');
      resetQuestionForm();
      // Don't close modal, allow adding more questions
    } catch (error: any) {
      console.error('Error adding question:', error);
      Alert.alert('Error', error.message || 'Failed to add question');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteQuiz = (quiz: Quiz) => {
    Alert.alert(
      'Delete Quiz',
      `Are you sure you want to delete "${quiz.title}"? This will also delete all questions.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await quizService.deleteQuiz(quiz.id);
              if (error) throw error;
              loadData();
              Alert.alert('Success', 'Quiz deleted successfully');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete quiz');
            }
          },
        },
      ]
    );
  };

  const openAddQuestions = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setQuestionModalVisible(true);
  };

  const resetQuizForm = () => {
    setQuizFormData({
      title: '',
      description: '',
      batch_id: '',
      subject: '',
      difficulty: 'medium',
      time_limit_minutes: '',
      quiz_type: 'practice',
    });
  };

  const resetQuestionForm = () => {
    setQuestionFormData({
      question_text: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_answer: 'A',
      explanation: '',
      marks: '1',
    });
  };

  const getQuizTypeColor = (type: string) => {
    switch (type) {
      case 'practice': return '#4CAF50';
      case 'test': return '#FF9800';
      case 'battleground': return '#E53935';
      default: return theme.primary;
    }
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
          <Text style={styles.headerTitle}>Quiz Management</Text>
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
          data={quizzes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="quiz" size={64} color={theme.textSecondary} />
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                No quizzes created yet
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={[styles.quizCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.quizHeader}>
                <View style={styles.quizInfo}>
                  <Text style={[styles.quizTitle, { color: theme.text }]}>{item.title}</Text>
                  {item.description && (
                    <Text style={[styles.quizDesc, { color: theme.textSecondary }]} numberOfLines={2}>
                      {item.description}
                    </Text>
                  )}
                  <View style={styles.quizMeta}>
                    <View style={[styles.typeBadge, { backgroundColor: `${getQuizTypeColor(item.quiz_type)}15` }]}>
                      <Text style={[styles.typeText, { color: getQuizTypeColor(item.quiz_type) }]}>
                        {item.quiz_type}
                      </Text>
                    </View>
                    {item.difficulty && (
                      <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                        {item.difficulty}
                      </Text>
                    )}
                    {item.time_limit_minutes && (
                      <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                        {item.time_limit_minutes} min
                      </Text>
                    )}
                  </View>
                </View>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: theme.primary }]}
                  onPress={() => openAddQuestions(item)}
                >
                  <MaterialIcons name="add" size={16} color="#FFFFFF" />
                  <Text style={styles.actionBtnText}>Add Questions</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: theme.error }]}
                  onPress={() => handleDeleteQuiz(item)}
                >
                  <MaterialIcons name="delete" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {/* Create Quiz Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Create Quiz</Text>

              <TextInput
                style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                placeholder="Quiz Title *"
                placeholderTextColor={theme.textSecondary}
                value={quizFormData.title}
                onChangeText={(text) => setQuizFormData({ ...quizFormData, title: text })}
                editable={!submitting}
              />

              <TextInput
                style={[styles.input, styles.textArea, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                placeholder="Description"
                placeholderTextColor={theme.textSecondary}
                value={quizFormData.description}
                onChangeText={(text) => setQuizFormData({ ...quizFormData, description: text })}
                multiline
                numberOfLines={3}
                editable={!submitting}
              />

              <Text style={[styles.label, { color: theme.text }]}>Quiz Type *</Text>
              <View style={styles.typeButtons}>
                {['practice', 'test', 'battleground'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeBtn,
                      { borderColor: theme.border, backgroundColor: theme.background },
                      quizFormData.quiz_type === type && { backgroundColor: theme.primary, borderColor: theme.primary },
                    ]}
                    onPress={() => setQuizFormData({ ...quizFormData, quiz_type: type as any })}
                    disabled={submitting}
                  >
                    <Text
                      style={[
                        styles.typeBtnText,
                        { color: theme.text },
                        quizFormData.quiz_type === type && { color: '#FFFFFF' },
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.label, { color: theme.text }]}>Batch (Optional)</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerScroll}>
                <View style={styles.pickerContainer}>
                  <TouchableOpacity
                    style={[
                      styles.batchChip,
                      { borderColor: theme.border },
                      !quizFormData.batch_id && { backgroundColor: theme.primary },
                    ]}
                    onPress={() => setQuizFormData({ ...quizFormData, batch_id: '' })}
                  >
                    <Text style={[styles.batchChipText, { color: !quizFormData.batch_id ? '#FFFFFF' : theme.text }]}>
                      All Batches
                    </Text>
                  </TouchableOpacity>
                  {batches.map((batch) => (
                    <TouchableOpacity
                      key={batch.id}
                      style={[
                        styles.batchChip,
                        { borderColor: theme.border },
                        quizFormData.batch_id === batch.id && { backgroundColor: theme.primary },
                      ]}
                      onPress={() => setQuizFormData({ ...quizFormData, batch_id: batch.id })}
                    >
                      <Text
                        style={[
                          styles.batchChipText,
                          { color: quizFormData.batch_id === batch.id ? '#FFFFFF' : theme.text },
                        ]}
                      >
                        {batch.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <View style={styles.row}>
                <TextInput
                  style={[styles.input, styles.halfInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                  placeholder="Subject"
                  placeholderTextColor={theme.textSecondary}
                  value={quizFormData.subject}
                  onChangeText={(text) => setQuizFormData({ ...quizFormData, subject: text })}
                  editable={!submitting}
                />
                <TextInput
                  style={[styles.input, styles.halfInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                  placeholder="Time Limit (min)"
                  placeholderTextColor={theme.textSecondary}
                  value={quizFormData.time_limit_minutes}
                  onChangeText={(text) => setQuizFormData({ ...quizFormData, time_limit_minutes: text })}
                  keyboardType="number-pad"
                  editable={!submitting}
                />
              </View>

              <Text style={[styles.label, { color: theme.text }]}>Difficulty</Text>
              <View style={styles.typeButtons}>
                {['easy', 'medium', 'hard'].map((diff) => (
                  <TouchableOpacity
                    key={diff}
                    style={[
                      styles.typeBtn,
                      { borderColor: theme.border, backgroundColor: theme.background },
                      quizFormData.difficulty === diff && { backgroundColor: theme.primary, borderColor: theme.primary },
                    ]}
                    onPress={() => setQuizFormData({ ...quizFormData, difficulty: diff as any })}
                    disabled={submitting}
                  >
                    <Text
                      style={[
                        styles.typeBtnText,
                        { color: theme.text },
                        quizFormData.difficulty === diff && { color: '#FFFFFF' },
                      ]}
                    >
                      {diff}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: theme.border }]}
                  onPress={() => {
                    setModalVisible(false);
                    resetQuizForm();
                  }}
                  disabled={submitting}
                >
                  <Text style={[styles.modalBtnText, { color: theme.text }]}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: theme.primary, opacity: submitting ? 0.6 : 1 }]}
                  onPress={handleCreateQuiz}
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

      {/* Add Questions Modal */}
      <Modal visible={questionModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.questionModalHeader}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>
                  Add Question to "{selectedQuiz?.title}"
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setQuestionModalVisible(false);
                    setSelectedQuiz(null);
                    resetQuestionForm();
                  }}
                >
                  <MaterialIcons name="close" size={24} color={theme.text} />
                </TouchableOpacity>
              </View>

              <TextInput
                style={[styles.input, styles.textArea, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                placeholder="Question Text *"
                placeholderTextColor={theme.textSecondary}
                value={questionFormData.question_text}
                onChangeText={(text) => setQuestionFormData({ ...questionFormData, question_text: text })}
                multiline
                numberOfLines={3}
                editable={!submitting}
              />

              <TextInput
                style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                placeholder="Option A *"
                placeholderTextColor={theme.textSecondary}
                value={questionFormData.option_a}
                onChangeText={(text) => setQuestionFormData({ ...questionFormData, option_a: text })}
                editable={!submitting}
              />

              <TextInput
                style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                placeholder="Option B *"
                placeholderTextColor={theme.textSecondary}
                value={questionFormData.option_b}
                onChangeText={(text) => setQuestionFormData({ ...questionFormData, option_b: text })}
                editable={!submitting}
              />

              <TextInput
                style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                placeholder="Option C *"
                placeholderTextColor={theme.textSecondary}
                value={questionFormData.option_c}
                onChangeText={(text) => setQuestionFormData({ ...questionFormData, option_c: text })}
                editable={!submitting}
              />

              <TextInput
                style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                placeholder="Option D *"
                placeholderTextColor={theme.textSecondary}
                value={questionFormData.option_d}
                onChangeText={(text) => setQuestionFormData({ ...questionFormData, option_d: text })}
                editable={!submitting}
              />

              <Text style={[styles.label, { color: theme.text }]}>Correct Answer *</Text>
              <View style={styles.typeButtons}>
                {['A', 'B', 'C', 'D'].map((ans) => (
                  <TouchableOpacity
                    key={ans}
                    style={[
                      styles.typeBtn,
                      { borderColor: theme.border, backgroundColor: theme.background },
                      questionFormData.correct_answer === ans && { backgroundColor: theme.success, borderColor: theme.success },
                    ]}
                    onPress={() => setQuestionFormData({ ...questionFormData, correct_answer: ans as any })}
                    disabled={submitting}
                  >
                    <Text
                      style={[
                        styles.typeBtnText,
                        { color: theme.text },
                        questionFormData.correct_answer === ans && { color: '#FFFFFF' },
                      ]}
                    >
                      {ans}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                style={[styles.input, styles.textArea, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                placeholder="Explanation (Optional)"
                placeholderTextColor={theme.textSecondary}
                value={questionFormData.explanation}
                onChangeText={(text) => setQuestionFormData({ ...questionFormData, explanation: text })}
                multiline
                numberOfLines={2}
                editable={!submitting}
              />

              <TouchableOpacity
                style={[styles.addQuestionBtn, { backgroundColor: theme.primary, opacity: submitting ? 0.6 : 1 }]}
                onPress={handleAddQuestion}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.addQuestionBtnText}>Add Question</Text>
                )}
              </TouchableOpacity>
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
  quizCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  quizHeader: {
    marginBottom: Spacing.md,
  },
  quizInfo: {},
  quizTitle: {
    ...Typography.bodyBold,
    fontSize: 16,
    marginBottom: 4,
  },
  quizDesc: {
    ...Typography.small,
    marginBottom: Spacing.sm,
  },
  quizMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  typeBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  typeText: {
    ...Typography.caption,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  metaText: {
    ...Typography.caption,
    textTransform: 'capitalize',
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
    flex: 1,
    justifyContent: 'center',
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
  questionModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    textTransform: 'capitalize',
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
  addQuestionBtn: {
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  addQuestionBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
