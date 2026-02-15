import client from './client';
import { API_CONFIG } from '../config/api';
import type { ApiResponse, Restaurant } from '../types';

export const restaurantsApi = {
  getAll: () =>
    client.get<ApiResponse<Restaurant[]>>(API_CONFIG.RESTAURANTS_BASE),

  getById: (restaurantId: string) =>
    client.get<ApiResponse<Restaurant>>(`${API_CONFIG.RESTAURANTS_BASE}/${restaurantId}`),
};
