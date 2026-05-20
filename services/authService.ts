import { API_ENDPOINTS, apiClient, type ApiResponse } from './api';

export interface LoginResponse {
  token:           string;
  employee_id:     string;
  name:            string;
  role:            'employee' | 'admin';
  organization_id: string;
  is_approved:     boolean;
}

export interface RegisterRequest {
  employee_id:        string;
  name:               string;
  email:              string;
  phone?:             string;
  password:           string;
  organization_id?:   string;
  registration_token: string;
}

class AuthService {
  async login(employeeId: string, password: string): Promise<ApiResponse<LoginResponse>> {
    return apiClient.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, {
      employee_id: employeeId,
      password,
    });
  }

  async register(data: RegisterRequest): Promise<ApiResponse<{ message: string; employee_id: string }>> {
    return apiClient.post(API_ENDPOINTS.AUTH.REGISTER, data);
  }

  async logout(): Promise<void> {
    await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    apiClient.clearAuthToken();
  }
}

export const authService = new AuthService();
export default authService;
