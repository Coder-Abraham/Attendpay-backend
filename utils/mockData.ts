// Mock data for attendance records
export const mockAttendanceData = [
  {
    id: '1',
    employeeId: 'EMP001',
    date: new Date().toISOString().split('T')[0],
    clockIn: '09:00 AM',
    clockOut: '05:30 PM',
    duration: '8h 30m',
    status: 'present' as const,
  },
  {
    id: '2',
    employeeId: 'EMP001',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    clockIn: '09:15 AM',
    clockOut: '05:45 PM',
    duration: '8h 30m',
    status: 'present' as const,
  },
  {
    id: '3',
    employeeId: 'EMP001',
    date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
    clockIn: null,
    clockOut: null,
    status: 'absent' as const,
  },
];

// Mock employee salary details
export const mockSalaryData: Record<string, any> = {
  EMP001: {
    employeeId: 'EMP001',
    employeeName: 'Usabyimana Daniel',
    monthlySalary: 1000000,
    salaryBreakdown: {
      monthlySalary: 950000,
      dailySalary: 35000,
      hourlySalary: 18000,
      currency: 'UGX',
    },
    todayAccumulated: 23000,
    weekAccumulated: 120000,
    monthAccumulated: 890000,
    currency: 'UGX',
    lastUpdated: new Date().toISOString(),
  },
  EMP002: {
    employeeId: 'EMP002',
    employeeName: 'Ssebadduka Joseph',
    monthlySalary: 900000,
    salaryBreakdown: {
      monthlySalary: 900000,
      dailySalary: 30000,
      hourlySalary: 5000.2,
      currency: 'UGX',
    },
    todayAccumulated: 27000,
    weekAccumulated: 140000,
    monthAccumulated: 800000,
    currency: 'UGX',
    lastUpdated: new Date().toISOString(),
  },
};

// Mock admin data
export const mockAdminStats = {
  totalEmployees: 45,
  presentToday: 42,
  absentToday: 3,
  totalDepartments: 5,
  averageAttendance: 93.3,
};

export const mockEmployeeList = [
  {
    id: 'EMP001',
    name: 'Ssebadduka Joseph',
    email: 'josephssebadduka@uict.com',
    department: 'Engineering',
    joinDate: '2023-01-15',
    totalDaysWorked: 250,
    attendancePercentage: 96,
    lastClockIn: '09:00 AM',
    lastClockOut: '05:30 PM',
  },
  {
    id: 'EMP002',
    name: 'Usabyimana Daniel',
    email: 'danielusabyimana@uict.com',
    department: 'I.T',
    joinDate: '2023-03-20',
    totalDaysWorked: 240,
    attendancePercentage: 94,
    lastClockIn: '08:45 AM',
    lastClockOut: '05:15 PM',
  },
  {
    id: 'EMP003',
    name: 'Katandi Abraham Bonny',
    email: 'abrahamkatandi@uict.com',
    department: 'I.T',
    joinDate: '2023-02-10',
    totalDaysWorked: 245,
    attendancePercentage: 91,
    lastClockIn: '09:30 AM',
    lastClockOut: null,
  },
  {
    id: 'EMP004',
    name: 'Sserabidde Merina',
    email: 'merinasserabidde@uict.com',
    department: 'HR',
    joinDate: '2022-11-05',
    totalDaysWorked: 260,
    attendancePercentage: 97,
    lastClockIn: '08:30 AM',
    lastClockOut: '05:00 PM',
  },
  {
    id: 'EMP005',
    name: 'Otai Joshua',
    email: 'joshuaotai@gmail.com',
    department: 'Finance',
    joinDate: '2023-05-01',
    totalDaysWorked: 200,
    attendancePercentage: 88,
    lastClockIn: null,
    lastClockOut: null,
  },
  {
    id: 'EMP006',
    name: 'Owiny Jonnathan',
    email: 'jonnathanowiny@gmail.com',
    department: 'Finance',
    joinDate: '2023-05-01',
    totalDaysWorked: 200,
    attendancePercentage: 88,
    lastClockIn: '09:12 AM',
    lastClockOut: '06:30 PM' ,
  },
];

export const mockDailyReports = [
  {
    date: new Date().toISOString().split('T')[0],
    totalEmployees: 45,
    presentEmployees: 42,
    absentEmployees: 3,
    lateArrivals: 5,
  },
  {
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    totalEmployees: 45,
    presentEmployees: 44,
    absentEmployees: 1,
    lateArrivals: 3,
  },
  {
    date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
    totalEmployees: 45,
    presentEmployees: 41,
    absentEmployees: 4,
    lateArrivals: 7,
  },
];

export const mockSalaryConfigs = [
  {
    employeeId: 'EMP001',
    employeeName: 'Ssebadduka Joseph',
    monthlySalary: 900000,
    currency: 'UGX',
    startDate: '2024-09-02',
  },
  {
    employeeId: 'EMP002',
    employeeName: 'Usabyimana Daniel',
    monthlySalary: 1000000,
    currency: 'UGX',
    startDate: '2024-09-02',
  },
  {
    employeeId: 'EMP003',
    employeeName: 'Sserabidde Merina',
    monthlySalary: 1200000,
    currency: 'UGX',
    startDate: '2024-09-02',
  },
  {
    employeeId: 'EMP004',
    employeeName: 'Otai Joshua',
    monthlySalary: 1500000,
    currency: 'UGX',
    startDate: '2024-09-02',
  },
  {
    employeeId: 'EMP005',
    employeeName: 'Owiny Jonathan',
    monthlySalary: 600000,
    currency: 'UGX',
    startDate: '2024-09-02',
  },
];
