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

  if (!user.userId) {
    return <Redirect href="/(Auth)/Home" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
