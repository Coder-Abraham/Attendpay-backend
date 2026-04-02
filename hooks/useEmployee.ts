/**
 * Custom Hooks for Employee Operations
 * Simplifies API calls and state management for employee-related operations
 */

import { useState, useCallback } from 'react';
import { employeeService, type EmployeeProfile, type SalaryDetails } from '@/services';

export interface UseEmployeeReturn {
  profile: EmployeeProfile | null;
  salary: SalaryDetails | null;
  loading: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
  fetchSalary: () => Promise<void>;
  clockIn: (qrData?: any) => Promise<boolean>;
  clockOut: (qrData?: any) => Promise<boolean>;
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
      const response = await employeeService.getSalaryDetails();
      if (response.success && response.data) {
        setSalary(response.data);
      } else {
        setError(response.error || 'Failed to fetch salary details');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  const clockIn = useCallback(async (qrData?: any): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await employeeService.clockIn(qrData);
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

  const clockOut = useCallback(async (qrData?: any): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await employeeService.clockOut(qrData);
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
