/**
 * Attendance Service
 * Captures GPS location then delegates to employeeService for the actual API call.
 */

import * as Location from 'expo-location';
import type { ApiResponse } from './api';
import { employeeService, type ClockInOutResponse } from './employeeService';

export interface LocationSnapshot {
  latitude:  number;
  longitude: number;
  accuracy:  number | null;
}

class AttendanceService {
  async requestLocationPermission(): Promise<boolean> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  }

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
        latitude:  pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy:  pos.coords.accuracy,
      };
    } catch {
      return null;
    }
  }

  async clockIn(qrToken: string): Promise<ApiResponse<ClockInOutResponse>> {
    const location = await this.getCurrentLocation();
    // Fall back to company coordinates if location unavailable
    const lat = location?.latitude  ?? 0.32942;
    const lng = location?.longitude ?? 32.61419;
    return employeeService.clockIn(qrToken, lat, lng);
  }

  async clockOut(qrToken: string): Promise<ApiResponse<ClockInOutResponse>> {
    const location = await this.getCurrentLocation();
    const lat = location?.latitude  ?? 0.32942;
    const lng = location?.longitude ?? 32.61419;
    return employeeService.clockOut(qrToken, lat, lng);
  }
}

export const attendanceService = new AttendanceService();
export default attendanceService;
