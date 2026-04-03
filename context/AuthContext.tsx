import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserRole, UserAuthState, UserRoleResponse } from '../app/Interfaces/Auth';

interface AuthContextType {
  user: UserAuthState;
  login: (employeeId: string, password: string) => Promise<UserRole>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserAuthState>({
    userId: null,
    name: null,
    role: null,
    organizationId: undefined,
    isLoading: false,
    error: null,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Mock user database
  const mockUsers: Record<string, UserRoleResponse & { password: string }> = {
    'EMP001': {
      userId: 'EMP001',
      email: 'joesephsebadduka@uict.ac.ug',
      name: 'Ssebadduka Joseph',
      role: 'employee',
      organizationId: 'ORG001',
      password: 'emp001',
    },
    'EMP002': {
      userId: 'EMP002',
      email: 'usabyimanadaniel@uict.ac.ug',
      name: 'Usabyimana Daniel',
      role: 'employee',
      organizationId: 'ORG001',
      password: 'emp002',
    },
    'EMP003': {
      userId: 'EMP003',
      email: 'merinasserabidde@uict.ac.ug',
      name: 'Sserabidde Merina',
      role: 'employee',
      organizationId: 'ORG001',
      password: 'emp003',
    },
    'ADM001': {
      userId: 'ADM001',
      email: 'Katandiabraham@uict.ac.ug',
      name: 'Abraham Katandi',
      role: 'admin',
      organizationId: 'ORG001',
      password: 'adm001',
    },
  };

  const login = async (employeeId: string, password: string): Promise<UserRole> => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const userFound = mockUsers[employeeId.toUpperCase()];
      if (!userFound) {
        throw new Error('Employee ID not found');
      }
      if (userFound.password !== password) {
        throw new Error('Incorrect password');
      }

      setUser({
        userId: userFound.userId,
        name: userFound.name,
        role: userFound.role,
        organizationId: userFound.organizationId,
        isLoading: false,
        error: null,
      });

      return userFound.role;
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
      name: null,
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
