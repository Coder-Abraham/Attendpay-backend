/**
 * API Service Configuration and Client
 * Backend Integration Layer for AttendPay
 * 
 * This file provides the foundation for connecting to your backend server.
 * Configure the API_BASE_URL to point to your backend server.
 */

// ============================================================================
// BACKEND CONFIGURATION - UPDATE THIS WITH YOUR SERVER URL
// ============================================================================
export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 0,  // Set to 0 until backend is ready — avoids repeated fetch failed errors
  RETRY_DELAY: 1000,
};

// ============================================================================
// API ENDPOINTS - Structure your endpoints here
// ============================================================================
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh',
    VALIDATE_TOKEN: '/auth/validate',
  },

  // Employee endpoints
  EMPLOYEES: {
    GET_PROFILE: '/employees/profile',
    UPDATE_PROFILE: '/employees/profile',
    GET_ATTENDANCE: '/employees/attendance',
    CLOCK_IN: '/employees/clock-in',
    CLOCK_OUT: '/employees/clock-out',
    GET_SALARY: '/employees/salary',
  },

  // Admin endpoints
  ADMIN: {
    GET_EMPLOYEES: '/admin/employees',
    GET_ATTENDANCE_REPORT: '/admin/attendance-report',
    GET_SALARY_CONFIG: '/admin/salary-config',
    GENERATE_QR: '/admin/qr-code',
    UPDATE_EMPLOYEE: '/admin/employees/:id',
  },

  // Attendance endpoints
  ATTENDANCE: {
    SCAN_QR: '/attendance/scan',
    GET_RECORDS: '/attendance/records',
    GET_DAILY_REPORT: '/attendance/daily-report',
  },
};

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  status: number;
  message: string;
  details?: any;
}

// ============================================================================
// API CLIENT CLASS
// ============================================================================
class APIClient {
  private baseUrl: string = API_CONFIG.BASE_URL;
  private timeout: number = API_CONFIG.TIMEOUT;
  private authToken: string | null = null;

  /**
   * Set authentication token (called after successful login)
   */
  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  /**
   * Get authentication token
   */
  getAuthToken(): string | null {
    return this.authToken;
  }

  /**
   * Clear authentication token (called on logout)
   */
  clearAuthToken() {
    this.authToken = null;
  }

  /**
   * Set base URL for API (for testing or multiple environments)
   */
  setBaseUrl(url: string) {
    this.baseUrl = url;
  }

  /**
   * Make a fetch request with error handling
   */
  private async request<T = any>(
    endpoint: string,
    options: RequestInit & { retryCount?: number } = {}
  ): Promise<ApiResponse<T>> {
    const { retryCount = 0, ...fetchOptions } = options;

    try {
      const url = `${this.baseUrl}${endpoint}`;

      // Prepare headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(fetchOptions.headers as Record<string, string>),
      };

      // Add authorization header if token exists
      if (this.authToken) {
        headers['Authorization'] = `Bearer ${this.authToken}`;
      }

      // Make request with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle response
      if (!response.ok) {
        // Handle 401 Unauthorized - token might be expired
        if (response.status === 401) {
          this.clearAuthToken();
          throw new Error('Unauthorized: Please login again');
        }

        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      // Retry logic
      if (retryCount < API_CONFIG.RETRY_ATTEMPTS) {
        await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY));
        return this.request<T>(endpoint, { ...fetchOptions, retryCount: retryCount + 1 });
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error(`API Error: ${endpoint}`, errorMessage);

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * GET request
   */
  async get<T = any>(endpoint: string, headers?: HeadersInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'GET',
      headers,
    });
  }

  /**
   * POST request
   */
  async post<T = any>(
    endpoint: string,
    body?: any,
    headers?: HeadersInit
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T = any>(
    endpoint: string,
    body?: any,
    headers?: HeadersInit
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * PATCH request
   */
  async patch<T = any>(
    endpoint: string,
    body?: any,
    headers?: HeadersInit
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T = any>(endpoint: string, headers?: HeadersInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      headers,
    });
  }
}

// Export singleton instance
export const apiClient = new APIClient();

export default apiClient;
