/**
 * Authentication Service
 * Handles all auth-related API calls and token management
 */

import { apiClient, ApiResponse } from './api';
// TODO: Import AsyncStorage when backend integration is complete
// import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LoginRequest {
  employeeId: string;
}

export interface LoginResponse {
  userId: string;
  email: string;
  name: string;
  role: 'employee' | 'admin';
  organizationId: string;
  token?: string;
  refreshToken?: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  department: string;
  employeeId?: string;
}

class AuthService {
  /**
   * Login with employee ID
   * (Mock implementation - replace with actual API call)
   */
  async login(employeeId: string): Promise<ApiResponse<LoginResponse>> {
    // For now, using mock data - replace with actual API call when backend is ready
    console.log('[AuthService] Login attempt:', employeeId);

    // TODO: Replace this with actual API call
    // return apiClient.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, {
    //   employeeId,
    // });

    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: {
            userId: employeeId,
            email: 'employee@company.com',
            name: 'Employee Name',
            role: employeeId.startsWith('ADM') ? 'admin' : 'employee',
            organizationId: 'ORG001',
          },
        });
      }, 1000);
    });
  }

  /**
   * Register new employee
   * (To be implemented when backend is ready)
   */
  async register(data: RegisterRequest): Promise<ApiResponse<LoginResponse>> {
    console.log('[AuthService] Register attempt:', data.email);

    // TODO: Implement when backend is ready
    // return apiClient.post<LoginResponse>(API_ENDPOINTS.AUTH.REGISTER, data);

    return {
      success: false,
      error: 'Registration service not yet implemented. Please contact admin.',
    };
  }

  /**
   * Logout - clear stored tokens
   */
  async logout(): Promise<void> {
    console.log('[AuthService] Logout');
    apiClient.clearAuthToken();
    // TODO: Uncomment when AsyncStorage is available
    // await AsyncStorage.removeItem('authToken');
    // await AsyncStorage.removeItem('userId');
  }

  /**
   * Validate token with backend
   * (To be implemented when backend is ready)
   */
  async validateToken(token: string): Promise<ApiResponse<boolean>> {
    console.log('[AuthService] Validating token');

    // TODO: Implement when backend is ready
    // return apiClient.post<boolean>(API_ENDPOINTS.AUTH.VALIDATE_TOKEN, { token });

    return {
      success: true,
      data: true,
    };
  }

  /**
   * Save token to async storage
   */
  async saveToken(token: string): Promise<void> {
    // TODO: Uncomment when AsyncStorage is available
    // await AsyncStorage.setItem('authToken', token);
    apiClient.setAuthToken(token);
  }

  /**
   * Get saved token from async storage
   */
  async getStoredToken(): Promise<string | null> {
    // TODO: Uncomment when AsyncStorage is available
    // return AsyncStorage.getItem('authToken');
    return null;
  }

  /**
   * Clear stored credentials
   */
  async clearStoredCredentials(): Promise<void> {
    // TODO: Uncomment when AsyncStorage is available
    // await AsyncStorage.multiRemove(['authToken', 'userId', 'userRole']);
    apiClient.clearAuthToken();
  }
}

export const authService = new AuthService();
export default authService;
