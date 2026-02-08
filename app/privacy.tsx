import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/hooks/useApp';
import { useTheme, Spacing, Typography, BorderRadius } from '@/constants/theme';

export default function PrivacyPolicyScreen() {
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
          <Text style={styles.headerTitle}>Privacy Policy</Text>
          <View style={{ width: 24 }} />
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.lastUpdated, { color: theme.textSecondary }]}>
          Last Updated: January 25, 2026
        </Text>

        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Introduction</Text>
          <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
            Material Hub X ("we", "our", or "us") is committed to protecting your privacy. 
            This Privacy Policy explains how we collect, use, disclose, and safeguard your 
            information when you use our mobile application.
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Information We Collect</Text>
          
          <Text style={[styles.subTitle, { color: theme.text }]}>Personal Information</Text>
          <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
            • Email address{'\n'}
            • Username{'\n'}
            • Selected institute and batch information{'\n'}
            • Study progress and XP data
          </Text>

          <Text style={[styles.subTitle, { color: theme.text }]}>Usage Data</Text>
          <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
            • App usage statistics{'\n'}
            • Downloaded materials{'\n'}
            • Test attempts and scores{'\n'}
            • Time spent in app (for XP calculation)
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>How We Use Your Information</Text>
          <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
            We use the collected information to:{'\n\n'}
            • Provide and maintain our service{'\n'}
            • Personalize your experience{'\n'}
            • Track your progress and XP{'\n'}
            • Send important notifications{'\n'}
            • Improve our app and content{'\n'}
            • Analyze usage patterns
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Data Security</Text>
          <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
            We implement industry-standard security measures to protect your personal information:{'\n\n'}
            • Encrypted data transmission{'\n'}
            • Secure authentication system{'\n'}
            • Regular security audits{'\n'}
            • Limited access to personal data
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Data Sharing</Text>
          <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
            We DO NOT sell, trade, or rent your personal information to third parties. 
            We may share limited data only:{'\n\n'}
            • With your explicit consent{'\n'}
            • To comply with legal obligations{'\n'}
            • To protect our rights and safety
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Your Rights</Text>
          <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
            You have the right to:{'\n\n'}
            • Access your personal data{'\n'}
            • Request data correction{'\n'}
            • Delete your account{'\n'}
            • Opt-out of communications{'\n'}
            • Export your data
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Children's Privacy</Text>
          <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
            Our service is intended for students aged 13 and above. We do not knowingly 
            collect personal information from children under 13. If you are a parent or 
            guardian and believe your child has provided us with personal information, 
            please contact us.
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Contact Us</Text>
          <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
            If you have any questions about this Privacy Policy, please contact us at:{'\n\n'}
            Email: support@materialhubx.com
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
  subTitle: {
    ...Typography.bodyBold,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  sectionText: {
    ...Typography.body,
    lineHeight: 24,
  },
});
