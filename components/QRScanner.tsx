import { CameraView, useCameraPermissions } from "expo-camera";
import React, { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface QRScannerProps {
  onQRScanned: (data: string) => void;
  onClose: () => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onQRScanned, onClose }) => {
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
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      </SafeAreaView>
    );
  }

  if (!isPermissionGranted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionTitle}>Camera permission required</Text>
          <Text style={styles.permissionSubtitle}>
            We need access to your camera to scan QR codes
          </Text>
          <TouchableOpacity onPress={requestPermission} style={styles.grantButton}>
            <Text style={styles.grantButtonText}>Grant Permission</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.cameraContainer}>
        <CameraView
          onBarcodeScanned={handleBarcodeScanned}
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.overlay}>
          <Text style={styles.overlayText}>Scan QR Code from Device/Screen</Text>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>Close Scanner</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  permissionContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  permissionTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  permissionSubtitle: { color: '#d1d5db', textAlign: 'center', marginBottom: 32 },
  grantButton: { backgroundColor: '#2563eb', paddingHorizontal: 32, paddingVertical: 12, borderRadius: 8, marginBottom: 16 },
  grantButtonText: { color: '#fff', fontWeight: '600', textAlign: 'center' },
  cancelButton: { paddingHorizontal: 32, paddingVertical: 12 },
  cancelButtonText: { color: '#9ca3af', fontWeight: '600', textAlign: 'center' },
  cameraContainer: { flex: 1 },
  overlay: { position: 'absolute', top: 16, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 16, paddingVertical: 12 },
  overlayText: { color: '#fff', textAlign: 'center', fontWeight: '600' },
  closeButton: { position: 'absolute', bottom: 24, alignSelf: 'center', backgroundColor: '#dc2626', paddingHorizontal: 32, paddingVertical: 12, borderRadius: 9999 },
  closeButtonText: { color: '#fff', fontWeight: '600' },
});

export default QRScanner;
