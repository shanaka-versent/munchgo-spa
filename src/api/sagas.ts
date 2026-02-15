import client from './client';
import { API_CONFIG } from '../config/api';
import type { ApiResponse, CreateOrderSagaRequest, SagaStatusResponse } from '../types';

interface SagaStartedResponse {
  sagaId: string;
}

export const sagasApi = {
  createOrder: (data: CreateOrderSagaRequest) =>
    client.post<ApiResponse<SagaStartedResponse>>(`${API_CONFIG.SAGAS_BASE}/create-order`, data),

  getStatus: (sagaId: string) =>
    client.get<ApiResponse<SagaStatusResponse>>(`${API_CONFIG.SAGAS_BASE}/${sagaId}`),
};
