import { createContext } from 'react';
import type { UserProfile, LoginRequest, RegisterRequest } from '../types';

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
}

export interface AuthContextValue extends AuthState {
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (role: string) => boolean;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
