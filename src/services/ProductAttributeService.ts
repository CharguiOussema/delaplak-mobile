import { apiService } from './api';
import { QueryBuilder } from './QueryBuilder';
import { FilterOption, I18nText, PaginationResponse, ProductAttribute } from '../models';

export type ProductAttributePayload = {
  name: Partial<I18nText>;
  options?: Partial<I18nText>[];
};

class ProductAttributeService {
  async getAll(params: { page?: number; limit?: number; search?: string } = {}): Promise<PaginationResponse<ProductAttribute>> {
    const url = QueryBuilder.generateURL('/api/product-attributes')
      .setQueryParam('page', params.page)
      .setQueryParam('limit', params.limit)
      .setQueryParam('search', params.search)
      .build();
    return apiService.get<PaginationResponse<ProductAttribute>>(url);
  }

  async getFilter(): Promise<FilterOption[]> {
    return apiService.get<FilterOption[]>('/api/product-attributes/filter');
  }

  async getById(id: string): Promise<ProductAttribute> {
    return apiService.get<ProductAttribute>(`/api/product-attributes/${id}`);
  }

  async create(payload: ProductAttributePayload): Promise<ProductAttribute> {
    return apiService.post<ProductAttribute>('/api/product-attributes', payload);
  }

  async update(id: string, payload: { name: Partial<I18nText> }): Promise<ProductAttribute> {
    return apiService.patch<ProductAttribute>(`/api/product-attributes/${id}`, payload);
  }

  async remove(id: string): Promise<void> {
    await apiService.delete(`/api/product-attributes/${id}`);
  }

  async addOption(id: string, name: Partial<I18nText>): Promise<ProductAttribute> {
    return apiService.post<ProductAttribute>(`/api/product-attributes/${id}/options`, { name });
  }

  async updateOption(id: string, optionId: string, name: Partial<I18nText>): Promise<ProductAttribute> {
    return apiService.patch<ProductAttribute>(`/api/product-attributes/${id}/options/${optionId}`, { name });
  }

  async removeOption(id: string, optionId: string): Promise<ProductAttribute> {
    return apiService.delete<ProductAttribute>(`/api/product-attributes/${id}/options/${optionId}`);
  }
}

export const productAttributeService = new ProductAttributeService();
