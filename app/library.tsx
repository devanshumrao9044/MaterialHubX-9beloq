import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Linking,
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
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

interface Material {
  id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_type: string;
  subject: string | null;
  chapter: string | null;
  created_at: string;
}

export default function LibraryScreen() {
  const theme = useTheme(useApp().isDarkMode);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { userProfile } = useApp();
  
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>('All');

  useEffect(() => {
    if (user) {
      loadMaterials();
    }
  }, [user, userProfile?.selected_batch_id]);

  const loadMaterials = async () => {
    try {
      const supabase = getSupabaseClient();
      
      let query = supabase
        .from('study_materials')
        .select('*')
        .order('created_at', { ascending: false });

      // Filter by user's selected batch
      if (userProfile?.selected_batch_id) {
        query = query.eq('batch_id', userProfile.selected_batch_id);
      }

      const { data, error } = await query;
      if (error) throw error;

      setMaterials(data || []);
    } catch (error) {
      console.error('Error loading materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (material: Material) => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to download materials', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Login', onPress: () => router.push('/login') },
      ]);
      return;
    }

    setDownloading(material.id);

    try {
      const supabase = getSupabaseClient();

      // Track download
      await supabase.from('downloads').insert({
        user_id: user.id,
        material_id: material.id,
      });

      // Download file
      const fileExtension = material.file_url.split('.').pop()?.split('?')[0] || 'file';
      const fileName = `${material.title.replace(/[^a-zA-Z0-9]/g, '_')}.${fileExtension}`;
      const fileUri = FileSystem.documentDirectory + fileName;

      const downloadResult = await FileSystem.downloadAsync(material.file_url, fileUri);

      if (downloadResult.status === 200) {
        // Share/Save the file
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(downloadResult.uri, {
            mimeType: material.file_type,
            dialogTitle: material.title,
          });
        } else {
          Alert.alert('Downloaded', `File saved to: ${downloadResult.uri}`);
        }
      } else {
        throw new Error('Download failed');
      }
    } catch (error: any) {
      console.error('Download error:', error);
      Alert.alert('Download Failed', error.message || 'Failed to download file');
    } finally {
      setDownloading(null);
    }
  };

  const handleView = async (material: Material) => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to view materials');
      return;
    }

    // For videos, open in a video player screen (you can create one)
    if (material.file_type.includes('video')) {
      Alert.alert('Video Player', 'Video player feature coming soon!', [
        { text: 'Download Instead', onPress: () => handleDownload(material) },
        { text: 'Cancel', style: 'cancel' },
      ]);
    } else {
      // For PDFs and images, open in browser or external app
      const supported = await Linking.canOpenURL(material.file_url);
      if (supported) {
        await Linking.openURL(material.file_url);
      } else {
        Alert.alert('Cannot Open', 'Cannot open this file type');
      }
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

  const subjects = ['All', ...Array.from(new Set(materials.map(m => m.subject).filter(Boolean)))];
  const filteredMaterials = selectedSubject === 'All' 
    ? materials 
    : materials.filter(m => m.subject === selectedSubject);

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
          <Text style={styles.headerTitle}>Library</Text>
          <TouchableOpacity onPress={() => router.push('/bookmarks')}>
            <MaterialIcons name="bookmark" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {subjects.length > 1 && (
          <View style={styles.subjectBar}>
            <FlatList
              horizontal
              data={subjects}
              keyExtractor={(item) => item}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.subjectChip,
                    selectedSubject === item && styles.subjectChipActive,
                  ]}
                  onPress={() => setSelectedSubject(item)}
                >
                  <Text
                    style={[
                      styles.subjectChipText,
                      selectedSubject === item && styles.subjectChipTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}
      </LinearGradient>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : filteredMaterials.length === 0 ? (
        <View style={styles.centerContainer}>
          <MaterialIcons name="library-books" size={64} color={theme.textSecondary} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>No Materials Yet</Text>
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            {!userProfile?.selected_batch_id
              ? 'Please select a batch from home screen'
              : 'Study materials will appear here once added'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredMaterials}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={[styles.materialCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.materialHeader}>
                <View style={[styles.fileIcon, { backgroundColor: `${getFileColor(item.file_type)}15` }]}>
                  <MaterialIcons
                    name={getFileIcon(item.file_type) as any}
                    size={32}
                    color={getFileColor(item.file_type)}
                  />
                </View>
                <View style={styles.materialInfo}>
                  <Text style={[styles.materialTitle, { color: theme.text }]}>{item.title}</Text>
                  {item.subject && (
                    <Text style={[styles.materialMeta, { color: theme.textSecondary }]}>
                      {item.subject}{item.chapter ? ` • ${item.chapter}` : ''}
                    </Text>
                  )}
                  {item.description && (
                    <Text style={[styles.materialDesc, { color: theme.textSecondary }]} numberOfLines={2}>
                      {item.description}
                    </Text>
                  )}
                </View>
              </View>

              <View style={styles.materialActions}>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: theme.primary }]}
                  onPress={() => handleView(item)}
                >
                  <MaterialIcons name="visibility" size={18} color="#FFFFFF" />
                  <Text style={styles.actionText}>View</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: theme.success }]}
                  onPress={() => handleDownload(item)}
                  disabled={downloading === item.id}
                >
                  {downloading === item.id ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <MaterialIcons name="download" size={18} color="#FFFFFF" />
                      <Text style={styles.actionText}>Download</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
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
    paddingBottom: Spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subjectBar: {
    marginTop: Spacing.sm,
  },
  subjectChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginRight: Spacing.sm,
  },
  subjectChipActive: {
    backgroundColor: '#FFFFFF',
  },
  subjectChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  subjectChipTextActive: {
    color: '#6C63FF',
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
  listContent: {
    padding: Spacing.md,
  },
  materialCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  materialHeader: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  fileIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  materialInfo: {
    flex: 1,
  },
  materialTitle: {
    ...Typography.bodyBold,
    marginBottom: 4,
  },
  materialMeta: {
    ...Typography.caption,
    marginBottom: 4,
  },
  materialDesc: {
    ...Typography.small,
  },
  materialActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    gap: 4,
    minHeight: 40,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
