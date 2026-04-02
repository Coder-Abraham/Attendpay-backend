import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import "../global.css";

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useColorScheme } from 'react-native';

import { AuthProvider, useAuth } from '@/context/AuthContext';

function RootLayoutContent() {
  const colorScheme = useColorScheme();
  const { user } = useAuth();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        {user.userId ? (
          // Dashboard Stack - Shown when user is authenticated
          <Stack.Screen name="(DashBoards)" options={{ headerShown: false }} />
        ) : (
          // Auth Stack - Shown when user is not authenticated
          <Stack.Screen name="(Auth)" options={{ headerShown: false }} />
        )}
      </Stack>
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
