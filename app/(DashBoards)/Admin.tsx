import Header from '@/components/Header';
import QRGenerator from '@/components/QRGenerator';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import type {
    AdminDashboard,
    DailyAttendanceReport,
    EmployeeRecord,
    QRCodeResponse, SalaryOverviewItem,
} from '@/services/adminService';
import { adminService } from '@/services/adminService';
import { useRouter } from 'expo-router';
import { Building2, Check, IdCard, Mail, User } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator, Alert, Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Tab = 'overview' | 'employees' | 'attendance' | 'salary';

export default function AdminDashboard() {
  const router   = useRouter();
  const { logout } = useAuth();

  const [activeTab,     setActiveTab]     = useState<Tab>('overview');
  const [loading,       setLoading]       = useState(true);
  const [stats,         setStats]         = useState<AdminDashboard | null>(null);
  const [employees,     setEmployees]     = useState<EmployeeRecord[]>([]);
  const [dailyReport,   setDailyReport]   = useState<DailyAttendanceReport | null>(null);
  const [salaryOverview,setSalaryOverview]= useState<SalaryOverviewItem[]>([]);
  const [showQRModal,   setShowQRModal]   = useState(false);
  const [qrType,        setQrType]        = useState<'arrival' | 'departure' | 'registration'>('arrival');
  const [currentQR,     setCurrentQR]     = useState<QRCodeResponse | null>(null);
  const [qrLoading,     setQrLoading]     = useState(false);

  // Salary assignment modal
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [salaryEmpId,     setSalaryEmpId]     = useState('');
  const [salaryAmount,    setSalaryAmount]    = useState('');
  const [salaryLoading,   setSalaryLoading]   = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, empRes, reportRes, salaryRes] = await Promise.all([
        adminService.getDashboard(),
        adminService.getEmployees(),
        adminService.getDailyAttendanceReport(),
        adminService.getSalaryOverview(),
      ]);
      if (statsRes.success  && statsRes.data)  setStats(statsRes.data);
      if (empRes.success    && empRes.data)    setEmployees(empRes.data);
      if (reportRes.success && reportRes.data) setDailyReport(reportRes.data);
      if (salaryRes.success && salaryRes.data) setSalaryOverview(salaryRes.data);
    } catch {
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const openQR = async (type: 'arrival' | 'departure' | 'registration') => {
    setQrType(type);
    setQrLoading(true);
    setShowQRModal(true);
    const res = await adminService.getQRCode(type);
    if (res.success && res.data) {
      setCurrentQR(res.data);
    } else {
      Alert.alert('Error', res.error || 'Failed to load QR code');
      setShowQRModal(false);
    }
    setQrLoading(false);
  };

  const handleAssignSalary = async () => {
    if (!salaryEmpId.trim() || !salaryAmount.trim()) {
      Alert.alert('Error', 'Please enter Employee ID and salary amount');
      return;
    }
    setSalaryLoading(true);
    const res = await adminService.assignSalary({
      employee_id:    salaryEmpId.toUpperCase(),
      monthly_salary: parseFloat(salaryAmount),
    });
    setSalaryLoading(false);
    if (res.success) {
      Alert.alert('Success', 'Salary assigned successfully');
      setShowSalaryModal(false);
      setSalaryEmpId('');
      setSalaryAmount('');
      loadData();
    } else {
      Alert.alert('Error', res.error || 'Failed to assign salary');
    }
  };

  const handleApprove = async (employeeId: string) => {
    const res = await adminService.approveEmployee(employeeId);
    if (res.success) {
      Alert.alert('Approved', `${employeeId} approved.`);
      loadData();
    } else {
      Alert.alert('Error', res.error || 'Failed to approve');
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', onPress: () => { logout(); router.replace('/(Auth)/Home' as any); } },
    ]);
  };

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX', minimumFractionDigits: 0 }).format(n);

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

      {/* Tab bar */}
      <View style={{ flexDirection: 'row', backgroundColor: Colors.light.cardBackground, borderBottomWidth: 2, borderBottomColor: Colors.light.divider, paddingHorizontal: 12, justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flex: 1, flexDirection: 'row' }}>
          {(['overview', 'employees', 'attendance', 'salary'] as Tab[]).map(tab => (
            <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}
              style={{ flex: 1, paddingVertical: 15, borderBottomWidth: 3, borderBottomColor: activeTab === tab ? Colors.light.buttonBackground : 'transparent' }}>
              <Text style={{ textAlign: 'center', fontWeight: activeTab === tab ? '700' : '600', color: activeTab === tab ? Colors.light.buttonBackground : Colors.light.icon, fontSize: 12 }}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity onPress={handleLogout} style={{ backgroundColor: Colors.light.danger, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 6, marginLeft: 8 }}>
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 12 }}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 32 }}>

        {/* ── OVERVIEW ── */}
        {activeTab === 'overview' && stats && (
          <View style={{ gap: 20 }}>
            <Text style={{ fontSize: 26, fontWeight: 'bold', color: Colors.light.text }}>Dashboard Overview</Text>

            {/* Stats grid */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              {[
                { label: 'TOTAL',    value: stats.total_employees,  color: Colors.light.buttonBackground },
                { label: 'PRESENT',  value: stats.present_today,    color: Colors.light.success },
              ].map(s => (
                <View key={s.label} style={{ flex: 1, backgroundColor: Colors.light.cardBackground, borderRadius: 12, padding: 18, borderWidth: 1, borderColor: Colors.light.divider }}>
                  <Text style={{ color: s.color, fontSize: 11, fontWeight: '700' }}>{s.label}</Text>
                  <Text style={{ fontSize: 36, fontWeight: 'bold', color: s.color, marginTop: 8 }}>{s.value}</Text>
                </View>
              ))}
            </View>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              {[
                { label: 'ABSENT',    value: stats.absent_today,       color: Colors.light.danger },
                { label: 'AVG %',     value: `${stats.average_attendance}%`, color: Colors.light.buttonBackground },
              ].map(s => (
                <View key={s.label} style={{ flex: 1, backgroundColor: Colors.light.cardBackground, borderRadius: 12, padding: 18, borderWidth: 1, borderColor: Colors.light.divider }}>
                  <Text style={{ color: s.color, fontSize: 11, fontWeight: '700' }}>{s.label}</Text>
                  <Text style={{ fontSize: 36, fontWeight: 'bold', color: s.color, marginTop: 8 }}>{s.value}</Text>
                </View>
              ))}
            </View>

            {/* QR Codes */}
            <View style={{ backgroundColor: Colors.light.cardBackground, borderRadius: 12, padding: 20, gap: 12 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: Colors.light.text }}>Generate QR Codes</Text>
              {([
                { type: 'arrival',      label: 'Arrival QR Code',      color: Colors.light.success,          bg: 'rgba(16,185,129,0.1)' },
                { type: 'departure',    label: 'Departure QR Code',    color: Colors.light.warning,          bg: 'rgba(245,158,11,0.1)' },
                { type: 'registration', label: 'Registration QR Code', color: Colors.light.buttonBackground, bg: 'rgba(0,128,225,0.1)' },
              ] as const).map(q => (
                <TouchableOpacity key={q.type} onPress={() => openQR(q.type)}
                  style={{ backgroundColor: q.bg, borderWidth: 2, borderColor: q.color, borderRadius: 12, padding: 18, alignItems: 'center' }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: q.color }}>{q.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Assign Salary button */}
            <TouchableOpacity onPress={() => setShowSalaryModal(true)}
              style={{ backgroundColor: Colors.light.buttonBackground, borderRadius: 12, padding: 16, alignItems: 'center' }}>
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Assign / Update Employee Salary</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── EMPLOYEES ── */}
        {activeTab === 'employees' && (
          <View style={{ gap: 16 }}>
            <Text style={{ fontSize: 26, fontWeight: 'bold', color: Colors.light.text }}>Employee Records</Text>
            {employees.map(emp => (
              <View key={emp.employee_id} style={{ backgroundColor: Colors.light.cardBackground, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: Colors.light.divider, gap: 10 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.light.text }}>{emp.name}</Text>
                  {!emp.is_approved && (
                    <TouchableOpacity onPress={() => handleApprove(emp.employee_id)}
                      style={{ backgroundColor: Colors.light.success, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 }}>
                      <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>APPROVE</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <IdCard size={14} color={Colors.light.icon} />
                  <Text style={{ fontSize: 12, color: Colors.light.icon }}>{emp.employee_id}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Mail size={14} color={Colors.light.icon} />
                  <Text style={{ fontSize: 12, color: Colors.light.icon }}>{emp.email}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Building2 size={14} color={Colors.light.icon} />
                  <Text style={{ fontSize: 12, color: Colors.light.icon }}>{emp.department}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10, borderTopWidth: 1, borderTopColor: Colors.light.divider }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Check size={14} color={Colors.light.success} />
                    <Text style={{ fontSize: 12, color: Colors.light.success, fontWeight: '700' }}>{emp.attendance_percentage}%</Text>
                  </View>
                  <Text style={{ fontSize: 12, color: Colors.light.icon }}>{emp.total_days_worked} days</Text>
                  {emp.monthly_salary != null && (
                    <Text style={{ fontSize: 12, color: Colors.light.buttonBackground, fontWeight: '600' }}>
                      {formatCurrency(emp.monthly_salary)}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ── ATTENDANCE ── */}
        {activeTab === 'attendance' && dailyReport && (
          <View style={{ gap: 16 }}>
            <Text style={{ fontSize: 26, fontWeight: 'bold', color: Colors.light.text }}>Daily Attendance</Text>
            <View style={{ backgroundColor: Colors.light.cardBackground, borderRadius: 12, padding: 18, borderWidth: 1, borderColor: Colors.light.divider, gap: 10 }}>
              <Text style={{ fontSize: 15, fontWeight: 'bold', color: Colors.light.text }}>{dailyReport.date}</Text>
              {[
                { label: 'Total Employees', value: dailyReport.total_employees, color: Colors.light.text },
                { label: 'Present',         value: dailyReport.present,         color: Colors.light.success },
                { label: 'Absent',          value: dailyReport.absent,          color: Colors.light.danger },
                { label: 'Late',            value: dailyReport.late,            color: Colors.light.warning },
              ].map(row => (
                <View key={row.label} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: Colors.light.divider }}>
                  <Text style={{ color: Colors.light.icon, fontSize: 13 }}>{row.label}:</Text>
                  <Text style={{ fontWeight: '700', color: row.color, fontSize: 14 }}>{row.value}</Text>
                </View>
              ))}
            </View>

            {/* Per-employee records */}
            {dailyReport.records.map((rec: any) => (
              <View key={rec.id} style={{ backgroundColor: Colors.light.cardBackground, borderRadius: 10, padding: 14, borderWidth: 1, borderColor: Colors.light.divider, gap: 6 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontWeight: '700', color: Colors.light.text }}>{rec.employee_name}</Text>
                  <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 5, backgroundColor: rec.status === 'present' ? Colors.light.success : rec.status === 'absent' ? Colors.light.danger : Colors.light.warning }}>
                    <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>{rec.status.toUpperCase()}</Text>
                  </View>
                </View>
                <Text style={{ fontSize: 12, color: Colors.light.icon }}>{rec.employee_id}</Text>
                {rec.clock_in_time && <Text style={{ fontSize: 12, color: Colors.light.icon }}>In: {new Date(rec.clock_in_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</Text>}
                {rec.clock_out_time && <Text style={{ fontSize: 12, color: Colors.light.icon }}>Out: {new Date(rec.clock_out_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</Text>}
                {rec.hours_worked > 0 && <Text style={{ fontSize: 12, color: Colors.light.buttonBackground, fontWeight: '600' }}>{rec.hours_worked}h worked</Text>}
              </View>
            ))}
          </View>
        )}

        {/* ── SALARY ── */}
        {activeTab === 'salary' && (
          <View style={{ gap: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 26, fontWeight: 'bold', color: Colors.light.text }}>Salary Overview</Text>
              <TouchableOpacity onPress={() => setShowSalaryModal(true)}
                style={{ backgroundColor: Colors.light.buttonBackground, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 }}>
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>+ Assign</Text>
              </TouchableOpacity>
            </View>
            {salaryOverview.map(emp => (
              <View key={emp.employee_id} style={{ backgroundColor: Colors.light.cardBackground, borderRadius: 12, padding: 18, borderWidth: 1, borderColor: Colors.light.divider, gap: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <User size={16} color={Colors.light.text} />
                  <Text style={{ fontSize: 15, fontWeight: '700', color: Colors.light.text }}>{emp.employee_name}</Text>
                </View>
                <Text style={{ fontSize: 12, color: Colors.light.icon }}>ID: {emp.employee_id} · {emp.department}</Text>
                {[
                  { label: 'Monthly Salary', value: formatCurrency(emp.monthly_salary), color: Colors.light.text },
                  { label: 'Hours Today',    value: `${emp.hours_worked_today}h`,        color: Colors.light.text },
                  { label: 'Today Earned',   value: formatCurrency(emp.accumulated_today), color: Colors.light.success },
                  { label: 'This Month',     value: formatCurrency(emp.accumulated_month), color: Colors.light.buttonBackground },
                ].map(row => (
                  <View key={row.label} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: Colors.light.icon, fontSize: 12 }}>{row.label}:</Text>
                    <Text style={{ fontWeight: '700', color: row.color, fontSize: 13 }}>{row.value}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* ── QR Modal ── */}
      <Modal visible={showQRModal} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: Colors.light.cardBackground, borderRadius: 16, padding: 24, width: '85%', alignItems: 'center', gap: 18 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: Colors.light.text }}>
              {qrType === 'arrival' ? 'Arrival QR Code' : qrType === 'departure' ? 'Departure QR Code' : 'Registration QR Code'}
            </Text>
            <View style={{ width: 220, height: 220, borderRadius: 12, overflow: 'hidden', borderWidth: 2, borderColor: Colors.light.divider, justifyContent: 'center', alignItems: 'center' }}>
              {qrLoading ? (
                <ActivityIndicator size="large" color={Colors.light.buttonBackground} />
              ) : currentQR ? (
                <QRGenerator value={JSON.stringify(currentQR.payload)} />
              ) : null}
            </View>
            {currentQR && (
              <Text style={{ fontSize: 11, color: Colors.light.icon, textAlign: 'center' }}>
                Valid for: {currentQR.date}
              </Text>
            )}
            <TouchableOpacity onPress={() => { setShowQRModal(false); setCurrentQR(null); }}
              style={{ backgroundColor: Colors.light.buttonBackground, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 8, width: '100%', alignItems: 'center' }}>
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Assign Salary Modal ── */}
      <Modal visible={showSalaryModal} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: Colors.light.cardBackground, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, gap: 16 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: Colors.light.text }}>Assign Salary</Text>
            <View>
              <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.light.text, marginBottom: 6 }}>Employee ID</Text>
              <TextInput
                value={salaryEmpId}
                onChangeText={setSalaryEmpId}
                placeholder="e.g. EMP001"
                autoCapitalize="characters"
                style={{ borderWidth: 2, borderColor: Colors.light.inputBorder, borderRadius: 10, padding: 12, fontSize: 15, color: Colors.light.text }}
              />
            </View>
            <View>
              <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.light.text, marginBottom: 6 }}>Monthly Salary (UGX)</Text>
              <TextInput
                value={salaryAmount}
                onChangeText={setSalaryAmount}
                placeholder="e.g. 900000"
                keyboardType="numeric"
                style={{ borderWidth: 2, borderColor: Colors.light.inputBorder, borderRadius: 10, padding: 12, fontSize: 15, color: Colors.light.text }}
              />
            </View>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity onPress={() => setShowSalaryModal(false)} style={{ flex: 1, borderWidth: 2, borderColor: Colors.light.divider, borderRadius: 10, padding: 14, alignItems: 'center' }}>
                <Text style={{ fontWeight: '700', color: Colors.light.icon }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAssignSalary} disabled={salaryLoading}
                style={{ flex: 2, backgroundColor: Colors.light.buttonBackground, borderRadius: 10, padding: 14, alignItems: 'center' }}>
                {salaryLoading
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Save Salary</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
