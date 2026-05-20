export { adminService, type AdminDashboard, type DailyAttendanceReport, type EmployeeRecord, type QRCodeResponse, type SalaryOverviewItem } from './adminService';
export { API_CONFIG, API_ENDPOINTS, apiClient, type ApiError, type ApiResponse } from './api';
export { attendanceService, type LocationSnapshot } from './attendanceService';
export { authService, type LoginResponse, type RegisterRequest } from './authService';
export { employeeService, type AttendanceRecord, type ClockInOutResponse, type EmployeeDashboard, type EmployeeProfile, type SalaryDetails } from './employeeService';

import { adminService } from './adminService';
import { attendanceService } from './attendanceService';
import { authService } from './authService';
import { employeeService } from './employeeService';

export const services = { auth: authService, employee: employeeService, admin: adminService, attendance: attendanceService };
