/**
 * API configuration.
 * All microservice base URLs are routed through the Kong API gateway.
 */

// Production: empty = same-origin (CloudFront serves SPA + proxies /api/* to Kong)
// Development: set VITE_API_GATEWAY_URL=http://localhost:8080 in .env.development
const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL ?? '';

export const API_CONFIG = {
  AUTH_BASE: `${API_GATEWAY_URL}/api/auth`,
  CONSUMERS_BASE: `${API_GATEWAY_URL}/api/consumers`,
  RESTAURANTS_BASE: `${API_GATEWAY_URL}/api/restaurants`,
  ORDERS_BASE: `${API_GATEWAY_URL}/api/orders`,
  COURIERS_BASE: `${API_GATEWAY_URL}/api/couriers`,
  SAGAS_BASE: `${API_GATEWAY_URL}/api/sagas`,
} as const;
