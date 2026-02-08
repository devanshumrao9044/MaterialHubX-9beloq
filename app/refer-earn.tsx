import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, Clipboard } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth, useAlert } from '@/template';
import { useApp } from '@/hooks/useApp';
import { useTheme, Spacing, Typography, BorderRadius } from '@/constants/theme';

export default function ReferEarnScreen() {
  const { isDarkMode } = useApp();
  const theme = useTheme(isDarkMode);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { showAlert } = useAlert();
  const [copied, setCopied] = useState(false);

  const referralCode = user?.id?.substring(0, 8).toUpperCase() || 'XXXXXXXX';
  const referralLink = `https://materialhubx.app/ref/${referralCode}`;

  const handleCopy = async () => {
    await Clipboard.setStringAsync(referralCode);
    setCopied(true);
    showAlert('Copied!', 'Referral code copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join Material Hub X using my referral code: ${referralCode}\n\nGet premium study materials for IIT JEE, NEET, and UPSC preparation!\n\nDownload: ${referralLink}`,
        title: 'Join Material Hub X',
      });
    } catch (error) {
      console.error('Share error:', error);
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
          <Text style={styles.headerTitle}>Refer & Earn</Text>
          <View style={{ width: 24 }} />
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={[styles.heroCard, { backgroundColor: theme.card }]}>
          <MaterialIcons name="card-giftcard" size={64} color={theme.primary} />
          <Text style={[styles.heroTitle, { color: theme.text }]}>Earn Rewards</Text>
          <Text style={[styles.heroDesc, { color: theme.textSecondary }]}>
            Invite your friends and earn 100 XP for each successful referral!
          </Text>
        </View>

        <View style={[styles.codeCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.codeLabel, { color: theme.textSecondary }]}>Your Referral Code</Text>
          <View style={styles.codeContainer}>
            <Text style={[styles.codeText, { color: theme.text }]}>{referralCode}</Text>
            <TouchableOpacity
              style={[styles.copyButton, { backgroundColor: theme.primary }]}
              onPress={handleCopy}
              activeOpacity={0.8}
            >
              <MaterialIcons 
                name={copied ? 'check' : 'content-copy'} 
                size={20} 
                color="#FFFFFF" 
              />
              <Text style={styles.copyText}>{copied ? 'Copied!' : 'Copy'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.shareButton, { backgroundColor: theme.primary }]}
          onPress={handleShare}
          activeOpacity={0.8}
        >
          <MaterialIcons name="share" size={24} color="#FFFFFF" />
          <Text style={styles.shareButtonText}>Share with Friends</Text>
        </TouchableOpacity>

        <View style={styles.benefitsContainer}>
          <Text style={[styles.benefitsTitle, { color: theme.text }]}>How it works</Text>
          
          <View style={styles.benefitItem}>
            <View style={[styles.benefitIcon, { backgroundColor: theme.primary }]}>
              <Text style={styles.benefitNumber}>1</Text>
            </View>
            <Text style={[styles.benefitText, { color: theme.text }]}>
              Share your unique referral code
            </Text>
          </View>

          <View style={styles.benefitItem}>
            <View style={[styles.benefitIcon, { backgroundColor: theme.primary }]}>
              <Text style={styles.benefitNumber}>2</Text>
            </View>
            <Text style={[styles.benefitText, { color: theme.text }]}>
              Friend signs up using your code
            </Text>
          </View>

          <View style={styles.benefitItem}>
            <View style={[styles.benefitIcon, { backgroundColor: theme.primary }]}>
              <Text style={styles.benefitNumber}>3</Text>
            </View>
            <Text style={[styles.benefitText, { color: theme.text }]}>
              You both earn 100 XP instantly
            </Text>
          </View>
        </View>

        <View style={[styles.statsCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.primary }]}>0</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Referrals</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.primary }]}>0 XP</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Earned</Text>
          </View>
        </View>
      </View>
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
    flex: 1,
    padding: Spacing.md,
  },
  heroCard: {
    alignItems: 'center',
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  heroTitle: {
    ...Typography.h2,
    marginTop: Spacing.md,
  },
  heroDesc: {
    ...Typography.body,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  codeCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  codeLabel: {
    ...Typography.caption,
    marginBottom: Spacing.sm,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  codeText: {
    ...Typography.h2,
    fontFamily: 'monospace',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    gap: 6,
  },
  copyText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    gap: 8,
  },
  shareButtonText: {
    color: '#FFFFFF',
    ...Typography.bodyBold,
  },
  benefitsContainer: {
    marginBottom: Spacing.lg,
  },
  benefitsTitle: {
    ...Typography.h3,
    marginBottom: Spacing.md,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  benefitIcon: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  benefitNumber: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  benefitText: {
    ...Typography.body,
    flex: 1,
  },
  statsCard: {
    flexDirection: 'row',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...Typography.h2,
    marginBottom: 4,
  },
  statLabel: {
    ...Typography.caption,
  },
  statDivider: {
    width: 1,
    marginHorizontal: Spacing.md,
  },
});
