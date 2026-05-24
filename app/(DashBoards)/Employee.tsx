import Header from '@/components/Header';
import QRScanner from '@/components/QRScanner';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { attendanceService } from '@/services/attendanceService';
import type { AttendanceRecord, EmployeeDashboard } from '@/services/employeeService';
import { employeeService } from '@/services/employeeService';
import { useRouter } from 'expo-router';
import { Check, Clipboard } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Tab = 'dashboard' | 'attendance' | 'salary';

export default function EmployeeDashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [activeTab,    setActiveTab]    = useState<Tab>('dashboard');
  const [loading,      setLoading]      = useState(true);
  const [dashboard,    setDashboard]    = useState<EmployeeDashboard | null>(null);
  const [attendance,   setAttendance]   = useState<AttendanceRecord[]>([]);
  const [currentTime,  setCurrentTime]  = useState('');
  const [showScanner,  setShowScanner]  = useState(false);
  const [scannerMode,  setScannerMode]  = useState<'in' | 'out' | null>(null);
  const [clockingInOut,setClockingInOut]= useState(false);

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [dashRes, attRes] = await Promise.all([
        employeeService.getDashboard(),
        employeeService.getAttendanceHistory(),
      ]);
      if (dashRes.success && dashRes.data) setDashboard(dashRes.data);
      if (attRes.success  && attRes.data)  setAttendance(attRes.data);
    } catch {
      Alert.alert('Error', 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleScanQR = async (rawData: string) => {
    setShowScanner(false);
    setClockingInOut(true);

    try {
      // Parse the QR payload to extract the token
      let qrToken: string;
      try {
        const payload = JSON.parse(rawData);
        qrToken = payload.token;
        if (!qrToken) throw new Error('no token');
      } catch {
        Alert.alert('Error', 'Invalid QR code format');
        // Don't return here — fall through to finally so overlay is cleared
        setClockingInOut(false);
        setScannerMode(null);
        return;
      }

      const result = scannerMode === 'in'
        ? await attendanceService.clockIn(qrToken)
        : await attendanceService.clockOut(qrToken);

      if (!result.success || !result.data) {
        Alert.alert('Error', result.error ?? 'Failed to record attendance');
        return;
      }

      const { time, location } = result.data;
      const locationLine = location
        ? `📍 ${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`
        : '📍 Location unavailable';

      Alert.alert(
        scannerMode === 'in' ? 'Clocked In ✓' : 'Clocked Out ✓',
        `Time: ${time}\n${locationLine}`,
        [{ text: 'OK', onPress: loadData }],
      );
    } catch {
      Alert.alert('Error', 'Failed to record attendance. Please try again.');
    } finally {
      setClockingInOut(false);
      setScannerMode(null);
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

  const formatTime = (iso: string | null) => {
    if (!iso) return null;
    return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const hasClockedIn  = !!dashboard?.today_clock_in;
  const hasClockedOut = !!dashboard?.today_clock_out;

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.light.background }}>
        <ActivityIndicator size="large" color={Colors.light.buttonBackground} />
        <Text style={{ marginTop: 16, color: Colors.light.icon }}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.light.background }}>
      <Header />

      {/* Tab bar */}
      <View style={{ flexDirection: 'row', backgroundColor: Colors.light.cardBackground, borderBottomWidth: 2, borderBottomColor: Colors.light.divider, paddingHorizontal: 12, justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flex: 1, flexDirection: 'row' }}>
          {(['dashboard', 'attendance', 'salary'] as Tab[]).map(tab => (
            <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}
              style={{ flex: 1, paddingVertical: 16, borderBottomWidth: 3, borderBottomColor: activeTab === tab ? Colors.light.buttonBackground : 'transparent' }}>
              <Text style={{ textAlign: 'center', fontWeight: '600', color: activeTab === tab ? Colors.light.buttonBackground : Colors.light.icon, fontSize: 13 }}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity onPress={handleLogout} style={{ backgroundColor: Colors.light.danger, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 6, marginLeft: 12 }}>
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 12 }}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 32 }}>

        {/* ── DASHBOARD ── */}
        {activeTab === 'dashboard' && dashboard && (
          <View style={{ gap: 20 }}>
            <View>
              <Text style={{ fontSize: 28, fontWeight: 'bold', color: Colors.light.text }}>
                Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'},{' '}
                {user.name ? user.name.split(' ')[0] : 'there'}!
              </Text>
              <Text style={{ fontSize: 14, color: Colors.light.icon }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </Text>
            </View>

            {/* Clock */}
            <View style={{ backgroundColor: Colors.light.cardBackground, borderRadius: 12, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: Colors.light.divider }}>
              <Text style={{ fontSize: 13, color: Colors.light.icon, marginBottom: 12 }}>Current Time</Text>
              <Text style={{ fontSize: 52, fontWeight: 'bold', color: Colors.light.buttonBackground, letterSpacing: 2 }}>{currentTime}</Text>
            </View>

            {/* Clock In / Out buttons */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                onPress={() => { setScannerMode('in'); setShowScanner(true); }}
                disabled={hasClockedIn}
                style={{ flex: 1, backgroundColor: Colors.light.success, borderRadius: 12, paddingVertical: 18, alignItems: 'center', opacity: hasClockedIn ? 0.6 : 1 }}>
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>
                  {hasClockedIn ? `✓ ${formatTime(dashboard.today_clock_in)}` : 'Clock In'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => { setScannerMode('out'); setShowScanner(true); }}
                disabled={!hasClockedIn || hasClockedOut}
                style={{ flex: 1, backgroundColor: !hasClockedIn ? Colors.light.neutral : Colors.light.warning, borderRadius: 12, paddingVertical: 18, alignItems: 'center', opacity: hasClockedOut || !hasClockedIn ? 0.6 : 1 }}>
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>
                  {hasClockedOut ? `✓ ${formatTime(dashboard.today_clock_out)}` : 'Clock Out'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Today's earnings */}
            <View style={{ backgroundColor: 'rgba(0,160,210,0.08)', borderRadius: 12, padding: 20, borderWidth: 2, borderColor: Colors.light.icon }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.light.buttonBackground, marginBottom: 8 }}>Today's Earnings</Text>
              <Text style={{ fontSize: 36, fontWeight: 'bold', color: Colors.light.buttonBackground }}>{formatCurrency(dashboard.today_accumulated)}</Text>
              <Text style={{ fontSize: 12, color: Colors.light.icon, marginTop: 6 }}>Based on {dashboard.today_hours_worked.toFixed(1)} hours worked</Text>
            </View>

            {/* Week / Month */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              {[
                { label: 'This Week',  value: dashboard.week_accumulated,  color: Colors.light.buttonBackground },
                { label: 'This Month', value: dashboard.month_accumulated, color: Colors.light.success },
              ].map(c => (
                <View key={c.label} style={{ flex: 1, backgroundColor: Colors.light.cardBackground, borderRadius: 12, padding: 18, borderWidth: 1, borderColor: Colors.light.divider }}>
                  <Text style={{ fontSize: 12, color: Colors.light.icon, marginBottom: 8 }}>{c.label}</Text>
                  <Text style={{ fontSize: 22, fontWeight: 'bold', color: c.color }}>{formatCurrency(c.value)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── ATTENDANCE ── */}
        {activeTab === 'attendance' && (
          <View style={{ gap: 16 }}>
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: Colors.light.text }}>Attendance Records</Text>
            {attendance.length === 0 ? (
              <View style={{ backgroundColor: Colors.light.cardBackground, borderRadius: 12, padding: 40, alignItems: 'center', borderWidth: 1, borderColor: Colors.light.divider }}>
                <Clipboard size={56} color={Colors.light.icon} strokeWidth={1.5} />
                <Text style={{ fontSize: 17, fontWeight: '600', color: Colors.light.text, marginTop: 12 }}>No records yet</Text>
                <Text style={{ fontSize: 13, color: Colors.light.icon, marginTop: 8, textAlign: 'center' }}>Your attendance will appear here after you clock in</Text>
              </View>
            ) : attendance.map(rec => (
              <View key={rec.id} style={{ backgroundColor: Colors.light.cardBackground, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: Colors.light.divider, gap: 10 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 15, fontWeight: 'bold', color: Colors.light.text }}>{rec.date}</Text>
                  <View style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, backgroundColor: rec.status === 'present' ? Colors.light.success : rec.status === 'absent' ? Colors.light.danger : Colors.light.warning, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    {rec.status === 'present' && <Check size={12} color="#fff" />}
                    <Text style={{ fontSize: 10, fontWeight: '700', color: '#fff' }}>{rec.status.toUpperCase()}</Text>
                  </View>
                </View>
                {rec.clock_in_time  && <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text style={{ color: Colors.light.icon, fontSize: 13 }}>Clock In:</Text><Text style={{ fontWeight: '600', color: Colors.light.text }}>{formatTime(rec.clock_in_time)}</Text></View>}
                {rec.clock_out_time && <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text style={{ color: Colors.light.icon, fontSize: 13 }}>Clock Out:</Text><Text style={{ fontWeight: '600', color: Colors.light.text }}>{formatTime(rec.clock_out_time)}</Text></View>}
                {rec.duration       && <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 8, borderTopWidth: 1, borderTopColor: Colors.light.divider }}><Text style={{ color: Colors.light.icon, fontSize: 13 }}>Duration:</Text><Text style={{ fontWeight: '700', color: Colors.light.buttonBackground }}>{rec.duration}</Text></View>}
              </View>
            ))}
          </View>
        )}

        {/* ── SALARY ── */}
        {activeTab === 'salary' && dashboard && (
          <View style={{ gap: 16 }}>
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: Colors.light.text }}>Salary Information</Text>

            <View style={{ backgroundColor: Colors.light.cardBackground, borderRadius: 12, padding: 20, borderWidth: 1, borderColor: Colors.light.divider, gap: 12 }}>
              <View style={{ paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: Colors.light.divider }}>
                <Text style={{ fontSize: 12, color: Colors.light.icon, marginBottom: 6 }}>Monthly Salary</Text>
                <Text style={{ fontSize: 32, fontWeight: 'bold', color: Colors.light.buttonBackground }}>{formatCurrency(dashboard.monthly_salary)}</Text>
              </View>
              {[
                { label: 'Daily Salary',  value: formatCurrency(dashboard.daily_salary) },
                { label: 'Hourly Salary', value: formatCurrency(dashboard.hourly_salary) },
              ].map(row => (
                <View key={row.label} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: Colors.light.icon, fontSize: 13 }}>{row.label}:</Text>
                  <Text style={{ fontWeight: '700', color: Colors.light.text, fontSize: 15 }}>{row.value}</Text>
                </View>
              ))}
            </View>

            <Text style={{ fontSize: 16, fontWeight: 'bold', color: Colors.light.text }}>Accumulated Earnings</Text>
            {[
              { label: 'Today',      value: dashboard.today_accumulated,  color: Colors.light.success,          bg: 'rgba(16,185,129,0.08)',  border: Colors.light.success },
              { label: 'This Week',  value: dashboard.week_accumulated,   color: Colors.light.buttonBackground, bg: 'rgba(0,128,225,0.08)',   border: Colors.light.buttonBackground },
              { label: 'This Month', value: dashboard.month_accumulated,  color: Colors.light.icon,             bg: 'rgba(0,160,210,0.08)',   border: Colors.light.icon },
            ].map(c => (
              <View key={c.label} style={{ backgroundColor: c.bg, borderRadius: 12, padding: 18, borderWidth: 2, borderColor: c.border }}>
                <Text style={{ fontSize: 12, color: c.color, fontWeight: '600', marginBottom: 8 }}>{c.label}</Text>
                <Text style={{ fontSize: 28, fontWeight: 'bold', color: c.color }}>{formatCurrency(c.value)}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Clocking overlay */}
      {clockingInOut && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center', zIndex: 99 }}>
          <View style={{ backgroundColor: Colors.light.cardBackground, borderRadius: 16, padding: 28, alignItems: 'center', gap: 14, width: '75%' }}>
            <ActivityIndicator size="large" color={Colors.light.buttonBackground} />
            <Text style={{ fontSize: 15, fontWeight: '700', color: Colors.light.text }}>
              {scannerMode === 'in' ? 'Recording Clock-In...' : 'Recording Clock-Out...'}
            </Text>
            <Text style={{ fontSize: 12, color: Colors.light.icon, textAlign: 'center' }}>Capturing timestamp and location</Text>
          </View>
        </View>
      )}

      {/* QR Scanner Modal */}
      <Modal visible={showScanner} transparent animationType="slide">
        <QRScanner
          onQRScanned={handleScanQR}
          onClose={() => { setShowScanner(false); setScannerMode(null); }}
        />
      </Modal>
    </SafeAreaView>
  );
}
