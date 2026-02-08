import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/hooks/useApp';
import { useTheme, Spacing, Typography, BorderRadius } from '@/constants/theme';

export default function InstituteSelectionScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { institutes, selectedInstitute, selectInstitute } = useApp();

  useEffect(() => {
    if (selectedInstitute) {
      router.replace('/(tabs)');
    }
  }, [selectedInstitute]);

  const handleSelect = async (instituteId: string) => {
    await selectInstitute(instituteId);
    router.replace('/(tabs)');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <LinearGradient
        colors={theme.gradient}
        style={[styles.header, { paddingTop: insets.top + Spacing.md }]}
      >
        <MaterialIcons name="school" size={48} color="#FFFFFF" />
        <Text style={styles.headerTitle}>Choose Your Institute</Text>
        <Text style={styles.headerSubtitle}>Select the study material source</Text>
      </LinearGradient>

      <FlatList
        data={institutes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.instituteCard, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => handleSelect(item.id)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, { backgroundColor: theme.primary }]}>
              <MaterialIcons name="school" size={32} color="#FFFFFF" />
            </View>
            <View style={styles.instituteInfo}>
              <Text style={[styles.instituteName, { color: theme.text }]}>{item.name}</Text>
              <Text style={[styles.instituteDesc, { color: theme.textSecondary }]}>
                Comprehensive study materials
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={theme.textSecondary} />
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: Spacing.md,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: Spacing.xs,
  },
  listContent: {
    padding: Spacing.md,
  },
  instituteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  instituteInfo: {
    flex: 1,
  },
  instituteName: {
    ...Typography.h3,
    marginBottom: 4,
  },
  instituteDesc: {
    ...Typography.caption,
  },
});
