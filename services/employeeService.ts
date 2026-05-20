import { API_ENDPOINTS, apiClient, type ApiResponse } from './api';

export interface EmployeeProfile {
  employee_id:     string;
  name:            string;
  email:           string;
  phone:           string;
  department:      string;
  organization_id: string;
  role:            string;
  is_approved:     boolean;
}

export interface EmployeeDashboard {
  employee_id:        string;
  name:               string;
  role:               string;
  today_clock_in:     string | null;
  today_clock_out:    string | null;
  today_status:       string;
  today_hours_worked: number;
  today_accumulated:  number;
  week_accumulated:   number;
  month_accumulated:  number;
  monthly_salary:     number;
  daily_salary:       number;
  hourly_salary:      number;
}

export interface SalaryDetails {
  monthly_salary:  number;
  daily_salary:    number;
  hourly_salary:   number;
  today_accumulated: number;
  week_accumulated:  number;
  month_accumulated: number;
}

export interface ClockInOutResponse {
  message:      string;
  timestamp:    string;
  time:         string;
  hours_worked?: number;
  location:     { latitude: number; longitude: number };
}

export interface AttendanceRecord {
  id:             number;
  employee_id:    string;
  employee_name:  string;
  date:           string;
  clock_in_time:  string | null;
  clock_out_time: string | null;
  status:         'present' | 'absent' | 'incomplete';
  hours_worked:   number;
  duration:       string | null;
}

class EmployeeService {
  getProfile(): Promise<ApiResponse<EmployeeProfile>> {
    return apiClient.get<EmployeeProfile>(API_ENDPOINTS.PROFILE);
  }

  getDashboard(): Promise<ApiResponse<EmployeeDashboard>> {
    return apiClient.get<EmployeeDashboard>(API_ENDPOINTS.DASHBOARD);
  }

  clockIn(qrToken: string, latitude: number, longitude: number): Promise<ApiResponse<ClockInOutResponse>> {
    return apiClient.post<ClockInOutResponse>(API_ENDPOINTS.ATTENDANCE.CLOCK_IN, {
      qr_token: qrToken,
      latitude,
      longitude,
    });
  }

  clockOut(qrToken: string, latitude: number, longitude: number): Promise<ApiResponse<ClockInOutResponse>> {
    return apiClient.post<ClockInOutResponse>(API_ENDPOINTS.ATTENDANCE.CLOCK_OUT, {
      qr_token: qrToken,
      latitude,
      longitude,
    });
  }

  getAttendanceHistory(): Promise<ApiResponse<AttendanceRecord[]>> {
    return apiClient.get<AttendanceRecord[]>(API_ENDPOINTS.ATTENDANCE.HISTORY);
  }

  getPayroll(year?: number, month?: number): Promise<ApiResponse<any>> {
    const params = year && month ? `?year=${year}&month=${month}` : '';
    return apiClient.get(`${API_ENDPOINTS.PAYROLL}${params}`);
  }
}

export const employeeService = new EmployeeService();
export default employeeService;
