/**
 * Shared TypeScript types for the MunchGo SPA.
 * Mirrors the Java DTOs from the microservices.
 */

// ── Common ──────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp?: string;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface Address {
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zip: string;
  country?: string;
}

// ── Auth ────────────────────────────────────────────────────────────────────

export type Role = 'ROLE_CUSTOMER' | 'ROLE_RESTAURANT_OWNER' | 'ROLE_COURIER' | 'ROLE_ADMIN';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  userId: string;
  accessToken: string;
  idToken: string;
  refreshToken: string;
}

export interface UserProfile {
  userId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  enabled: boolean;
  createdAt: string;
}

// ── Consumer ────────────────────────────────────────────────────────────────

export interface Consumer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  address?: Address;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Restaurant ──────────────────────────────────────────────────────────────

export interface MenuItem {
  id: string;
  menuItemId: string;
  name: string;
  description?: string;
  price: number;
  available: boolean;
}

export interface Restaurant {
  id: string;
  name: string;
  address?: Address;
  orderMinimum?: number;
  menuItems: MenuItem[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Courier ─────────────────────────────────────────────────────────────────

export interface Courier {
  id: string;
  firstName: string;
  lastName: string;
  address?: Address;
  available: boolean;
  currentOrderId?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Order ───────────────────────────────────────────────────────────────────

export type OrderState =
  | 'APPROVAL_PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'ACCEPTED'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'PICKED_UP'
  | 'DELIVERED';

export interface OrderLineItem {
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface OrderTimestamps {
  createdAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  cancelledAt?: string;
  acceptedAt?: string;
  readyForPickupAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  updatedAt?: string;
}

export interface Order {
  id: string;
  state: OrderState;
  consumerId: string;
  consumerName?: string;
  restaurantId: string;
  restaurantName?: string;
  courierId?: string;
  courierName?: string;
  lineItems: OrderLineItem[];
  total: { amount: number; currency: string };
  deliveryAddress?: Address;
  timestamps: OrderTimestamps;
}

export interface OrderHistory {
  eventType: string;
  occurredAt: string;
  version: number;
  data: Record<string, unknown>;
}

// ── Saga ────────────────────────────────────────────────────────────────────

export interface CreateOrderSagaRequest {
  consumerId: string;
  restaurantId: string;
  lineItems: {
    menuItemId: string;
    name: string;
    quantity: number;
    unitPrice: number;
  }[];
  deliveryAddress: {
    street1: string;
    street2?: string;
    city: string;
    state: string;
    zip: string;
  };
}

export interface SagaStartedResponse {
  sagaId: string;
}

export interface SagaStatusResponse {
  id: string;
  status: string;
  currentStep: string;
  orderId?: string;
  courierId?: string;
  failureReason?: string;
  failedStep?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}
