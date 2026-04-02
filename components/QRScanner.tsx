import { CameraView, useCameraPermissions } from "expo-camera";
import React, { useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface QRScannerProps {
  onQRScanned: (data: string) => void;
  onClose: () => void;
}

const QRScanner: React.FC<QRScannerProps> = ({
  onQRScanned,
  onClose,
}: QRScannerProps) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);

  const isPermissionGranted = Boolean(permission?.granted);

  const handleBarcodeScanned = (result: any) => {
    if (isProcessing) return;

    setIsProcessing(true);
    onQRScanned(result.data);

    setTimeout(() => {
      onClose();
    }, 500);
  };

  if (!permission) {
    return (
      <SafeAreaView className="flex-1 bg-black">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      </SafeAreaView>
    );
  }

  if (!isPermissionGranted) {
    return (
      <SafeAreaView className="flex-1 bg-black">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-white text-lg font-bold mb-4 text-center">
            Camera permission required
          </Text>
          <Text className="text-gray-300 text-center mb-8">
            We need access to your camera to scan QR codes
          </Text>
          <TouchableOpacity
            onPress={requestPermission}
            className="bg-blue-600 px-8 py-3 rounded-lg mb-4"
          >
            <Text className="text-white font-semibold text-center">
              Grant Permission
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} className="px-8 py-3">
            <Text className="text-gray-400 font-semibold text-center">
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="flex-1">
        <CameraView
          onBarcodeScanned={handleBarcodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
          className="flex-1"
        />
        <View className="absolute top-4 left-0 right-0 bg-black/50 px-4 py-3">
          <Text className="text-white text-center font-semibold">
            Scan QR Code from Device/Screen
          </Text>
        </View>
        <TouchableOpacity
          onPress={onClose}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-red-600 px-8 py-3 rounded-full"
        >
          <Text className="text-white font-semibold">Close Scanner</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default QRScanner;
