export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  clockIn: string | null;
  clockOut: string | null;
  duration?: string; // calculated duration
  status: "present" | "absent" | "incomplete";
}

export interface DeviceQRData {
  deviceId: string;
  locationName: string;
  locationId: string;
  timestamp: string;
}

export interface AttendanceStats {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  averageWorkHours: number;
  attendancePercentage: number;
}
