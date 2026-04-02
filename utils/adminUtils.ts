import { mockAdminStats, mockEmployeeList, mockDailyReports, mockSalaryConfigs } from './mockData';

export const calculateAdminDashboardStats = () => {
  return {
    totalEmployees: mockAdminStats.totalEmployees,
    presentToday: mockAdminStats.presentToday,
    absentToday: mockAdminStats.absentToday,
    totalDepartments: mockAdminStats.totalDepartments,
    averageAttendance: mockAdminStats.averageAttendance,
  };
};

export const fetchEmployeeRecords = () => {
  return mockEmployeeList;
};

export const fetchDailyAttendanceReport = () => {
  return mockDailyReports;
};

export const getSalaryConfigs = () => {
  return mockSalaryConfigs;
};

export const getAdminSalaryOverview = () => {
  return mockSalaryConfigs.map((config) => ({
    ...config,
    hoursWorkedToday: Math.floor(Math.random() * 8) + 4,
    accumulatedToday: config.monthlySalary / 22 / 8 * (Math.floor(Math.random() * 8) + 4),
    accumulatedThisMonth: config.monthlySalary * 0.65,
  }));
};

export const generateDeviceId = () => {
  return `DEVICE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const generateAdminQRData = (deviceId: string) => {
  return JSON.stringify({
    deviceId,
    locationName: 'Main Office',
    locationId: 'LOC001',
    timestamp: new Date().toISOString(),
    type: 'arrival',
    adminId: 'ADM001',
  });
};

export const generateEmployeeRegistrationQR = () => {
  return JSON.stringify({
    organizationId: 'ORG001',
    organizationName: 'AttendPay Inc',
    registrationCode: `REG-${Date.now()}`,
    timestamp: new Date().toISOString(),
    type: 'employee-registration',
    adminId: 'ADM001',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  });
};
