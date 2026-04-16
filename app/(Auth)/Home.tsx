import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Hand, IdCard, Lightbulb, Unlock, Plus, Lock } from 'lucide-react-native';
// @ts-ignore - individual icon imports for icons not in named exports
import Eye from 'lucide-react-native/dist/cjs/icons/eye';
// @ts-ignore
import EyeOff from 'lucide-react-native/dist/cjs/icons/eye-off';
import Header from '@/components/Header';
import { useAuth } from '@/context/AuthContext';
import { BG_IMAGE, Colors } from '@/constants/theme';

export default function Home() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!employeeId.trim()) {
      Alert.alert('Error', 'Please enter your Employee ID');
      return;
    }
    if (!password.trim()) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    try {
      const role = await login(employeeId, password);
      if (role === 'admin') {
        router.replace('/(DashBoards)/Admin' as any);
      } else {
        router.replace('/(DashBoards)/Employee' as any);
      }
    } catch {
      alert('Login Failed: Employee ID not found. Please try again.');
    }
  };

  return (
    <ImageBackground
      source={BG_IMAGE}
      resizeMode="cover"
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
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
            <Header variant="transparent" />
        
        <View style={{ padding: 28, justifyContent: 'center', flex: 1, gap: 2 }}>
       
       
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
         
         
              <Hand size={36} color={Colors.light.background} />
              <Text style={{ fontSize: 36, fontWeight: 'bold', color: Colors.light.background, letterSpacing: -0.5 }}>
                Welcome Back!
              </Text>
            </View>
            <Text style={{ fontSize: 15, color: 'rgba(232, 244, 255, 0.95)', lineHeight: 22 }}>
              Enter your Employee ID to access the system
            </Text>
          </View>

          {/* Input Form */}
          <View style={{ gap: 18 }}>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                
                <IdCard size={18} color={Colors.light.background} />
                <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.light.background }}>
                  Employee ID
                </Text>
              </View>
              <TextInput
                placeholder="e.g., EMP001"
                value={employeeId}
                onChangeText={setEmployeeId}
                editable={!isLoading}
                placeholderTextColor="rgba(176, 212, 232, 0.6)"
                style={{
                  backgroundColor: Colors.light.cardBackground,
                  borderWidth: 2,
                  borderColor: Colors.light.inputBorder,
                  borderRadius: 12,
                  padding: 14,
                  fontSize: 15,
                  color: Colors.light.text,
                  fontWeight: '500',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.08,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              />
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}>
                <Lightbulb size={14} color='rgba(232, 244, 255, 0.8)' />
                <Text style={{ fontSize: 12, color: 'rgba(232, 244, 255, 0.8)', fontWeight: '500' }}>
                  E.g: EMP001, EMP002, or ADM001
                </Text>
              </View>
            </View>

            {/* Password Field */}
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <Lock size={18} color={Colors.light.background} />
                <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.light.background }}>
                  Password
                </Text>
              </View>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: Colors.light.cardBackground,
                borderWidth: 2,
                borderColor: Colors.light.inputBorder,
                borderRadius: 12,
                paddingHorizontal: 14,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 4,
                elevation: 2,
              }}>
                <TextInput
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  editable={!isLoading}
                  placeholderTextColor="rgba(176, 212, 232, 0.6)"
                  style={{
                    flex: 1,
                    paddingVertical: 14,
                    fontSize: 15,
                    color: Colors.light.text,
                    fontWeight: '500',
                  }}
                />
                <TouchableOpacity onPress={() => setShowPassword(p => !p)} style={{ padding: 4 }}>
                  {showPassword
                    ? <EyeOff size={20} color={Colors.light.icon} />
                    : <Eye size={20} color={Colors.light.icon} />
                  }
                </TouchableOpacity>
              </View>
            </View>

           
            {/* Login Button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={isLoading}
              style={{
                backgroundColor: isLoading ? Colors.light.icon : Colors.light.buttonBackground,
                paddingVertical: 14,
                borderRadius: 12,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 10,
                opacity: isLoading ? 0.9 : 1,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 6,
                elevation: 4,
              }}
            >
              {isLoading ? (
                <>
                  <ActivityIndicator color={Colors.light.buttonText} size="small" />
                  <Text style={{ color: Colors.light.buttonText, fontWeight: '700', fontSize: 16 }}>
                    Logging in...
                  </Text>
                </>
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  {/* @ts-ignore */}
                  <Unlock size={20} color={Colors.light.buttonText} />
                  <Text style={{ color: Colors.light.buttonText, fontWeight: '700', fontSize: 16 }}>
                    Login
                  </Text>
                </View>
              )}
            </TouchableOpacity>





            {/* Sign Up Link */}
            <TouchableOpacity
              onPress={() => router.push('/(Auth)/SignUpScreen' as any)}
              disabled={isLoading}
              style={{
                borderWidth: 2,
                borderColor: Colors.light.background,
                paddingVertical: 14,
                borderRadius: 12,
                alignItems: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                opacity: isLoading ? 0.6 : 1,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                <Plus size={20} fill={Colors.light.background} />
                <Text style={{ color: Colors.light.background, fontWeight: '700', fontSize: 16 }}>
                  Create New Account
                </Text>
              </View>
            </TouchableOpacity>
          </View>





          {/* Footer */}
          <View style={{ alignItems: 'center', gap: 4 }}>
            <Text style={{ fontSize: 11, color: 'rgba(232, 244, 255, 0.6)', fontWeight: '500' }}>
              © 2026 AttendPay. All rights reserved.
            </Text>
          </View>
        </View>
      </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}
