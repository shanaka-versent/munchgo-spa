import client from './client';
import { API_CONFIG } from '../config/api';
import type { ApiResponse, AuthResponse, LoginRequest, RegisterRequest, UserProfile } from '../types';

export const authApi = {
  login: (data: LoginRequest) =>
    client.post<ApiResponse<AuthResponse>>(`${API_CONFIG.AUTH_BASE}/login`, data),

  register: (data: RegisterRequest) =>
    client.post<ApiResponse<AuthResponse>>(`${API_CONFIG.AUTH_BASE}/register`, data),

  refresh: (refreshToken: string) =>
    client.post<ApiResponse<AuthResponse>>(`${API_CONFIG.AUTH_BASE}/refresh`, { refreshToken }),

  logout: (userId: string) =>
    client.post<ApiResponse<void>>(`${API_CONFIG.AUTH_BASE}/logout/${userId}`),

  getProfile: (userId: string) =>
    client.get<ApiResponse<UserProfile>>(`${API_CONFIG.AUTH_BASE}/profile/${userId}`),
};
