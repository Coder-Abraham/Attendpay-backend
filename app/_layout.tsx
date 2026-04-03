import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';

import { Redirect, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';

import { AuthProvider, useAuth } from '@/context/AuthContext';

function RootLayoutContent() {
  const colorScheme = useColorScheme();
  const { user } = useAuth();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(Auth)" />
        <Stack.Screen name="(DashBoards)" />
      </Stack>
      {!user.userId && <Redirect href="/(Auth)/Home" />}
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
