import React from "react";
import { Redirect, Stack } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { ActivityIndicator, View } from "react-native";

export default function DashBoardsLayout() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // Redirect to login if no user is authenticated
  if (!user.userId) {
    return <Redirect href={"/(Auth)" as any} />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      {user.role === 'admin' ? (
        <Stack.Screen name="Admin" />
      ) : (
        <Stack.Screen name="Employee" />
      )}
    </Stack>
  );
}
