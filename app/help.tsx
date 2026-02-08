import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/hooks/useApp';
import { useTheme, Spacing, Typography, BorderRadius } from '@/constants/theme';

interface FAQItem {
  question: string;
  answer: string;
}

export default function HelpScreen() {
  const theme = useTheme(useApp().isDarkMode);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [feedbackText, setFeedbackText] = useState('');

  const faqs: FAQItem[] = [
    {
      question: 'How do I download study materials?',
      answer: 'Go to Library, select your subject, and click the Download button on any material. Make sure you are logged in to download.',
    },
    {
      question: 'What is the XP system?',
      answer: 'You earn 1 XP for every 2 minutes you spend in the app. XP helps you climb the leaderboard and compete with other students.',
    },
    {
      question: 'How do I change my batch?',
      answer: 'Go to Home screen and use the batch selector dropdown at the top to change your institute and batch.',
    },
    {
      question: 'Can I access materials offline?',
      answer: 'Yes! Download any material and you can access it offline anytime from the Downloads section.',
    },
    {
      question: 'How do I reset my password?',
      answer: 'Currently, password reset requires admin assistance. Contact support at support@materialhubx.com for help.',
    },
    {
      question: 'What file formats are supported?',
      answer: 'We support PDF documents, MP4 videos, and image files (JPG, PNG). All materials are optimized for mobile viewing.',
    },
    {
      question: 'How do I bookmark materials?',
      answer: 'Click the bookmark icon on any material to save it for quick access later. View all bookmarks in the Bookmarks section.',
    },
    {
      question: 'Is there a limit to downloads?',
      answer: 'No, you can download unlimited materials. However, make sure you have enough storage space on your device.',
    },
  ];

  const toggleFAQ = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleSubmitFeedback = () => {
    if (!feedbackText.trim()) {
      Alert.alert('Error', 'Please enter your feedback');
      return;
    }
    Alert.alert(
      'Thank You!',
      'Your feedback has been submitted. We will get back to you soon.',
      [{ text: 'OK', onPress: () => setFeedbackText('') }]
    );
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
          <Text style={styles.headerTitle}>Help & Support</Text>
          <View style={{ width: 24 }} />
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="help-outline" size={24} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Frequently Asked Questions
            </Text>
          </View>

          {faqs.map((faq, index) => (
            <View key={index} style={styles.faqItem}>
              <TouchableOpacity
                style={styles.faqQuestion}
                onPress={() => toggleFAQ(index)}
                activeOpacity={0.7}
              >
                <Text style={[styles.faqQuestionText, { color: theme.text }]}>
                  {faq.question}
                </Text>
                <MaterialIcons
                  name={expandedIndex === index ? 'expand-less' : 'expand-more'}
                  size={24}
                  color={theme.textSecondary}
                />
              </TouchableOpacity>
              {expandedIndex === index && (
                <View style={[styles.faqAnswer, { backgroundColor: theme.background }]}>
                  <Text style={[styles.faqAnswerText, { color: theme.textSecondary }]}>
                    {faq.answer}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>

        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="feedback" size={24} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Send Feedback</Text>
          </View>
          <Text style={[styles.feedbackDesc, { color: theme.textSecondary }]}>
            Have suggestions or found a bug? Let us know!
          </Text>
          <TextInput
            style={[
              styles.feedbackInput,
              { color: theme.text, borderColor: theme.border, backgroundColor: theme.background },
            ]}
            placeholder="Write your feedback here..."
            placeholderTextColor={theme.textSecondary}
            value={feedbackText}
            onChangeText={setFeedbackText}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: theme.primary }]}
            onPress={handleSubmitFeedback}
          >
            <Text style={styles.submitBtnText}>Submit Feedback</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="contact-support" size={24} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Contact Support</Text>
          </View>
          <Text style={[styles.contactText, { color: theme.textSecondary }]}>
            For urgent issues or inquiries, reach out to us at:
          </Text>
          <Text style={[styles.contactEmail, { color: theme.primary }]}>
            support@materialhubx.com
          </Text>
          <Text style={[styles.contactText, { color: theme.textSecondary }]}>
            We typically respond within 24-48 hours.
          </Text>
        </View>
      </ScrollView>
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
  content: {
    padding: Spacing.md,
  },
  section: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h3,
    marginLeft: Spacing.sm,
  },
  faqItem: {
    marginBottom: Spacing.sm,
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
  },
  faqQuestionText: {
    ...Typography.bodyBold,
    flex: 1,
    marginRight: Spacing.sm,
  },
  faqAnswer: {
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
  },
  faqAnswerText: {
    ...Typography.body,
    lineHeight: 22,
  },
  feedbackDesc: {
    ...Typography.body,
    marginBottom: Spacing.md,
  },
  feedbackInput: {
    ...Typography.body,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    minHeight: 120,
    marginBottom: Spacing.md,
  },
  submitBtn: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  contactText: {
    ...Typography.body,
    marginBottom: Spacing.sm,
    lineHeight: 22,
  },
  contactEmail: {
    ...Typography.h3,
    marginVertical: Spacing.sm,
  },
});
