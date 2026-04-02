import { Image } from "expo-image";
import React from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Clock } from "lucide-react-native";
import { Colors } from "@/constants/theme";

export default function Header() {
  return (
    <SafeAreaView style={{ backgroundColor: Colors.light.buttonBackground }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-start',
          paddingHorizontal: 20,
          paddingVertical: 14,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.12,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        <Image
          source={require("../../../assets/images/uict-logo.png")}
          style={{ height: 44, width: 44 }}
          contentFit="contain"
        />
        <View style={{ marginLeft: 14 }}>
          <Text style={{ fontSize: 24, fontWeight: '800', color: Colors.light.buttonText, letterSpacing: 0.5 }}>
            AttendPay
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
            <Clock size={12} color='rgba(255, 255, 255, 0.85)' />
            <Text style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.85)', fontWeight: '500' }}>
              Attendance Management System
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
