import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/template';
import { useApp } from '@/hooks/useApp';
import { useTheme, Spacing, Typography, BorderRadius } from '@/constants/theme';

interface DrawerProps {
  visible: boolean;
  onClose: () => void;
}

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.8;

export function Drawer({ visible, onClose }: DrawerProps) {
  const theme = useTheme(useApp().isDarkMode);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { userProfile, totalXP } = useApp();
  const [slideAnim] = React.useState(new Animated.Value(-DRAWER_WIDTH));

  React.useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -DRAWER_WIDTH,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleNavigate = (route: string) => {
    onClose();
    setTimeout(() => router.push(route as any), 300);
  };

  const handleLogout = async () => {
    onClose();
    await logout();
    router.replace('/login');
  };

  const isAdmin = user?.email === 'admin@materialhubx.com';

  const menuItems = [
    { icon: 'receipt-long', label: 'My Orders', route: '/orders' },
    { icon: 'library-books', label: 'Library', route: '/library' },
    { icon: 'assignment', label: 'Test Series', route: '/test-series' },
    { icon: 'quiz', label: 'Quizzes', route: '/(tabs)/quiz' },
    { icon: 'settings', label: 'Settings', route: '/settings' },
    { icon: 'card-giftcard', label: 'Refer & Earn', route: '/refer-earn' },
    { icon: 'leaderboard', label: 'Leaderboard', route: '/leaderboard' },
    ...(isAdmin ? [
      { icon: 'admin-panel-settings', label: 'Admin Panel', route: '/admin' },
      { icon: 'store', label: 'Manage Store', route: '/admin/store' },
      { icon: 'shopping-bag', label: 'Manage Orders', route: '/admin/orders' },
    ] : []),
    { icon: 'help', label: 'Help & Support', route: '/help' },
    { icon: 'info', label: 'About Us', route: '/about' },
    { icon: 'privacy-tip', label: 'Privacy Policy', route: '/privacy' },
    { icon: 'description', label: 'Terms & Conditions', route: '/terms' },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        
        <Animated.View
          style={[
            styles.drawer,
            { backgroundColor: theme.background, transform: [{ translateX: slideAnim }] },
          ]}
        >
          <LinearGradient
            colors={theme.gradient}
            style={[styles.drawerHeader, { paddingTop: insets.top + Spacing.md }]}
          >
            <View style={styles.profileSection}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {userProfile?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                </Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>
                  {userProfile?.username || user?.email?.split('@')[0] || 'Student'}
                </Text>
                <Text style={styles.profileEmail}>{user?.email}</Text>
                <View style={styles.xpBadge}>
                  <MaterialIcons name="star" size={14} color="#FFD700" />
                  <Text style={styles.xpText}>{totalXP} XP</Text>
                </View>
              </View>
            </View>
          </LinearGradient>

          <View style={styles.menuContainer}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.menuItem, { borderBottomColor: theme.border }]}
                onPress={() => handleNavigate(item.route)}
                activeOpacity={0.7}
              >
                <MaterialIcons name={item.icon as any} size={24} color={theme.primary} />
                <Text style={[styles.menuLabel, { color: theme.text }]}>{item.label}</Text>
                <MaterialIcons name="chevron-right" size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={[styles.menuItem, styles.logoutItem]}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <MaterialIcons name="logout" size={24} color={theme.error} />
              <Text style={[styles.menuLabel, { color: theme.error }]}>Logout</Text>
              <MaterialIcons name="chevron-right" size={20} color={theme.error} />
            </TouchableOpacity>
          </View>

          <View style={[styles.footer, { borderTopColor: theme.border }]}>
            <Text style={[styles.footerText, { color: theme.textSecondary }]}>
              Material Hub X v1.0
            </Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  drawerHeader: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 6,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  xpText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  menuContainer: {
    flex: 1,
    paddingTop: Spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  menuLabel: {
    flex: 1,
    ...Typography.bodyBold,
    marginLeft: Spacing.md,
  },
  logoutItem: {
    marginTop: Spacing.md,
    borderBottomWidth: 0,
  },
  footer: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  footerText: {
    ...Typography.caption,
  },
});
