import { API_ENDPOINTS, apiClient, type ApiResponse } from './api';

export interface AdminDashboard {
  total_employees:    number;
  present_today:      number;
  absent_today:       number;
  late_today:         number;
  average_attendance: number;
}

export interface EmployeeRecord {
  employee_id:          string;
  name:                 string;
  email:                string;
  department:           string;
  is_approved:          boolean;
  attendance_percentage: number;
  total_days_worked:    number;
  monthly_salary:       number | null;
}

export interface DailyAttendanceReport {
  date:            string;
  total_employees: number;
  present:         number;
  absent:          number;
  late:            number;
  records:         any[];
}

export interface QRCodeResponse {
  id:       string;
  qr_type:  string;
  date:     string;
  token:    string;
  payload:  Record<string, any>;
}

export interface SalaryOverviewItem {
  employee_id:         string;
  employee_name:       string;
  department:          string;
  monthly_salary:      number;
  currency:            string;
  hours_worked_today:  number;
  accumulated_today:   number;
  accumulated_month:   number;
}

class AdminService {
  getDashboard(): Promise<ApiResponse<AdminDashboard>> {
    return apiClient.get<AdminDashboard>(API_ENDPOINTS.ADMIN.DASHBOARD);
  }

  getEmployees(): Promise<ApiResponse<EmployeeRecord[]>> {
    return apiClient.get<EmployeeRecord[]>(API_ENDPOINTS.ADMIN.EMPLOYEES);
  }

  approveEmployee(employeeId: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post(`${API_ENDPOINTS.ADMIN.EMPLOYEES}${employeeId}/approve/`);
  }

  getDailyAttendanceReport(date?: string): Promise<ApiResponse<DailyAttendanceReport>> {
    const params = date ? `?date=${date}` : '';
    return apiClient.get<DailyAttendanceReport>(`${API_ENDPOINTS.ADMIN.ATTENDANCE}${params}`);
  }

  getQRCode(type: 'arrival' | 'departure' | 'registration'): Promise<ApiResponse<QRCodeResponse>> {
    return apiClient.get<QRCodeResponse>(API_ENDPOINTS.QR[type.toUpperCase() as 'ARRIVAL' | 'DEPARTURE' | 'REGISTRATION']);
  }

  getSalaryOverview(): Promise<ApiResponse<SalaryOverviewItem[]>> {
    return apiClient.get<SalaryOverviewItem[]>(API_ENDPOINTS.ADMIN.SALARY_OVERVIEW);
  }

  assignSalary(data: {
    employee_id:    string;
    monthly_salary: number;
    salary_type?:   string;
    currency?:      string;
    working_days?:  number;
  }): Promise<ApiResponse<any>> {
    return apiClient.post(API_ENDPOINTS.ADMIN.SALARIES, data);
  }

  getPayroll(year?: number, month?: number): Promise<ApiResponse<any[]>> {
    const today = new Date();
    const y = year  || today.getFullYear();
    const m = month || today.getMonth() + 1;
    return apiClient.get<any[]>(`${API_ENDPOINTS.ADMIN.PAYROLL}?year=${y}&month=${m}`);
  }
}

export const adminService = new AdminService();
export default adminService;
