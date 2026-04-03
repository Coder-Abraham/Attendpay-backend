import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { useEffect } from 'react';

import { AuthProvider, useAuth } from '@/context/AuthContext';

function RootLayoutContent() {
  const colorScheme = useColorScheme();
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user.userId) {
      router.replace('/(Auth)/Home' as any);
    }
  }, [user.userId]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutContent />
    </AuthProvider>
  );
}
