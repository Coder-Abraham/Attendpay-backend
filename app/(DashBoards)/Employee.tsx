import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MapPin, Check, LogOut, X, AlertCircle, DollarSign, Calendar, Clipboard, Clock } from 'lucide-react-native';
import Header from '@/components/Header';
import QRScanner from '@/components/QRScanner';
import { useAuth } from '@/context/AuthContext';
import { Colors } from '@/constants/theme';
import { mockAttendanceData } from '@/utils/mockData';
import { formatCurrency, getEmployeeSalaryDetails, calculateHoursWorked } from '@/utils/salaryUtils';

export default function EmployeeDashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'attendance' | 'salary'>('dashboard');
  const [loading, setLoading] = useState(true);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [salaryDetails, setSalaryDetails] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [showScanner, setShowScanner] = useState(false);
  const [scannerMode, setScannerMode] = useState<'in' | 'out' | null>(null);
  const [todayClockIn, setTodayClockIn] = useState<string | null>('09:00 AM');
  const [todayClockOut, setTodayClockOut] = useState<string | null>(null);

  useEffect(() => {
    // Update current time every second
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const loadEmployeeData = useCallback(() => {
    setLoading(true);
    try {
      // Load attendance records
      const records = mockAttendanceData.filter((r) => r.employeeId === user.userId);
      setAttendanceRecords(records);

      // Load salary details
      const salary = getEmployeeSalaryDetails(user.userId || '');
      setSalaryDetails(salary);
    } catch {
      Alert.alert('Error', 'Failed to load employee data');
    } finally {
      setLoading(false);
    }
  }, [user.userId]);

  useEffect(() => {
    loadEmployeeData();
  }, [loadEmployeeData]);

  const handleClockIn = () => {
    if (!showScanner) {
      setScannerMode('in');
      setShowScanner(true);
    }
  };

  const handleClockOut = () => {
    if (!showScanner) {
      setScannerMode('out');
      setShowScanner(true);
    }
  };

  const handleScanQR = (data: string) => {
    try {
      JSON.parse(data); // Validate QR code format
      if (scannerMode === 'in') {
        setTodayClockIn(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }));
        Alert.alert('Success', 'Clock in recorded successfully!');
      } else {
        setTodayClockOut(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }));
        Alert.alert('Success', 'Clock out recorded successfully!');
      }
      setShowScanner(false);
      setScannerMode(null);
    } catch {
      Alert.alert('Error', 'Invalid QR code');
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        onPress: () => {
          logout();
          router.replace('/(Auth)' as any);
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.light.background }}>
        <ActivityIndicator size="large" color={Colors.light.buttonBackground} />
        <Text style={{ marginTop: 16, color: Colors.light.icon }}>Loading Employee Dashboard...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.light.background }}>
      <Header />

      {/* Tab Navigation */}
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: Colors.light.cardBackground,
          borderBottomWidth: 2,
          borderBottomColor: Colors.light.divider,
          paddingHorizontal: 12,
          justifyContent: 'space-between',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 3,
          elevation: 2,
        }}
      >
        <View style={{ flex: 1, flexDirection: 'row' }}>
          {(['dashboard', 'attendance', 'salary'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={{
                flex: 1,
                paddingVertical: 16,
                borderBottomWidth: 3,
                borderBottomColor: activeTab === tab ? Colors.light.buttonBackground : 'transparent',
              }}
            >
              <Text
                style={{
                  textAlign: 'center',
                  fontWeight: '600',
                  color: activeTab === tab ? Colors.light.buttonBackground : Colors.light.icon,
                  fontSize: 13,
                }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          onPress={handleLogout}
          style={{
            backgroundColor: Colors.light.danger,
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 6,
            marginLeft: 12,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 3,
            elevation: 3,
          }}
        >
          <Text style={{ color: Colors.light.buttonText, fontWeight: '600', fontSize: 12 }}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1, backgroundColor: Colors.light.background }} contentContainerStyle={{ padding: 20, paddingBottom: 32 }}>
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && salaryDetails && (
          <View style={{ gap: 20 }}>
            <View style={{ gap: 4 }}>
              <Text style={{ fontSize: 28, fontWeight: 'bold', color: Colors.light.text }}>
                Good {new Date().getHours() < 12 ? 'Morning' : 'Afternoon'}!
              </Text>
              <Text style={{ fontSize: 14, color: Colors.light.icon }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </Text>
            </View>

            {/* Current Time Card */}
            <View
              style={{
                backgroundColor: Colors.light.cardBackground,
                borderRadius: 12,
                padding: 24,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: Colors.light.divider,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 6,
                elevation: 3,
              }}
            >
              <Text style={{ fontSize: 13, color: Colors.light.icon, marginBottom: 12, fontWeight: '500' }}>Current Time</Text>
              <Text style={{ fontSize: 56, fontWeight: 'bold', color: Colors.light.buttonBackground, letterSpacing: 2 }}>
                {currentTime}
              </Text>
            </View>

            {/* Clock In/Out Buttons */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                onPress={handleClockIn}
                disabled={!!todayClockIn}
                style={{
                  flex: 1,
                  backgroundColor: todayClockIn ? Colors.light.success : Colors.light.success,
                  borderRadius: 12,
                  paddingVertical: 18,
                  alignItems: 'center',
                  opacity: todayClockIn ? 0.6 : 1,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: todayClockIn ? 0.05 : 0.12,
                  shadowRadius: 6,
                  elevation: todayClockIn ? 1 : 3,
                }}
              >
                <MapPin size={28} color={Colors.light.buttonText} style={{ marginBottom: 8 }} />
                <Text style={{ color: Colors.light.buttonText, fontWeight: '700', fontSize: 13 }}>
                  {todayClockIn ? `✓ ${todayClockIn}` : 'Clock In'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleClockOut}
                disabled={!todayClockIn || !!todayClockOut}
                style={{
                  flex: 1,
                  backgroundColor: !todayClockIn ? Colors.light.neutral : todayClockOut ? Colors.light.warning : Colors.light.warning,
                  borderRadius: 12,
                  paddingVertical: 18,
                  alignItems: 'center',
                  opacity: todayClockOut ? 0.6 : !todayClockIn ? 0.5 : 1,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: !todayClockIn || todayClockOut ? 0.05 : 0.12,
                  shadowRadius: 6,
                  elevation: !todayClockIn || todayClockOut ? 1 : 3,
                }}
              >
                <LogOut size={28} color={Colors.light.buttonText} style={{ marginBottom: 8 }} />
                <Text style={{ color: Colors.light.buttonText, fontWeight: '700', fontSize: 13 }}>
                  {todayClockOut ? `✓ ${todayClockOut}` : 'Clock Out'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Today's Earnings */}
            <View
              style={{
                backgroundColor: 'rgba(0, 160, 210, 0.08)',
                borderRadius: 12,
                padding: 20,
                borderWidth: 2,
                borderColor: Colors.light.icon,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.06,
                shadowRadius: 5,
                elevation: 2,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                <DollarSign size={18} color={Colors.light.buttonBackground} />
                <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.light.buttonBackground }}>
                  Today&apos;s Earnings
                </Text>
              </View>
              <Text style={{ fontSize: 36, fontWeight: 'bold', color: Colors.light.buttonBackground }}>
                {formatCurrency(salaryDetails.todayAccumulated)}
              </Text>
              <Text style={{ fontSize: 12, color: Colors.light.icon, marginTop: 8 }}>
                Based on {calculateHoursWorked(todayClockIn, todayClockOut).toFixed(1)} hours worked
              </Text>
            </View>

            {/* This Week & Month */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View
                style={{
                  flex: 1,
                  backgroundColor: Colors.light.cardBackground,
                  borderRadius: 12,
                  padding: 18,
                  borderWidth: 1,
                  borderColor: Colors.light.divider,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.06,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                  <Calendar size={16} color={Colors.light.icon} />
                  <Text style={{ fontSize: 12, color: Colors.light.icon, fontWeight: '500' }}>This Week</Text>
                </View>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: Colors.light.buttonBackground }}>
                  {formatCurrency(salaryDetails.weekAccumulated)}
                </Text>
              </View>

              <View
                style={{
                  flex: 1,
                  backgroundColor: Colors.light.cardBackground,
                  borderRadius: 12,
                  padding: 18,
                  borderWidth: 1,
                  borderColor: Colors.light.divider,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.06,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                  <Calendar size={16} color={Colors.light.icon} />
                  <Text style={{ fontSize: 12, color: Colors.light.icon, fontWeight: '500' }}>This Month</Text>
                </View>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: Colors.light.success }}>
                  {formatCurrency(salaryDetails.monthAccumulated)}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* ATTENDANCE TAB */}
        {activeTab === 'attendance' && (
          <View style={{ gap: 20 }}>
            <View style={{ gap: 4 }}>
              <Text style={{ fontSize: 28, fontWeight: 'bold', color: Colors.light.text }}>
                Attendance Records
              </Text>
              <Text style={{ fontSize: 14, color: Colors.light.icon }}>
                View your attendance history
              </Text>
            </View>

            {attendanceRecords.length === 0 ? (
              <View
                style={{
                  backgroundColor: Colors.light.cardBackground,
                  borderRadius: 12,
                  padding: 40,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: Colors.light.divider,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 4,
                  elevation: 1,
                }}
              >
                <Clipboard size={56} color={Colors.light.icon} strokeWidth={1.5} />
                <Text style={{ fontSize: 17, fontWeight: '600', color: Colors.light.text }}>
                  No records found
                </Text>
                <Text style={{ fontSize: 13, color: Colors.light.icon, marginTop: 8, textAlign: 'center' }}>
                  Your attendance records will appear here once you clock in
                </Text>
              </View>
            ) : (
              attendanceRecords.map((record) => (
                <View
                  key={record.id}
                  style={{
                    backgroundColor: Colors.light.cardBackground,
                    borderRadius: 12,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: Colors.light.divider,
                    gap: 14,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 4,
                    elevation: 1,
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 15, fontWeight: 'bold', color: Colors.light.text }}>
                      {record.date}
                    </Text>
                    <View
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 6,
                        backgroundColor:
                          record.status === 'present'
                            ? Colors.light.success
                            : record.status === 'absent'
                              ? Colors.light.danger
                              : Colors.light.warning,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      {record.status === 'present' ? (
                        <Check size={14} color={Colors.light.buttonText} />
                      ) : record.status === 'absent' ? (
                        <X size={14} color={Colors.light.buttonText} />
                      ) : (
                        <AlertCircle size={14} color={Colors.light.buttonText} />
                      )}
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: '700',
                          color: Colors.light.buttonText,
                          letterSpacing: 0.5,
                        }}
                      >
                        {record.status === 'present' ? 'PRESENT' : record.status === 'absent' ? 'ABSENT' : 'LATE'}
                      </Text>
                    </View>
                  </View>

                  {record.clockIn && (
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Clock size={13} color={Colors.light.icon} />
                        <Text style={{ color: Colors.light.icon, fontSize: 13 }}>Clock In:</Text>
                      </View>
                      <Text style={{ fontWeight: '600', color: Colors.light.text, fontSize: 14 }}>{record.clockIn}</Text>
                    </View>
                  )}

                  {record.clockOut && (
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <LogOut size={13} color={Colors.light.icon} />
                        <Text style={{ color: Colors.light.icon, fontSize: 13 }}>Clock Out:</Text>
                      </View>
                      <Text style={{ fontWeight: '600', color: Colors.light.text, fontSize: 14 }}>{record.clockOut}</Text>
                    </View>
                  )}

                  {record.duration && (
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingTop: 10,
                        borderTopWidth: 1,
                        borderTopColor: Colors.light.divider,
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Clock size={13} color={Colors.light.icon} />
                        <Text style={{ color: Colors.light.icon, fontSize: 13 }}>Duration:</Text>
                      </View>
                      <Text style={{ fontWeight: '700', color: Colors.light.buttonBackground, fontSize: 14 }}>{record.duration}</Text>
                    </View>
                  )}
                </View>
              ))
            )}
          </View>
        )}

        {/* SALARY TAB */}
        {activeTab === 'salary' && salaryDetails && (
          <View style={{ gap: 20 }}>
            <View style={{ gap: 4 }}>
              <Text style={{ fontSize: 28, fontWeight: 'bold', color: Colors.light.text }}>
                Salary Information
              </Text>
              <Text style={{ fontSize: 14, color: Colors.light.icon }}>
                View your earnings breakdown
              </Text>
            </View>

            {/* Main Salary Card */}
            <View
              style={{
                backgroundColor: Colors.light.cardBackground,
                borderRadius: 12,
                padding: 20,
                borderWidth: 1,
                borderColor: Colors.light.divider,
                gap: 14,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 6,
                elevation: 2,
              }}
            >
              <View style={{ paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: Colors.light.divider }}>
                <Text style={{ fontSize: 12, color: Colors.light.icon, marginBottom: 8, fontWeight: '500' }}>Monthly Salary</Text>
                <Text style={{ fontSize: 32, fontWeight: 'bold', color: Colors.light.buttonBackground }}>
                  {formatCurrency(salaryDetails.monthlySalary)}
                </Text>
              </View>

              <View style={{ gap: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ color: Colors.light.icon, fontSize: 13, fontWeight: '500' }}>Daily Salary:</Text>
                  <Text style={{ fontWeight: '700', color: Colors.light.text, fontSize: 15 }}>
                    {formatCurrency(salaryDetails.salaryBreakdown.dailySalary)}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ color: Colors.light.icon, fontSize: 13, fontWeight: '500' }}>Hourly Salary:</Text>
                  <Text style={{ fontWeight: '700', color: Colors.light.text, fontSize: 15 }}>
                    {formatCurrency(salaryDetails.salaryBreakdown.hourlySalary)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Accumulated Earnings */}
            <View style={{ gap: 14 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: Colors.light.text }}>
                Accumulated Earnings
              </Text>

              <View
                style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.08)',
                  borderRadius: 12,
                  padding: 18,
                  borderWidth: 2,
                  borderColor: Colors.light.success,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.04,
                  shadowRadius: 4,
                  elevation: 1,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <Clock size={14} color={Colors.light.success} />
                  <Text style={{ fontSize: 12, color: Colors.light.success, fontWeight: '600' }}>Today</Text>
                </View>
                <Text style={{ fontSize: 28, fontWeight: 'bold', color: Colors.light.success }}>
                  {formatCurrency(salaryDetails.todayAccumulated)}
                </Text>
              </View>

              <View
                style={{
                  backgroundColor: 'rgba(0, 128, 225, 0.08)',
                  borderRadius: 12,
                  padding: 18,
                  borderWidth: 2,
                  borderColor: Colors.light.buttonBackground,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.04,
                  shadowRadius: 4,
                  elevation: 1,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <Calendar size={14} color={Colors.light.buttonBackground} />
                  <Text style={{ fontSize: 12, color: Colors.light.buttonBackground, fontWeight: '600' }}>This Week</Text>
                </View>
                <Text style={{ fontSize: 28, fontWeight: 'bold', color: Colors.light.buttonBackground }}>
                  {formatCurrency(salaryDetails.weekAccumulated)}
                </Text>
              </View>

              <View
                style={{
                  backgroundColor: 'rgba(0, 160, 210, 0.08)',
                  borderRadius: 12,
                  padding: 18,
                  borderWidth: 2,
                  borderColor: Colors.light.icon,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.04,
                  shadowRadius: 4,
                  elevation: 1,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <Calendar size={14} color={Colors.light.icon} />
                  <Text style={{ fontSize: 12, color: Colors.light.icon, fontWeight: '600' }}>This Month</Text>
                </View>
                <Text style={{ fontSize: 28, fontWeight: 'bold', color: Colors.light.icon }}>
                  {formatCurrency(salaryDetails.monthAccumulated)}
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* QR Scanner Modal */}
      <Modal visible={showScanner} transparent animationType="slide">
        <QRScanner
          onQRScanned={handleScanQR}
          onClose={() => {
            setShowScanner(false);
            setScannerMode(null);
          }}
        />
      </Modal>
    </SafeAreaView>
  );
}
