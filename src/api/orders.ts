import client from './client';
import { API_CONFIG } from '../config/api';
import type { ApiResponse, Order, OrderHistory, OrderState, PagedResponse } from '../types';

export const ordersApi = {
  getById: (orderId: string) =>
    client.get<ApiResponse<Order>>(`${API_CONFIG.ORDERS_BASE}/${orderId}`),

  getByConsumer: (consumerId: string, page = 0, size = 20) =>
    client.get<ApiResponse<PagedResponse<Order>>>(API_CONFIG.ORDERS_BASE, {
      params: { consumerId, page, size },
    }),

  getByRestaurant: (restaurantId: string, page = 0, size = 20) =>
    client.get<ApiResponse<PagedResponse<Order>>>(API_CONFIG.ORDERS_BASE, {
      params: { restaurantId, page, size },
    }),

  getByCourier: (courierId: string, page = 0, size = 20) =>
    client.get<ApiResponse<PagedResponse<Order>>>(API_CONFIG.ORDERS_BASE, {
      params: { courierId, page, size },
    }),

  getByState: (state: OrderState, page = 0, size = 100) =>
    client.get<ApiResponse<PagedResponse<Order>>>(API_CONFIG.ORDERS_BASE, {
      params: { state, page, size },
    }),

  getHistory: (orderId: string) =>
    client.get<ApiResponse<OrderHistory[]>>(`${API_CONFIG.ORDERS_BASE}/${orderId}/history`),

  // Command operations
  approve: (orderId: string, courierId: string) =>
    client.post<ApiResponse<void>>(`${API_CONFIG.ORDERS_BASE}/${orderId}/approve`, { courierId }),

  reject: (orderId: string, reason: string) =>
    client.post<ApiResponse<void>>(`${API_CONFIG.ORDERS_BASE}/${orderId}/reject`, { reason }),

  cancel: (orderId: string, reason: string) =>
    client.post<ApiResponse<void>>(`${API_CONFIG.ORDERS_BASE}/${orderId}/cancel`, { reason }),

  accept: (orderId: string, readyBy: string) =>
    client.post<ApiResponse<void>>(`${API_CONFIG.ORDERS_BASE}/${orderId}/accept`, { readyBy }),

  markPreparing: (orderId: string) =>
    client.post<ApiResponse<void>>(`${API_CONFIG.ORDERS_BASE}/${orderId}/preparing`),

  markReadyForPickup: (orderId: string) =>
    client.post<ApiResponse<void>>(`${API_CONFIG.ORDERS_BASE}/${orderId}/ready-for-pickup`),

  markPickedUp: (orderId: string) =>
    client.post<ApiResponse<void>>(`${API_CONFIG.ORDERS_BASE}/${orderId}/picked-up`),

  markDelivered: (orderId: string) =>
    client.post<ApiResponse<void>>(`${API_CONFIG.ORDERS_BASE}/${orderId}/delivered`),
};
