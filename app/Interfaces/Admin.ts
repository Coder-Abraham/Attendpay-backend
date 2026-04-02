export interface AdminQRData {
  deviceId: string;
  locationName: string;
  locationId: string;
  timestamp: string;
  type: "arrival" | "departure";
  adminId: string;
}

export interface EmployeeRegistrationQRData {
  organizationId: string;
  organizationName: string;
  registrationCode: string;
  timestamp: string;
  type: "employee-registration";
  adminId: string;
  expiresAt: string;
}

export interface EmployeeRecord {
  id: string;
  name: string;
  email: string;
  department: string;
  joinDate: string;
  totalDaysWorked: number;
  attendancePercentage: number;
  lastClockIn?: string;
  lastClockOut?: string;
}

export interface AttendanceReportDaily {
  date: string;
  totalEmployees: number;
  presentEmployees: number;
  absentEmployees: number;
  lateArrivals: number;
}

export interface AttendanceReportMonthly {
  month: string;
  totalWorkDays: number;
  averageAttendance: number;
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
}

export interface AdminDashboardStats {
  totalEmployees: number;
  totalPresentToday: number;
  totalAbsentToday: number;
  totalLateToday: number;
  averageAttendancePercentage: number;
  departmentStats: Array<{
    departmentName: string;
    employeeCount: number;
    presentCount: number;
  }>;
}
