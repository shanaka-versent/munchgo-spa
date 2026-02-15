/**
 * API configuration.
 * All microservice base URLs are routed through the Kong API gateway.
 */

const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL ?? 'http://localhost:8080';

export const API_CONFIG = {
  AUTH_BASE: `${API_GATEWAY_URL}/api/v1/auth`,
  CONSUMERS_BASE: `${API_GATEWAY_URL}/api/v1/consumers`,
  RESTAURANTS_BASE: `${API_GATEWAY_URL}/api/v1/restaurants`,
  ORDERS_BASE: `${API_GATEWAY_URL}/api/v1/orders`,
  COURIERS_BASE: `${API_GATEWAY_URL}/api/v1/couriers`,
  SAGAS_BASE: `${API_GATEWAY_URL}/api/v1/sagas`,
} as const;
