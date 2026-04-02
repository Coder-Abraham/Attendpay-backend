/**
 * Custom Hooks for Admin Operations
 * Simplifies API calls and state management for admin-related operations
 */

import { useState, useCallback } from 'react';
import { adminService, type EmployeeRecord, type DailyAttendanceReport, type QRCodeResponse } from '@/services';

export interface UseAdminReturn {
  employees: EmployeeRecord[] | null;
  attendanceReport: DailyAttendanceReport[] | null;
  qrCode: QRCodeResponse | null;
  loading: boolean;
  error: string | null;
  fetchEmployees: () => Promise<void>;
  fetchAttendanceReport: (date?: string) => Promise<void>;
  generateQRCode: (type: 'arrival' | 'departure' | 'registration') => Promise<void>;
}

/**
 * Hook for admin dashboard operations
 */
export const useAdmin = (): UseAdminReturn => {
  const [employees, setEmployees] = useState<EmployeeRecord[] | null>(null);
  const [attendanceReport, setAttendanceReport] = useState<DailyAttendanceReport[] | null>(null);
  const [qrCode, setQrCode] = useState<QRCodeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.getEmployees();
      if (response.success && response.data) {
        setEmployees(response.data);
      } else {
        setError(response.error || 'Failed to fetch employees');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAttendanceReport = useCallback(async (date?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.getDailyAttendanceReport(date);
      if (response.success && response.data) {
        setAttendanceReport(response.data);
      } else {
        setError(response.error || 'Failed to fetch attendance report');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  const generateQRCode = useCallback(async (type: 'arrival' | 'departure' | 'registration') => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.generateQRCode(type);
      if (response.success && response.data) {
        setQrCode(response.data);
      } else {
        setError(response.error || 'Failed to generate QR code');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    employees,
    attendanceReport,
    qrCode,
    loading,
    error,
    fetchEmployees,
    fetchAttendanceReport,
    generateQRCode,
  };
};

export default useAdmin;
