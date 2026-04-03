export type UserRole = "employee" | "admin" | null;

export interface UserAuthState {
  userId: string | null;
  name: string | null;
  role: UserRole;
  organizationId?: string;
  isLoading: boolean;
  error: string | null;
}

export interface UserLoginCredentials {
  id: string; // Employee ID or Admin ID
  email: string;
  password: string;
}

export interface UserRoleResponse {
  userId: string;
  role: UserRole;
  organizationId?: string;
  name: string;
  email: string;
}
