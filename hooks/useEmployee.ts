/**
 * Custom Hooks for Employee Operations
 * Simplifies API calls and state management for employee-related operations
 */

import { attendanceService, employeeService, type EmployeeProfile, type SalaryDetails } from '@/services';
import { useCallback, useState } from 'react';

export interface UseEmployeeReturn {
  profile: EmployeeProfile | null;
  salary: SalaryDetails | null;
  loading: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
  fetchSalary: () => Promise<void>;
  clockIn: (qrToken?: string) => Promise<boolean>;
  clockOut: (qrToken?: string) => Promise<boolean>;
}

/**
 * Hook for employee profile and salary operations
 */
export const useEmployee = (): UseEmployeeReturn => {
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [salary, setSalary] = useState<SalaryDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await employeeService.getProfile();
      if (response.success && response.data) {
        setProfile(response.data);
      } else {
        setError(response.error || 'Failed to fetch profile');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSalary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // getDashboard contains all salary breakdown fields
      const response = await employeeService.getDashboard();
      if (response.success && response.data) {
        const d = response.data;
        setSalary({
          monthly_salary:    d.monthly_salary,
          daily_salary:      d.daily_salary,
          hourly_salary:     d.hourly_salary,
          today_accumulated: d.today_accumulated,
          week_accumulated:  d.week_accumulated,
          month_accumulated: d.month_accumulated,
        });
      } else {
        setError(response.error || 'Failed to fetch salary details');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  // Uses attendanceService which captures GPS location automatically
  const clockIn = useCallback(async (qrToken: string = ''): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await attendanceService.clockIn(qrToken);
      if (response.success) {
        return true;
      } else {
        setError(response.error || 'Clock in failed');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const clockOut = useCallback(async (qrToken: string = ''): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await attendanceService.clockOut(qrToken);
      if (response.success) {
        return true;
      } else {
        setError(response.error || 'Clock out failed');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    profile,
    salary,
    loading,
    error,
    fetchProfile,
    fetchSalary,
    clockIn,
    clockOut,
  };
};

export default useEmployee;
