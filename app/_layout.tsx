import { Stack } from 'expo-router';
import { AuthProvider, AlertProvider } from '@/template';
import { AppProvider } from '@/contexts/AppContext';

export default function RootLayout() {
  return (
    <AlertProvider>
      <AuthProvider>
        <AppProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="login" />
            <Stack.Screen name="institute-selection" />
            <Stack.Screen name="settings" />
            <Stack.Screen name="refer-earn" />
            <Stack.Screen name="leaderboard" />
            <Stack.Screen name="library" />
            <Stack.Screen name="test-series" />
            <Stack.Screen name="downloads" />
            <Stack.Screen name="doubts" />
            <Stack.Screen name="bookmarks" />
            <Stack.Screen name="admin" />
            <Stack.Screen name="about" />
            <Stack.Screen name="help" />
            <Stack.Screen name="privacy" />
            <Stack.Screen name="terms" />
          </Stack>
        </AppProvider>
      </AuthProvider>
    </AlertProvider>
  );
}
