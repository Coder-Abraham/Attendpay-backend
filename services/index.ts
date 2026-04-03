/**
 * Services Index
 * Central export point for all backend services
 */

export { apiClient, API_CONFIG, API_ENDPOINTS, type ApiResponse, type ApiError } from './api';
export { authService, type LoginResponse, type RegisterRequest } from './authService';
export { employeeService, type EmployeeProfile, type SalaryDetails, type ClockInOutResponse } from './employeeService';
export { adminService, type EmployeeRecord, type DailyAttendanceReport, type QRCodeResponse } from './adminService';

// Export all services as a namespace for convenience
import { authService } from './authService';
import { employeeService } from './employeeService';
import { adminService } from './adminService';

export const services = {
  auth: authService,
  employee: employeeService,
  admin: adminService,
};

export default services;
