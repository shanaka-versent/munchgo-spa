import client from './client';
import { API_CONFIG } from '../config/api';
import type { ApiResponse, Courier } from '../types';

export const couriersApi = {
  getAll: () =>
    client.get<ApiResponse<Courier[]>>(API_CONFIG.COURIERS_BASE),

  getById: (courierId: string) =>
    client.get<ApiResponse<Courier>>(`${API_CONFIG.COURIERS_BASE}/${courierId}`),

  getAvailable: (city?: string) =>
    client.get<ApiResponse<Courier[]>>(`${API_CONFIG.COURIERS_BASE}/available`, {
      params: city ? { city } : undefined,
    }),
};
