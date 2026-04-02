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
    employeeName: 'John Doe',
    monthlySalary: 50000,
    salaryBreakdown: {
      monthlySalary: 50000,
      dailySalary: 2273,
      hourlySalary: 284,
      currency: 'USD',
    },
    todayAccumulated: 284,
    weekAccumulated: 1988,
    monthAccumulated: 22730,
    currency: 'USD',
    lastUpdated: new Date().toISOString(),
  },
  EMP002: {
    employeeId: 'EMP002',
    employeeName: 'Jane Smith',
    monthlySalary: 60000,
    salaryBreakdown: {
      monthlySalary: 60000,
      dailySalary: 2727,
      hourlySalary: 341,
      currency: 'USD',
    },
    todayAccumulated: 341,
    weekAccumulated: 2386,
    monthAccumulated: 27273,
    currency: 'USD',
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
    name: 'John Doe',
    email: 'john.doe@company.com',
    department: 'Engineering',
    joinDate: '2023-01-15',
    totalDaysWorked: 250,
    attendancePercentage: 96,
    lastClockIn: '09:00 AM',
    lastClockOut: '05:30 PM',
  },
  {
    id: 'EMP002',
    name: 'Jane Smith',
    email: 'jane.smith@company.com',
    department: 'Marketing',
    joinDate: '2023-03-20',
    totalDaysWorked: 240,
    attendancePercentage: 94,
    lastClockIn: '08:45 AM',
    lastClockOut: '05:15 PM',
  },
  {
    id: 'EMP003',
    name: 'Mike Johnson',
    email: 'mike.johnson@company.com',
    department: 'Sales',
    joinDate: '2023-02-10',
    totalDaysWorked: 245,
    attendancePercentage: 91,
    lastClockIn: '09:30 AM',
    lastClockOut: null,
  },
  {
    id: 'EMP004',
    name: 'Sarah Williams',
    email: 'sarah.williams@company.com',
    department: 'HR',
    joinDate: '2022-11-05',
    totalDaysWorked: 260,
    attendancePercentage: 97,
    lastClockIn: '08:30 AM',
    lastClockOut: '05:00 PM',
  },
  {
    id: 'EMP005',
    name: 'Tom Brown',
    email: 'tom.brown@company.com',
    department: 'Finance',
    joinDate: '2023-05-01',
    totalDaysWorked: 200,
    attendancePercentage: 88,
    lastClockIn: null,
    lastClockOut: null,
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
    employeeName: 'John Doe',
    monthlySalary: 50000,
    currency: 'USD',
    startDate: '2023-01-15',
  },
  {
    employeeId: 'EMP002',
    employeeName: 'Jane Smith',
    monthlySalary: 60000,
    currency: 'USD',
    startDate: '2023-03-20',
  },
  {
    employeeId: 'EMP003',
    employeeName: 'Mike Johnson',
    monthlySalary: 45000,
    currency: 'USD',
    startDate: '2023-02-10',
  },
];
