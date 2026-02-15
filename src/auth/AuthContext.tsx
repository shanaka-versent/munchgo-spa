import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { authApi } from '../api/auth';
import type { UserProfile, LoginRequest, RegisterRequest } from '../types';
import { AuthContext } from './context';

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem('accessToken'),
    loading: true,
  });

  // Load user profile on mount if token exists
  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        const user = JSON.parse(stored) as UserProfile;
        setState((s) => ({ ...s, user, loading: false }));
      } catch {
        setState((s) => ({ ...s, loading: false }));
      }
    } else {
      setState((s) => ({ ...s, loading: false }));
    }
  }, []);

  const login = useCallback(async (data: LoginRequest) => {
    const res = await authApi.login(data);
    const auth = res.data.data;
    localStorage.setItem('accessToken', auth.accessToken);
    localStorage.setItem('refreshToken', auth.refreshToken);

    const profileRes = await authApi.getProfile(auth.userId);
    const user = profileRes.data.data;
    localStorage.setItem('user', JSON.stringify(user));

    setState({ user, token: auth.accessToken, loading: false });
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    const res = await authApi.register(data);
    const auth = res.data.data;
    localStorage.setItem('accessToken', auth.accessToken);
    localStorage.setItem('refreshToken', auth.refreshToken);

    const profileRes = await authApi.getProfile(auth.userId);
    const user = profileRes.data.data;
    localStorage.setItem('user', JSON.stringify(user));

    setState({ user, token: auth.accessToken, loading: false });
  }, []);

  const logout = useCallback(async () => {
    try {
      if (state.user) {
        await authApi.logout(state.user.userId);
      }
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setState({ user: null, token: null, loading: false });
    }
  }, [state.user]);

  const hasRole = useCallback(
    (role: string) => state.user?.roles?.includes(role) ?? false,
    [state.user],
  );

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}
