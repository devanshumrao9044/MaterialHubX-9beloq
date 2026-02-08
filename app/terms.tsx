import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/hooks/useApp';
import { useTheme, Spacing, Typography, BorderRadius } from '@/constants/theme';

export default function TermsScreen() {
  const theme = useTheme(useApp().isDarkMode);
  const router = useRouter();
  const insets = useSafeAreaInsets();

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
          <Text style={styles.headerTitle}>Terms & Conditions</Text>
          <View style={{ width: 24 }} />
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.lastUpdated, { color: theme.textSecondary }]}>
          Last Updated: January 25, 2026
        </Text>

        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>1. Acceptance of Terms</Text>
          <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
            By accessing and using Material Hub X, you accept and agree to be bound by these Terms and Conditions. 
            If you do not agree, please do not use our application.
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>2. User Accounts</Text>
          <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
            • You must provide accurate information during registration{'\n'}
            • You are responsible for maintaining account security{'\n'}
            • One user, one account policy{'\n'}
            • Sharing account credentials is prohibited{'\n'}
            • You must be at least 13 years old to use this service
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>3. Content Usage</Text>
          <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
            • All study materials are for personal educational use only{'\n'}
            • Redistribution, sharing, or reselling of content is strictly prohibited{'\n'}
            • Downloaded materials remain subject to these terms{'\n'}
            • Copyright infringement will result in immediate account termination
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>4. Prohibited Activities</Text>
          <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
            You agree NOT to:{'\n\n'}
            • Use the app for any illegal purpose{'\n'}
            • Attempt to hack or breach security{'\n'}
            • Upload malicious content or viruses{'\n'}
            • Impersonate others or create fake accounts{'\n'}
            • Spam, harass, or abuse other users{'\n'}
            • Scrape or extract data from the app
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>5. Payments & Refunds</Text>
          <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
            • All purchases are final and non-refundable{'\n'}
            • Prices are subject to change without notice{'\n'}
            • Payment information is processed securely{'\n'}
            • Subscription terms are clearly stated at time of purchase
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>6. Intellectual Property</Text>
          <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
            All content, logos, trademarks, and materials on Material Hub X are owned by us or 
            licensed to us. You may not copy, reproduce, or distribute any content without written permission.
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>7. Disclaimer</Text>
          <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
            • The app is provided "as is" without warranties{'\n'}
            • We do not guarantee exam success or specific results{'\n'}
            • Content accuracy is not guaranteed{'\n'}
            • We are not liable for any damages arising from app use
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>8. Termination</Text>
          <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
            We reserve the right to suspend or terminate your account at any time for:{'\n\n'}
            • Violation of these terms{'\n'}
            • Fraudulent activity{'\n'}
            • Misuse of the platform{'\n'}
            • Any reason deemed necessary by us
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>9. Changes to Terms</Text>
          <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
            We may update these terms at any time. Continued use of the app after changes 
            constitutes acceptance of the new terms. We will notify users of significant changes.
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>10. Contact Information</Text>
          <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
            For questions about these Terms & Conditions:{'\n\n'}
            Email: support@materialhubx.com{'\n'}
            Website: www.materialhubx.com
          </Text>
        </View>

        <Text style={[styles.footer, { color: theme.textSecondary }]}>
          By using Material Hub X, you acknowledge that you have read, understood, 
          and agree to be bound by these Terms and Conditions.
        </Text>
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
  lastUpdated: {
    ...Typography.caption,
    marginBottom: Spacing.md,
    fontStyle: 'italic',
  },
  section: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h3,
    marginBottom: Spacing.md,
  },
  sectionText: {
    ...Typography.body,
    lineHeight: 24,
  },
  footer: {
    ...Typography.small,
    textAlign: 'center',
    marginVertical: Spacing.xl,
    fontStyle: 'italic',
    lineHeight: 20,
  },
});
