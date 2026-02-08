import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
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

interface Bookmark {
  id: string;
  created_at: string;
  study_materials: {
    id: string;
    title: string;
    file_type: string;
    file_url: string;
    subject: string | null;
    chapter: string | null;
  };
}

export default function BookmarksScreen() {
  const theme = useTheme(useApp().isDarkMode);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadBookmarks();
    }
  }, [user]);

  const loadBookmarks = async () => {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('bookmarks')
        .select(`
          id,
          created_at,
          study_materials (
            id,
            title,
            file_type,
            file_url,
            subject,
            chapter
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookmarks(data || []);
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBookmark = async (bookmarkId: string) => {
    Alert.alert(
      'Remove Bookmark',
      'Are you sure you want to remove this bookmark?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setRemoving(bookmarkId);
            try {
              const supabase = getSupabaseClient();
              const { error } = await supabase
                .from('bookmarks')
                .delete()
                .eq('id', bookmarkId);

              if (error) throw error;
              loadBookmarks();
            } catch (error: any) {
              console.error('Error removing bookmark:', error);
              Alert.alert('Error', error.message || 'Failed to remove bookmark');
            } finally {
              setRemoving(null);
            }
          },
        },
      ]
    );
  };

  const handleOpenMaterial = async (fileUrl: string) => {
    const supported = await Linking.canOpenURL(fileUrl);
    if (supported) {
      await Linking.openURL(fileUrl);
    } else {
      Alert.alert('Error', 'Cannot open this file');
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
          <Text style={styles.headerTitle}>Bookmarks</Text>
          <View style={{ width: 24 }} />
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : bookmarks.length === 0 ? (
        <View style={styles.centerContainer}>
          <MaterialIcons name="bookmark-border" size={64} color={theme.textSecondary} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>No Bookmarks</Text>
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            Bookmark important materials for quick access
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
          data={bookmarks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.bookmarkCard, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => handleOpenMaterial(item.study_materials.file_url)}
            >
              <View style={styles.bookmarkHeader}>
                <View style={[styles.fileIcon, { backgroundColor: `${getFileColor(item.study_materials.file_type)}15` }]}>
                  <MaterialIcons
                    name={getFileIcon(item.study_materials.file_type) as any}
                    size={28}
                    color={getFileColor(item.study_materials.file_type)}
                  />
                </View>
                <View style={styles.bookmarkInfo}>
                  <Text style={[styles.bookmarkTitle, { color: theme.text }]}>
                    {item.study_materials.title}
                  </Text>
                  {item.study_materials.subject && (
                    <Text style={[styles.bookmarkMeta, { color: theme.textSecondary }]}>
                      {item.study_materials.subject}
                      {item.study_materials.chapter ? ` • ${item.study_materials.chapter}` : ''}
                    </Text>
                  )}
                  <Text style={[styles.bookmarkDate, { color: theme.textSecondary }]}>
                    Bookmarked {formatDate(item.created_at)}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => handleRemoveBookmark(item.id)}
                disabled={removing === item.id}
              >
                {removing === item.id ? (
                  <ActivityIndicator size="small" color={theme.error} />
                ) : (
                  <MaterialIcons name="bookmark" size={24} color={theme.primary} />
                )}
              </TouchableOpacity>
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
  bookmarkCard: {
    flexDirection: 'row',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  bookmarkHeader: {
    flex: 1,
    flexDirection: 'row',
  },
  fileIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  bookmarkInfo: {
    flex: 1,
  },
  bookmarkTitle: {
    ...Typography.bodyBold,
    marginBottom: 4,
  },
  bookmarkMeta: {
    ...Typography.caption,
    marginBottom: 2,
  },
  bookmarkDate: {
    ...Typography.small,
  },
  removeBtn: {
    padding: Spacing.sm,
  },
});
