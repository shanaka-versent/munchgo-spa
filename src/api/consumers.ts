import client from './client';
import { API_CONFIG } from '../config/api';
import type { ApiResponse, Consumer } from '../types';

export const consumersApi = {
  getAll: () =>
    client.get<ApiResponse<Consumer[]>>(API_CONFIG.CONSUMERS_BASE),

  getById: (consumerId: string) =>
    client.get<ApiResponse<Consumer>>(`${API_CONFIG.CONSUMERS_BASE}/${consumerId}`),
};
