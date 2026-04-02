import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  ImageBackground,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/Header';
import { BG_IMAGE, Colors } from '@/constants/theme';

export default function SignUpScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [department, setDepartment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    if (step === 1) {
      if (!name.trim() || !email.includes('@')) {
        Alert.alert('Error', 'Please provide a valid name and email');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (password.length < 6 || password !== confirmPassword) {
        Alert.alert('Error', 'Passwords must match and be 6+ characters');
        return;
      }
      if (!department.trim()) {
        Alert.alert('Required', 'Please enter your department');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      handleSignUp();
    }
  };

  const handleSignUp = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      Alert.alert('Success', 'Account created successfully!', [
        {
          text: 'OK',
          onPress: () => {
            router.back();
          },
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 1) {
      router.back();
    } else {
      setStep(step - 1);
    }
  };

  const inputStyle = {
    backgroundColor: Colors.light.cardBackground,
    borderWidth: 2,
    borderColor: Colors.light.inputBorder,
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    marginBottom: 14,
    color: Colors.light.text,
    fontWeight: '500',
  };

  return (
    <ImageBackground
      source={BG_IMAGE}
      resizeMode="cover"
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: 'rgba(10, 37, 64, 0.4)' }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <Header />

        <View style={{ padding: 28 }}>
          {/* Progress Indicator */}
          <View style={{ marginBottom: 28, gap: 10 }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {[1, 2, 3].map((dot) => (
                <View
                  key={dot}
                  style={{
                    flex: 1,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: step >= dot ? Colors.light.buttonBackground : 'rgba(255, 255, 255, 0.3)',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: step >= dot ? 0.2 : 0,
                    shadowRadius: 4,
                    elevation: step >= dot ? 2 : 0,
                  }}
                />
              ))}
            </View>
            <Text style={{ fontSize: 13, color: Colors.light.background, textAlign: 'center', fontWeight: '600' }}>
              Step {step} of 3
            </Text>
          </View>

          {/* Heading */}
          <View style={{ marginBottom: 28, gap: 8 }}>
            <Text style={{ fontSize: 32, fontWeight: 'bold', color: Colors.light.background }}>
              🔐 Sign Up
            </Text>
            <Text style={{ fontSize: 14, color: 'rgba(232, 244, 255, 0.9)' }}>
              {step === 1 && '✏️ Enter your basic information'}
              {step === 2 && '🔑 Set up your security details'}
              {step === 3 && '✅ Review and confirm'}
            </Text>
          </View>

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <View style={{ gap: 18 }}>
              <View>
                <Text style={{ fontSize: 14, fontWeight: '700', marginBottom: 10, color: Colors.light.background }}>
                  👤 Full Name
                </Text>
                <TextInput
                  placeholder="John Doe"
                  value={name}
                  onChangeText={setName}
                  editable={!loading}
                  placeholderTextColor="rgba(176, 212, 232, 0.6)"
                  style={inputStyle}
                />
              </View>
              <View>
                <Text style={{ fontSize: 14, fontWeight: '700', marginBottom: 10, color: Colors.light.background }}>
                  📧 Email Address
                </Text>
                <TextInput
                  placeholder="john@company.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  editable={!loading}
                  placeholderTextColor="rgba(176, 212, 232, 0.6)"
                  style={inputStyle}
                />
              </View>
            </View>
          )}

          {/* Step 2: Security & Department */}
          {step === 2 && (
            <View style={{ gap: 18 }}>
              <View>
                <Text style={{ fontSize: 14, fontWeight: '700', marginBottom: 10, color: Colors.light.background }}>
                  🔒 Password
                </Text>
                <TextInput
                  placeholder="At least 6 characters"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  editable={!loading}
                  placeholderTextColor="rgba(176, 212, 232, 0.6)"
                  style={inputStyle}
                />
              </View>
              <View>
                <Text style={{ fontSize: 14, fontWeight: '700', marginBottom: 10, color: Colors.light.background }}>
                  ✔️ Confirm Password
                </Text>
                <TextInput
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  editable={!loading}
                  placeholderTextColor="rgba(176, 212, 232, 0.6)"
                  style={inputStyle}
                />
              </View>
              <View>
                <Text style={{ fontSize: 14, fontWeight: '700', marginBottom: 10, color: Colors.light.background }}>
                  🏢 Department
                </Text>
                <TextInput
                  placeholder="e.g., Engineering, Sales"
                  value={department}
                  onChangeText={setDepartment}
                  editable={!loading}
                  placeholderTextColor="rgba(176, 212, 232, 0.6)"
                  style={inputStyle}
                />
              </View>
            </View>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <View
              style={{
                backgroundColor: Colors.light.cardBackground,
                borderRadius: 14,
                padding: 20,
                gap: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: Colors.light.text }}>
                📋 Review Your Information
              </Text>
              <View style={{ gap: 12, paddingVertical: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: Colors.light.divider }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ color: Colors.light.icon, fontSize: 14, fontWeight: '500' }}>Name:</Text>
                  <Text style={{ fontWeight: '700', color: Colors.light.text, fontSize: 15 }}>
                    {name}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ color: Colors.light.icon, fontSize: 14, fontWeight: '500' }}>Email:</Text>
                  <Text style={{ fontWeight: '700', color: Colors.light.text, fontSize: 15 }}>
                    {email}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ color: Colors.light.icon, fontSize: 14, fontWeight: '500' }}>Department:</Text>
                  <Text style={{ fontWeight: '700', color: Colors.light.text, fontSize: 15 }}>
                    {department}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Buttons */}
          <View
            style={{
              flexDirection: 'row',
              gap: 12,
              marginTop: 32,
            }}
          >
            <TouchableOpacity
              onPress={handleBack}
              disabled={loading}
              style={{
                flex: 1,
                paddingVertical: 14,
                borderRadius: 10,
                alignItems: 'center',
                borderWidth: 2,
                borderColor: Colors.light.background,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                opacity: loading ? 0.6 : 1,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <Text style={{ color: Colors.light.background, fontWeight: '700', fontSize: 15 }}>← Back</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleNext}
              disabled={loading}
              style={{
                flex: 1,
                paddingVertical: 14,
                borderRadius: 10,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 8,
                backgroundColor: loading ? Colors.light.icon : Colors.light.buttonBackground,
                opacity: loading ? 0.9 : 1,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 6,
                elevation: 4,
              }}
            >
              {loading ? (
                <>
                  <ActivityIndicator color={Colors.light.buttonText} size="small" />
                  <Text style={{ color: Colors.light.buttonText, fontWeight: '700', fontSize: 15 }}>
                    {step === 3 ? 'Creating...' : 'Next...'}
                  </Text>
                </>
              ) : (
                <Text style={{ color: Colors.light.buttonText, fontWeight: '700', fontSize: 15 }}>
                  {step === 3 ? '✅ Create Account' : 'Next →'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
    </ImageBackground>
  );
}
