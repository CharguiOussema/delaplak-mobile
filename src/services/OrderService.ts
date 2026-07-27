import { apiService } from './api';
import { QueryBuilder } from './QueryBuilder';
import { Invoice, Order, PaginationResponse } from '../models';

class OrderService {
  async create(): Promise<Order> {
    return apiService.post<Order>('/api/orders');
  }

  async getAll(params: { page?: number; limit?: number; search?: string } = {}): Promise<PaginationResponse<Order>> {
    const url = QueryBuilder.generateURL('/api/orders')
      .setQueryParam('page', params.page)
      .setQueryParam('limit', params.limit)
      .setQueryParam('search', params.search)
      .build();
    return apiService.get<PaginationResponse<Order>>(url);
  }

  async getById(id: string): Promise<Order> {
    return apiService.get<Order>(`/api/orders/${id}`);
  }

  /** Confirming also generates the invoice server-side; the backend returns both in one shot. */
  async confirm(id: string): Promise<{ order: Order; invoice: Invoice }> {
    return apiService.patch<{ order: Order; invoice: Invoice }>(`/api/orders/${id}/confirm`);
  }
}

export const orderService = new OrderService();
