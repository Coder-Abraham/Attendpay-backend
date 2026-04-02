import React from "react";
import { Stack, useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { ActivityIndicator, View } from "react-native";
export default function DashBoardsLayout() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // Redirect to login if no user is authenticated
  if (!user.userId) {
    router.replace('/(Auth)');
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}
