import { apiService } from './api';
import { QueryBuilder } from './QueryBuilder';
import { Category, CategoryTreeNode, FilterOption, I18nText, PaginationResponse } from '../models';

export type CategoryPayload = {
  name: Partial<I18nText>;
  description?: Partial<I18nText>;
  slug: string;
  parent?: string | null;
};

class CategoryService {
  async getAll(params: { page?: number; limit?: number; search?: string } = {}): Promise<PaginationResponse<Category>> {
    const url = QueryBuilder.generateURL('/api/categories')
      .setQueryParam('page', params.page)
      .setQueryParam('limit', params.limit)
      .setQueryParam('search', params.search)
      .build();
    return apiService.get<PaginationResponse<Category>>(url);
  }

  async getTree(): Promise<CategoryTreeNode[]> {
    return apiService.get<CategoryTreeNode[]>('/api/categories/tree');
  }

  async getFilter(): Promise<FilterOption[]> {
    return apiService.get<FilterOption[]>('/api/categories/filter');
  }

  async getById(id: string): Promise<Category> {
    return apiService.get<Category>(`/api/categories/${id}`);
  }

  async create(payload: CategoryPayload): Promise<Category> {
    return apiService.post<Category>('/api/categories', payload);
  }

  async update(id: string, payload: Partial<CategoryPayload>): Promise<Category> {
    return apiService.patch<Category>(`/api/categories/${id}`, payload);
  }

  async remove(id: string): Promise<void> {
    await apiService.delete(`/api/categories/${id}`);
  }
}

export const categoryService = new CategoryService();
