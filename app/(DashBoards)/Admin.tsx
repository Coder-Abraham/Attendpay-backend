import { useEffect, useState } from 'react';
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
import { Check, IdCard, Mail, Building2, User } from 'lucide-react-native';
import Header from '@/components/Header';
import { useAuth } from '@/context/AuthContext';
import { Colors } from '@/constants/theme';
import {
  calculateAdminDashboardStats,
  fetchEmployeeRecords,
  fetchDailyAttendanceReport,
  getAdminSalaryOverview,
} from '@/utils/adminUtils';
import { formatCurrency } from '@/utils/salaryUtils';
import QRGenerator from '@/components/QRGenerator';

export default function AdminDashboard() {
  const router = useRouter();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'employees' | 'attendance' | 'salary'>(
    'overview'
  );
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [dailyReports, setDailyReports] = useState<any[]>([]);
  const [salaryOverview, setSalaryOverview] = useState<any[]>([]);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrType, setQrType] = useState<'arrival' | 'departure' | 'registration'>('arrival');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLoading(true);
    try {
      const dashboardStats = calculateAdminDashboardStats();
      const employeeRecords = fetchEmployeeRecords();
      const dailyAttendance = fetchDailyAttendanceReport();
      const salaryOverviewData = getAdminSalaryOverview();

      setStats(dashboardStats);
      setEmployees(employeeRecords);
      setDailyReports(dailyAttendance);
      setSalaryOverview(salaryOverviewData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        onPress: () => {
          logout();
          router.replace('/(Auth)/Home' as any);
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.light.background }}>
        <ActivityIndicator size="large" color={Colors.light.buttonBackground} />
        <Text style={{ marginTop: 16, color: Colors.light.icon }}>Loading Admin Dashboard...</Text>
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
          {(['overview', 'employees', 'attendance', 'salary'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={{
                flex: 1,
                paddingVertical: 15,
                borderBottomWidth: 3,
                borderBottomColor: activeTab === tab ? Colors.light.buttonBackground : 'transparent',
              }}
            >
              <Text
                style={{
                  textAlign: 'center',
                  fontWeight: activeTab === tab ? '700' : '600',
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
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && stats && (
          <View style={{ gap: 20 }}>
            <View style={{ gap: 4 }}>
              <Text style={{ fontSize: 28, fontWeight: 'bold', color: Colors.light.text }}>
                Dashboard Overview
              </Text>
              <Text style={{ fontSize: 14, color: Colors.light.icon }}>
                View your system statistics
              </Text>
            </View>

            {/* Stats Grid */}
            <View style={{ gap: 14 }}>
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
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>

                    <Text style={{ color: Colors.light.icon, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 }}>
                      TOTAL
                    </Text>
                  </View>
                  <Text style={{ fontSize: 36, fontWeight: 'bold', color: Colors.light.buttonBackground, marginTop: 10 }}>
                    {stats.totalEmployees}
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
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Check size={14} color={Colors.light.success} />
                    <Text style={{ color: Colors.light.success, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 }}>
                      PRESENT
                    </Text>
                  </View>
                  <Text style={{ fontSize: 36, fontWeight: 'bold', color: Colors.light.success, marginTop: 10 }}>
                    {stats.presentToday}
                  </Text>
                </View>
              </View>

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
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>

                    <Text style={{ color: Colors.light.danger, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 }}>
                      ABSENT
                    </Text>
                  </View>
                  <Text style={{ fontSize: 36, fontWeight: 'bold', color: Colors.light.danger, marginTop: 10 }}>
                    {stats.absentToday}
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
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>

                    <Text style={{ color: Colors.light.icon, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 }}>
                      AVERAGE %
                    </Text>
                  </View>
                  <Text
                    style={{ fontSize: 36, fontWeight: 'bold', color: Colors.light.buttonBackground, marginTop: 10 }}
                  >
                    {stats.averageAttendance.toFixed(1)}%
                  </Text>
                </View>
              </View>
            </View>

            {/* Generate QR Codes */}
            <View style={{ backgroundColor: Colors.light.cardBackground, borderRadius: 12, padding: 20, gap: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>

                <Text style={{ fontSize: 18, fontWeight: 'bold', color: Colors.light.text }}>
                  Generate QR Codes
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => {
                  setQrType('arrival');
                  setShowQRModal(true);
                }}
                style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  borderWidth: 2,
                  borderColor: Colors.light.success,
                  borderRadius: 12,
                  padding: 18,
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.04,
                  shadowRadius: 3,
                  elevation: 1,
                }}
              >

                <Text style={{ fontSize: 15, fontWeight: '700', color: Colors.light.success }}>
                  Arrival QR Code
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setQrType('departure');
                  setShowQRModal(true);
                }}
                style={{
                  backgroundColor: 'rgba(245, 158, 11, 0.1)',
                  borderWidth: 2,
                  borderColor: Colors.light.warning,
                  borderRadius: 12,
                  padding: 18,
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.04,
                  shadowRadius: 3,
                  elevation: 1,
                }}
              >

                <Text style={{ fontSize: 15, fontWeight: '700', color: Colors.light.warning }}>
                  Departure QR Code
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setQrType('registration');
                  setShowQRModal(true);
                }}
                style={{
                  backgroundColor: 'rgba(0, 128, 225, 0.1)',
                  borderWidth: 2,
                  borderColor: Colors.light.buttonBackground,
                  borderRadius: 12,
                  padding: 18,
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.04,
                  shadowRadius: 3,
                  elevation: 1,
                }}
              >

                <Text style={{ fontSize: 15, fontWeight: '700', color: Colors.light.buttonBackground }}>
                  Registration QR Code
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* EMPLOYEES TAB */}
        {activeTab === 'employees' && (
          <View style={{ gap: 20 }}>
            <View style={{ gap: 4 }}>
              <Text style={{ fontSize: 28, fontWeight: 'bold', color: Colors.light.text }}>
                Employee Records
              </Text>
              <Text style={{ fontSize: 14, color: Colors.light.icon }}>
                Manage employee information
              </Text>
            </View>

            {employees.map((emp) => (
              <View
                key={emp.id}
                style={{
                  backgroundColor: Colors.light.cardBackground,
                  borderRadius: 12,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: Colors.light.divider,
                  gap: 12,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 4,
                  elevation: 1,
                }}
               >
                <View style={{ gap: 4 }}>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.light.text }}>
                    {emp.name}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <IdCard size={14} color={Colors.light.icon} />
                    <Text style={{ fontSize: 12, color: Colors.light.icon }}>{emp.id}</Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Mail size={14} color={Colors.light.icon} />
                  <Text style={{ fontSize: 12, color: Colors.light.icon }}>{emp.email}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Building2 size={14} color={Colors.light.icon} />
                  <Text style={{ fontSize: 12, color: Colors.light.icon }}>{emp.department}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: Colors.light.divider }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Check size={14} color={Colors.light.success} />
                    <Text style={{ fontSize: 12, color: Colors.light.success, fontWeight: '700' }}>
                      {emp.attendancePercentage}%
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>

                    <Text style={{ fontSize: 12, color: Colors.light.icon, fontWeight: '600' }}>
                      {emp.totalDaysWorked} days
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ATTENDANCE TAB */}
        {activeTab === 'attendance' && (
          <View style={{ gap: 20 }}>
            <View style={{ gap: 4 }}>
              <Text style={{ fontSize: 28, fontWeight: 'bold', color: Colors.light.text }}>
                Daily Attendance
              </Text>
              <Text style={{ fontSize: 14, color: Colors.light.icon }}>
                View daily attendance reports
              </Text>
            </View>

            {dailyReports.map((report) => (
              <View
                key={report.date}
                style={{
                  backgroundColor: Colors.light.cardBackground,
                  borderRadius: 12,
                  padding: 18,
                  borderWidth: 1,
                  borderColor: Colors.light.divider,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 4,
                  elevation: 1,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 }}>

                  <Text style={{ fontSize: 15, fontWeight: 'bold', color: Colors.light.text }}>
                    {report.date}
                  </Text>
                </View>
                <View style={{ gap: 10 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: Colors.light.divider }}>
                    <Text style={{ color: Colors.light.icon, fontSize: 12, fontWeight: '500' }}>Total Employees:</Text>
                    <Text style={{ fontWeight: '700', color: Colors.light.text, fontSize: 13 }}>
                      {report.totalEmployees}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Check size={14} color={Colors.light.success} />
                      <Text style={{ color: Colors.light.success, fontSize: 12, fontWeight: '600' }}>Present:</Text>
                    </View>
                    <Text style={{ fontWeight: '700', color: Colors.light.success, fontSize: 13 }}>
                      {report.presentEmployees}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>

                      <Text style={{ color: Colors.light.danger, fontSize: 12, fontWeight: '600' }}>Absent:</Text>
                    </View>
                    <Text style={{ fontWeight: '700', color: Colors.light.danger, fontSize: 13 }}>
                      {report.absentEmployees}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>

                      <Text style={{ color: Colors.light.warning, fontSize: 12, fontWeight: '600' }}>Late:</Text>
                    </View>
                    <Text style={{ fontWeight: '700', color: Colors.light.warning, fontSize: 13 }}>{report.lateArrivals}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* SALARY TAB */}
        {activeTab === 'salary' && (
          <View style={{ gap: 20 }}>
            <View style={{ gap: 4 }}>
              <Text style={{ fontSize: 28, fontWeight: 'bold', color: Colors.light.text }}>
                Salary Overview
              </Text>
              <Text style={{ fontSize: 14, color: Colors.light.icon }}>
                View employee earnings breakdown
              </Text>
            </View>

            {salaryOverview.map((emp) => (
              <View
                key={emp.employeeId}
                style={{
                  backgroundColor: Colors.light.cardBackground,
                  borderRadius: 12,
                  padding: 18,
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
                <View style={{ gap: 4 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <User size={18} color={Colors.light.text} />
                    <Text style={{ fontSize: 15, fontWeight: '700', color: Colors.light.text }}>
                      {emp.employeeName}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 12, color: Colors.light.icon }}>ID: {emp.employeeId}</Text>
                </View>
                <View style={{ gap: 10, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: Colors.light.divider }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: Colors.light.icon, fontSize: 12, fontWeight: '500' }}>Monthly Salary:</Text>
                    <Text style={{ fontWeight: '700', color: Colors.light.text, fontSize: 13 }}>
                      {formatCurrency(emp.monthlySalary)}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: Colors.light.icon, fontSize: 12, fontWeight: '500' }}>Hours Today:</Text>
                    <Text style={{ fontWeight: '700', color: Colors.light.text, fontSize: 13 }}>
                      {emp.hoursWorkedToday}h
                    </Text>
                  </View>
                </View>
                <View style={{ gap: 10 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: Colors.light.icon, fontSize: 12, fontWeight: '500' }}>Today Earned:</Text>
                    <Text style={{ fontWeight: '700', color: Colors.light.success, fontSize: 13 }}>
                      {formatCurrency(emp.accumulatedToday)}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Text style={{ color: Colors.light.icon, fontSize: 12, fontWeight: '500' }}>This Month:</Text>
                    <Text style={{ fontWeight: '700', color: Colors.light.buttonBackground, fontSize: 13 }}>
                      {formatCurrency(emp.accumulatedThisMonth)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* QR Modal */}
      <Modal visible={showQRModal} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              backgroundColor: Colors.light.cardBackground,
              borderRadius: 16,
              padding: 24,
              width: '85%',
              alignItems: 'center',
              gap: 18,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.25,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>

                <Text style={{ fontSize: 19, fontWeight: 'bold', color: Colors.light.text }}>
                  {qrType === 'arrival'
                    ? 'Arrival QR Code'
                    : qrType === 'departure'
                      ? 'Departure QR Code'
                      : 'Registration QR Code'}
                </Text>
              </View>
            <View style={{ width: 220, height: 220, borderRadius: 12, overflow: 'hidden', borderWidth: 2, borderColor: Colors.light.divider }}>
              <QRGenerator
                value={
                  qrType === 'registration'
                    ? JSON.stringify({
                        type: 'employee-registration',
                        organizationId: 'ORG001',
                        organizationName: 'UICT',
                        registrationCode: `REG-${Date.now()}`,
                        adminId: 'ADM001',
                        timestamp: new Date().toISOString(),
                        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                      })
                    : JSON.stringify({
                        type: qrType,
                        timestamp: new Date().toISOString(),
                        organizationId: 'ORG001',
                      })
                }
              />
            </View>

            <TouchableOpacity
              onPress={() => setShowQRModal(false)}
              style={{
                backgroundColor: Colors.light.buttonBackground,
                paddingHorizontal: 28,
                paddingVertical: 12,
                borderRadius: 8,
                width: '100%',
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 3,
                elevation: 3,
              }}
            >
              <Text style={{ color: Colors.light.buttonText, fontWeight: '700', fontSize: 16 }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
