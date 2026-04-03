/**
 * Attendance Service
 * Captures location + timestamp on clock in/out and sends to backend.
 */

import * as Location from 'expo-location';
import { apiClient, API_ENDPOINTS, type ApiResponse } from './api';

export interface LocationSnapshot {
  latitude: number;
  longitude: number;
  accuracy: number | null;
}

export interface ClockPayload {
  employeeId: string;
  type: 'clock-in' | 'clock-out';
  timestamp: string;          // ISO 8601
  location: LocationSnapshot | null;
  qrData: string;             // raw scanned QR string
}

export interface ClockResponse {
  success: boolean;
  timestamp: string;
  message: string;
  location: LocationSnapshot | null;
}

class AttendanceService {
  /**
   * Request foreground location permission.
   * Returns true if granted.
   */
  async requestLocationPermission(): Promise<boolean> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  }

  /**
   * Get current device location.
   * Returns null if permission denied or unavailable.
   */
  async getCurrentLocation(): Promise<LocationSnapshot | null> {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        const granted = await this.requestLocationPermission();
        if (!granted) return null;
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      return {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
      };
    } catch {
      return null;
    }
  }

  /**
   * Record a clock-in event with timestamp and location.
   */
  async clockIn(employeeId: string, qrData: string): Promise<ApiResponse<ClockResponse>> {
    const [location] = await Promise.all([this.getCurrentLocation()]);
    const payload: ClockPayload = {
      employeeId,
      type: 'clock-in',
      timestamp: new Date().toISOString(),
      location,
      qrData,
    };

    console.log('[AttendanceService] Clock-in payload:', JSON.stringify(payload, null, 2));

    // TODO: replace with real API call when backend is ready
    // return apiClient.post<ClockResponse>(API_ENDPOINTS.ATTENDANCE.SCAN_QR, payload);

    return {
      success: true,
      data: {
        success: true,
        timestamp: payload.timestamp,
        message: 'Clock-in recorded',
        location: payload.location,
      },
    };
  }

  /**
   * Record a clock-out event with timestamp and location.
   */
  async clockOut(employeeId: string, qrData: string): Promise<ApiResponse<ClockResponse>> {
    const location = await this.getCurrentLocation();
    const payload: ClockPayload = {
      employeeId,
      type: 'clock-out',
      timestamp: new Date().toISOString(),
      location,
      qrData,
    };

    console.log('[AttendanceService] Clock-out payload:', JSON.stringify(payload, null, 2));

    // TODO: replace with real API call when backend is ready
    // return apiClient.post<ClockResponse>(API_ENDPOINTS.ATTENDANCE.SCAN_QR, payload);

    return {
      success: true,
      data: {
        success: true,
        timestamp: payload.timestamp,
        message: 'Clock-out recorded',
        location: payload.location,
      },
    };
  }
}

export const attendanceService = new AttendanceService();
export default attendanceService;
