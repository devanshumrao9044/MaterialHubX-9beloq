import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/hooks/useApp';
import { useTheme, Spacing, Typography, BorderRadius } from '@/constants/theme';

export default function AboutScreen() {
  const theme = useTheme(useApp().isDarkMode);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const features = [
    {
      icon: 'school',
      title: 'Quality Education',
      desc: 'Access top-quality study materials from leading institutes',
    },
    {
      icon: 'download',
      title: 'Offline Access',
      desc: 'Download materials and study anytime, anywhere',
    },
    {
      icon: 'assignment',
      title: 'Test Series',
      desc: 'Practice with comprehensive test series and quizzes',
    },
    {
      icon: 'leaderboard',
      title: 'Gamification',
      desc: 'Earn XP and compete on leaderboards',
    },
  ];

  const handleContactEmail = () => {
    Linking.openURL('mailto:support@materialhubx.com');
  };

  const handleWebsite = () => {
    Linking.openURL('https://materialhubx.com');
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
          <Text style={styles.headerTitle}>About Us</Text>
          <View style={{ width: 24 }} />
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.logoContainer}>
          <View style={[styles.logoCircle, { backgroundColor: theme.primary }]}>
            <MaterialIcons name="school" size={64} color="#FFFFFF" />
          </View>
          <Text style={[styles.appName, { color: theme.text }]}>Material Hub X</Text>
          <Text style={[styles.tagline, { color: theme.textSecondary }]}>
            Your Gateway to Success
          </Text>
          <Text style={[styles.version, { color: theme.textSecondary }]}>Version 1.0.0</Text>
        </View>

        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Our Mission</Text>
          <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
            Material Hub X is dedicated to empowering students preparing for competitive exams like IIT JEE, NEET, and UPSC. 
            We provide a comprehensive platform where students can access high-quality study materials, practice tests, 
            and track their progress - all in one place.
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Key Features</Text>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: `${theme.primary}15` }]}>
                <MaterialIcons name={feature.icon as any} size={24} color={theme.primary} />
              </View>
              <View style={styles.featureContent}>
                <Text style={[styles.featureTitle, { color: theme.text }]}>{feature.title}</Text>
                <Text style={[styles.featureDesc, { color: theme.textSecondary }]}>
                  {feature.desc}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Contact Us</Text>
          
          <TouchableOpacity style={styles.contactItem} onPress={handleContactEmail}>
            <MaterialIcons name="email" size={24} color={theme.primary} />
            <View style={styles.contactContent}>
              <Text style={[styles.contactLabel, { color: theme.textSecondary }]}>Email</Text>
              <Text style={[styles.contactValue, { color: theme.primary }]}>
                support@materialhubx.com
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={theme.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactItem} onPress={handleWebsite}>
            <MaterialIcons name="language" size={24} color={theme.primary} />
            <View style={styles.contactContent}>
              <Text style={[styles.contactLabel, { color: theme.textSecondary }]}>Website</Text>
              <Text style={[styles.contactValue, { color: theme.primary }]}>
                www.materialhubx.com
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.footer, { color: theme.textSecondary }]}>
          © 2026 Material Hub X. All rights reserved.
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
  logoContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  appName: {
    ...Typography.h1,
    marginBottom: Spacing.xs,
  },
  tagline: {
    ...Typography.body,
    marginBottom: Spacing.xs,
  },
  version: {
    ...Typography.caption,
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
  featureItem: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    ...Typography.bodyBold,
    marginBottom: 4,
  },
  featureDesc: {
    ...Typography.small,
    lineHeight: 18,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  contactContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  contactLabel: {
    ...Typography.caption,
    marginBottom: 2,
  },
  contactValue: {
    ...Typography.body,
    fontWeight: '600',
  },
  footer: {
    ...Typography.small,
    textAlign: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
});
