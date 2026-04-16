import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, Alert, ScrollView, ImageBackground,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Mail, Lock, Check, Building2, CheckCircle, IdCard } from 'lucide-react-native';
// @ts-ignore
import ShieldAlert from 'lucide-react-native/dist/cjs/icons/shield-alert';
// @ts-ignore
import Phone from 'lucide-react-native/dist/cjs/icons/phone';
// @ts-ignore
import ScanQrCode from 'lucide-react-native/dist/cjs/icons/scan-qr-code';
// @ts-ignore
import ArrowLeft from 'lucide-react-native/dist/cjs/icons/arrow-left';
import Header from '@/components/Header';
import { BG_IMAGE, Colors } from '@/constants/theme';
import { EmployeeRegistrationQRData } from '@/types/Admin';
import { CameraView, useCameraPermissions } from 'expo-camera';

// Steps: 0 = QR Scan, 1 = Personal Info, 2 = Security, 3 = Review
type Step = 0 | 1 | 2 | 3;

const STEP_LABELS = ['Scan QR', 'Your Info', 'Security', 'Review'];

export default function SignUpScreen() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(0);

  // QR scan state
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orgData, setOrgData] = useState<EmployeeRegistrationQRData | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // ── QR Scan 
  const handleQRScanned = (result: any) => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const data = JSON.parse(result.data) as EmployeeRegistrationQRData;
      if (data.type !== 'employee-registration') {
        Alert.alert('Invalid QR', 'This QR code is not a registration code. Please ask your admin for the correct one.', [
          { text: 'Try Again', onPress: () => setIsProcessing(false) },
        ]);
        return;
      }
      // Check expiry
      if (new Date(data.expiresAt) < new Date()) {
        Alert.alert('QR Expired', 'This registration QR code has expired. Please ask your admin to generate a new one.', [
          { text: 'OK', onPress: () => setIsProcessing(false) },
        ]);
        return;
      }
      setOrgData(data);
      setIsScanning(false);
      setStep(1);
    } catch {
      Alert.alert('Invalid QR', 'Could not read this QR code. Make sure you are scanning the registration QR from your admin.', [
        { text: 'Try Again', onPress: () => setIsProcessing(false) },
      ]);
    }
  };

  // Navigation 

  const handleNext = () => {
    if (step === 1) {
      if (!name.trim()) { Alert.alert('Required', 'Please enter your full name'); return; }
      if (!email.includes('@')) { Alert.alert('Required', 'Please enter a valid email address'); return; }
      if (!phone.trim()) { Alert.alert('Required', 'Please enter your phone number'); return; }
      if (!employeeId.trim()) { Alert.alert('Required', 'Please enter your Employee ID'); return; }
      setStep(2);
    } else if (step === 2) {
      if (password.length < 6) { Alert.alert('Error', 'Password must be at least 6 characters'); return; }
      if (password !== confirmPassword) { Alert.alert('Error', 'Passwords do not match'); return; }
      setStep(3);
    } else if (step === 3) {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step === 0) { router.back(); return; }
    if (step === 1) { setStep(0); setIsScanning(true); setIsProcessing(false); setOrgData(null); return; }
    setStep((s) => (s - 1) as Step);
  };

  //  Submit 
  const handleSubmit = async () => {
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      Alert.alert('Account Created!', `Welcome to ${orgData?.organizationName}. Your account has been created. Please wait for admin approval before logging in.`, [
        { text: 'Go to Login', onPress: () => router.replace('/(Auth)/Home' as any) },
      ]);
    } catch {
      Alert.alert('Error', 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Shared style
  const inputStyle = {
    backgroundColor: Colors.light.cardBackground,
    borderWidth: 2,
    borderColor: Colors.light.inputBorder,
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: Colors.light.text,
    fontWeight: '500' as const,
  };

  const labelStyle = { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 6, marginBottom: 8 };
  const labelText = { fontSize: 14, fontWeight: '700' as const, color: Colors.light.background };

  //  Step 0: QR Scanner 
  if (step === 0) {
    if (!permission) {
      return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#fff" />
        </SafeAreaView>
      );
    }
    if (!permission.granted) {
      return (
        <ImageBackground source={BG_IMAGE} resizeMode="cover" style={{ flex: 1 }}>
          <SafeAreaView style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <Header />
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, gap: 20 }}>
              <ShieldAlert size={64} color={Colors.light.warning} />
              <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#fff', textAlign: 'center' }}>Camera Access Needed</Text>
              <Text style={{ fontSize: 15, color: 'rgba(232,244,255,0.85)', textAlign: 'center', lineHeight: 22 }}>
                To scan your registration QR code, we need access to your camera.
              </Text>
              <TouchableOpacity onPress={requestPermission}
                style={{ backgroundColor: Colors.light.buttonBackground, paddingVertical: 14, paddingHorizontal: 32, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <ScanQrCode size={20} color="#fff" />
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Grant Camera Access</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={{ color: 'rgba(232,244,255,0.7)', fontSize: 14 }}>Go Back</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </ImageBackground>
      );
    }

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
        {/* Camera fills screen */}
        <CameraView
          style={{ flex: 1 }}
          onBarcodeScanned={handleQRScanned}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        />

        {/* Overlay UI */}
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'space-between' }}>
          {/* Top bar */}
          <View style={{ backgroundColor: 'rgba(0,0,0,0.6)', paddingTop: 16, paddingBottom: 20, paddingHorizontal: 20, gap: 12 }}>
            <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <ArrowLeft size={20} color="#fff" />
              <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600' }}>Back to Login</Text>
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <ScanQrCode size={24} color={Colors.light.buttonBackground} />
              <View>
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>Scan Registration QR</Text>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Ask your admin for the registration QR code</Text>
              </View>
            </View>
          </View>

          {/* Scan frame */}
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: 240, height: 240, position: 'relative' }}>
              {/* Corner markers */}
              {[
                { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4 },
                { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4 },
                { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4 },
                { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4 },
              ].map((style, i) => (
                <View key={i} style={{ position: 'absolute', width: 36, height: 36, borderColor: Colors.light.buttonBackground, ...style }} />
              ))}
            </View>
          </View>

          {/* Bottom hint */}
          <View style={{ backgroundColor: 'rgba(0,0,0,0.6)', padding: 24, alignItems: 'center', gap: 8 }}>
            {isProcessing
              ? <ActivityIndicator size="large" color={Colors.light.buttonBackground} />
              : <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, textAlign: 'center' }}>
                  Point your camera at the QR code displayed by your administrator
                </Text>
            }
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Steps 1–3: Form 
  return (
    <ImageBackground source={BG_IMAGE} resizeMode="cover" style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Header />
          <View style={{ padding: 24, gap: 24 }}>

            {/* Org badge — shown after scan */}
            {orgData && (
              <View style={{ backgroundColor: 'rgba(0,128,225,0.15)', borderWidth: 1.5, borderColor: Colors.light.buttonBackground, borderRadius: 10, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <CheckCircle size={18} color={Colors.light.buttonBackground} />
                <View>
                  <Text style={{ color: Colors.light.background, fontWeight: '700', fontSize: 13 }}>{orgData.organizationName}</Text>
                  <Text style={{ color: 'rgba(232,244,255,0.7)', fontSize: 11 }}>Code: {orgData.registrationCode}</Text>
                </View>
              </View>
            )}

            {/* Progress bar */}
            <View style={{ gap: 8 }}>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {STEP_LABELS.slice(1).map((label, i) => (
                  <View key={i} style={{ flex: 1, gap: 4 }}>
                    <View style={{ height: 5, borderRadius: 3, backgroundColor: step > i + 1 ? Colors.light.success : step === i + 1 ? Colors.light.buttonBackground : 'rgba(255,255,255,0.25)' }} />
                    <Text style={{ fontSize: 10, color: step >= i + 1 ? Colors.light.background : 'rgba(255,255,255,0.4)', textAlign: 'center', fontWeight: '600' }}>{label}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Step 1: Personal Info */}
            {step === 1 && (
              <View style={{ gap: 16 }}>
                <Text style={{ fontSize: 26, fontWeight: 'bold', color: Colors.light.background }}>Your Details</Text>
                <Text style={{ fontSize: 14, color: 'rgba(232,244,255,0.8)' }}>Fill in your personal information</Text>

                <View>
                  <View style={labelStyle}><User size={16} color={Colors.light.background} /><Text style={labelText}>Full Name</Text></View>
                  <TextInput placeholder="e.g. Katandi Abraham" value={name} onChangeText={setName} placeholderTextColor="rgba(176,212,232,0.5)" style={inputStyle} />
                </View>
                <View>
                  <View style={labelStyle}><Mail size={16} color={Colors.light.background} /><Text style={labelText}>Email Address</Text></View>
                  <TextInput placeholder="someone@company.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholderTextColor="rgba(176,212,232,0.5)" style={inputStyle} />
                </View>
                <View>
                  <View style={labelStyle}><Phone size={16} color={Colors.light.background} /><Text style={labelText}>Phone Number</Text></View>
                  <TextInput placeholder="+256 7123 456 78" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholderTextColor="rgba(176,212,232,0.5)" style={inputStyle} />
                </View>
                <View>
                  <View style={labelStyle}><IdCard size={16} color={Colors.light.background} /><Text style={labelText}>Employee ID</Text></View>
                  <TextInput placeholder="e.g, EMP005" value={employeeId} onChangeText={setEmployeeId} autoCapitalize="characters" placeholderTextColor="rgba(176,212,232,0.5)" style={inputStyle} />
                  <Text style={{ fontSize: 11, color: 'rgba(232,244,255,0.6)', marginTop: 6 }}>Your Employee ID will be assigned by your admin</Text>
                </View>
              </View>
            )}

            {/* Step 2: Security */}
            {step === 2 && (
              <View style={{ gap: 16 }}>
                <Text style={{ fontSize: 26, fontWeight: 'bold', color: Colors.light.background }}>Set Password</Text>
                <Text style={{ fontSize: 14, color: 'rgba(232,244,255,0.8)' }}>Create a secure password for your account</Text>

                <View>
                  <View style={labelStyle}><Lock size={16} color={Colors.light.background} /><Text style={labelText}>Password</Text></View>
                  <View style={{ ...inputStyle, flexDirection: 'row', alignItems: 'center', padding: 0, paddingHorizontal: 14 }}>
                    <TextInput
                      placeholder="At least 6 characters"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      placeholderTextColor="rgba(176,212,232,0.5)"
                      style={{ flex: 1, paddingVertical: 14, fontSize: 15, color: Colors.light.text }}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(p => !p)}>
                      <Text style={{ color: Colors.light.icon, fontSize: 12, fontWeight: '600' }}>{showPassword ? 'HIDE' : 'SHOW'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View>
                  <View style={labelStyle}><Check size={16} color={Colors.light.background} /><Text style={labelText}>Confirm Password</Text></View>
                  <TextInput
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showPassword}
                    placeholderTextColor="rgba(176,212,232,0.5)"
                    style={inputStyle}
                  />
                </View>
              </View>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <View style={{ gap: 16 }}>
                <Text style={{ fontSize: 26, fontWeight: 'bold', color: Colors.light.background }}>Review & Confirm</Text>
                <Text style={{ fontSize: 14, color: 'rgba(232,244,255,0.8)' }}>Make sure everything looks correct</Text>

                <View style={{ backgroundColor: Colors.light.cardBackground, borderRadius: 14, padding: 20, gap: 14, elevation: 4 }}>
                  {[
                    { label: 'Full Name', value: name, icon: <User size={14} color={Colors.light.icon} /> },
                    { label: 'Email', value: email, icon: <Mail size={14} color={Colors.light.icon} /> },
                    { label: 'Phone', value: phone, icon: <Phone size={14} color={Colors.light.icon} /> },
                    { label: 'Employee ID', value: employeeId, icon: <IdCard size={14} color={Colors.light.icon} /> },
                    { label: 'Organization', value: orgData?.organizationName ?? '—', icon: <Building2 size={14} color={Colors.light.icon} /> },
                  ].map(({ label, value, icon }) => (
                    <View key={label} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: Colors.light.divider }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        {icon}
                        <Text style={{ color: Colors.light.icon, fontSize: 13, fontWeight: '500' }}>{label}:</Text>
                      </View>
                      <Text style={{ fontWeight: '700', color: Colors.light.text, fontSize: 14, maxWidth: '55%', textAlign: 'right' }}>{value}</Text>
                    </View>
                  ))}
                </View>

                <View style={{ backgroundColor: 'rgba(245,158,11,0.12)', borderWidth: 1.5, borderColor: Colors.light.warning, borderRadius: 10, padding: 14, flexDirection: 'row', gap: 10 }}>
                  <ShieldAlert size={18} color={Colors.light.warning} />
                  <Text style={{ flex: 1, color: 'rgba(232,244,255,0.85)', fontSize: 13, lineHeight: 20 }}>
                    Your account will be reviewed by an administrator before you can log in.
                  </Text>
                </View>
              </View>
            )}

            {/* Navigation Buttons */}
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
              <TouchableOpacity onPress={handleBack} disabled={loading}
                style={{ flex: 1, paddingVertical: 14, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: Colors.light.background, backgroundColor: 'rgba(255,255,255,0.08)', flexDirection: 'row', gap: 6, opacity: loading ? 0.5 : 1 }}>
                <ArrowLeft size={16} color={Colors.light.background} />
                <Text style={{ color: Colors.light.background, fontWeight: '700', fontSize: 15 }}>Back</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleNext} disabled={loading}
                style={{ flex: 2, paddingVertical: 14, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: loading ? Colors.light.icon : Colors.light.buttonBackground, flexDirection: 'row', gap: 8, opacity: loading ? 0.9 : 1, elevation: 4 }}>
                {loading ? (
                  <>
                    <ActivityIndicator color="#fff" size="small" />
                    <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Creating...</Text>
                  </>
                ) : (
                  <>
                    {step === 3 && <CheckCircle size={18} color="#fff" />}
                    <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
                      {step === 3 ? 'Create Account' : 'Continue'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}
