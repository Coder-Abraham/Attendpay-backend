import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserRole, UserAuthState, UserRoleResponse } from '../app/Interfaces/Auth';

interface AuthContextType {
  user: UserAuthState;
  login: (employeeId: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserAuthState>({
    userId: null,
    role: null,
    organizationId: undefined,
    isLoading: false,
    error: null,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Mock user database
  const mockUsers: Record<string, UserRoleResponse> = {
    'EMP001': {
      userId: 'EMP001',
      email: 'employee@company.com',
      name: 'John Doe',
      role: 'employee',
      organizationId: 'ORG001',
    },
    'EMP002': {
      userId: 'EMP002',
      email: 'employee2@company.com',
      name: 'Jane Smith',
      role: 'employee',
      organizationId: 'ORG001',
    },
    'ADM001': {
      userId: 'ADM001',
      email: 'admin@company.com',
      name: 'Admin User',
      role: 'admin',
      organizationId: 'ORG001',
    },
  };

  const login = async (employeeId: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const userFound = mockUsers[employeeId.toUpperCase()];
      if (!userFound) {
        throw new Error('Employee ID not found');
      }

      setUser({
        userId: userFound.userId,
        role: userFound.role,
        organizationId: userFound.organizationId,
        isLoading: false,
        error: null,
      });

      // Store in AsyncStorage for persistence (optional)
      // await AsyncStorage.setItem('userId', userFound.userId);
      // await AsyncStorage.setItem('userRole', userFound.role);
    } catch (error) {
      setUser((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Login failed',
      }));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser({
      userId: null,
      role: null,
      organizationId: undefined,
      isLoading: false,
      error: null,
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
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
