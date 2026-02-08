import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/template';
import { useApp } from '@/hooks/useApp';
import { useTheme, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { getSupabaseClient } from '@/template';

interface Download {
  id: string;
  downloaded_at: string;
  material_id: string;
  study_materials: {
    title: string;
    file_type: string;
    file_url: string;
    subject: string | null;
  };
}

export default function DownloadsScreen() {
  const theme = useTheme(useApp().isDarkMode);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  
  const [downloads, setDownloads] = useState<Download[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDownloads();
    }
  }, [user]);

  const loadDownloads = async () => {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('downloads')
        .select(`
          id,
          downloaded_at,
          material_id,
          study_materials (
            title,
            file_type,
            file_url,
            subject
          )
        `)
        .eq('user_id', user?.id)
        .order('downloaded_at', { ascending: false });

      if (error) throw error;
      setDownloads(data || []);
    } catch (error) {
      console.error('Error loading downloads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenFile = async (fileUrl: string) => {
    const supported = await Linking.canOpenURL(fileUrl);
    if (supported) {
      await Linking.openURL(fileUrl);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return 'picture-as-pdf';
    if (fileType.includes('video')) return 'video-library';
    if (fileType.includes('image')) return 'image';
    return 'insert-drive-file';
  };

  const getFileColor = (fileType: string) => {
    if (fileType.includes('pdf')) return '#E53935';
    if (fileType.includes('video')) return '#8B5CF6';
    if (fileType.includes('image')) return '#4CAF50';
    return theme.textSecondary;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
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
          <Text style={styles.headerTitle}>My Downloads</Text>
          <View style={{ width: 24 }} />
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : downloads.length === 0 ? (
        <View style={styles.centerContainer}>
          <MaterialIcons name="download" size={64} color={theme.textSecondary} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>No Downloads Yet</Text>
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            Downloaded study materials will appear here
          </Text>
          <TouchableOpacity
            style={[styles.browseBtn, { backgroundColor: theme.primary }]}
            onPress={() => router.push('/library')}
          >
            <Text style={styles.browseBtnText}>Browse Library</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={downloads}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.downloadCard, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => handleOpenFile(item.study_materials.file_url)}
            >
              <View style={[styles.fileIcon, { backgroundColor: `${getFileColor(item.study_materials.file_type)}15` }]}>
                <MaterialIcons
                  name={getFileIcon(item.study_materials.file_type) as any}
                  size={28}
                  color={getFileColor(item.study_materials.file_type)}
                />
              </View>
              <View style={styles.downloadInfo}>
                <Text style={[styles.downloadTitle, { color: theme.text }]}>
                  {item.study_materials.title}
                </Text>
                {item.study_materials.subject && (
                  <Text style={[styles.downloadSubject, { color: theme.textSecondary }]}>
                    {item.study_materials.subject}
                  </Text>
                )}
                <Text style={[styles.downloadDate, { color: theme.textSecondary }]}>
                  Downloaded on {formatDate(item.downloaded_at)}
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={theme.textSecondary} />
            </TouchableOpacity>
          )}
        />
      )}
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
  browseBtn: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  browseBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    padding: Spacing.md,
  },
  downloadCard: {
    flexDirection: 'row',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  fileIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  downloadInfo: {
    flex: 1,
  },
  downloadTitle: {
    ...Typography.bodyBold,
    marginBottom: 4,
  },
  downloadSubject: {
    ...Typography.caption,
    marginBottom: 2,
  },
  downloadDate: {
    ...Typography.small,
  },
});
