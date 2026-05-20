import { apiClient } from '@/services/api';
import { authService } from '@/services/authService';
import { createContext, ReactNode, useContext, useState } from 'react';
import type { UserAuthState, UserRole } from '../types/Auth';

interface AuthContextType {
  user:      UserAuthState;
  login:     (employeeId: string, password: string) => Promise<UserRole>;
  logout:    () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserAuthState>({
    userId:         null,
    name:           null,
    role:           null,
    organizationId: undefined,
    isLoading:      false,
    error:          null,
  });
  const [isLoading, setIsLoading] = useState(false);

  const login = async (employeeId: string, password: string): Promise<UserRole> => {
    setIsLoading(true);
    try {
      const response = await authService.login(employeeId, password);

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Login failed');
      }

      const { token, employee_id, name, role, organization_id } = response.data;

      // Store token in the API client for all subsequent requests
      apiClient.setAuthToken(token);

      setUser({
        userId:         employee_id,
        name,
        role:           role as UserRole,
        organizationId: organization_id,
        isLoading:      false,
        error:          null,
      });

      return role as UserRole;
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Login failed';
      setUser(prev => ({ ...prev, error: msg }));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();   // fires POST /auth/logout/ and clears token
    setUser({
      userId:         null,
      name:           null,
      role:           null,
      organizationId: undefined,
      isLoading:      false,
      error:          null,
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
