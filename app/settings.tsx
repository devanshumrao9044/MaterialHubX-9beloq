import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/hooks/useApp';
import { useTheme, Spacing, Typography, BorderRadius } from '@/constants/theme';

export default function SettingsScreen() {
  const { isDarkMode, toggleTheme } = useApp();
  const theme = useTheme(isDarkMode);
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
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={{ width: 24 }} />
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>APPEARANCE</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <MaterialIcons 
                name={isDarkMode ? 'dark-mode' : 'light-mode'} 
                size={24} 
                color={theme.primary} 
              />
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: theme.text }]}>Dark Mode</Text>
                <Text style={[styles.settingDesc, { color: theme.textSecondary }]}>
                  {isDarkMode ? 'Dark theme enabled' : 'Light theme enabled'}
                </Text>
              </View>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>NOTIFICATIONS</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <MaterialIcons name="notifications" size={24} color={theme.primary} />
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: theme.text }]}>Push Notifications</Text>
                <Text style={[styles.settingDesc, { color: theme.textSecondary }]}>
                  Coming soon
                </Text>
              </View>
            </View>
            <Switch
              value={false}
              disabled
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>PRIVACY</Text>
          
          <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
            <View style={styles.settingLeft}>
              <MaterialIcons name="privacy-tip" size={24} color={theme.primary} />
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: theme.text }]}>Privacy Policy</Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={20} color={theme.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
            <View style={styles.settingLeft}>
              <MaterialIcons name="description" size={24} color={theme.primary} />
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: theme.text }]}>Terms & Conditions</Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={20} color={theme.textSecondary} />
          </TouchableOpacity>
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
  section: {
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  sectionTitle: {
    ...Typography.small,
    fontWeight: '600',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingInfo: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  settingLabel: {
    ...Typography.bodyBold,
    marginBottom: 2,
  },
  settingDesc: {
    ...Typography.caption,
  },
});
