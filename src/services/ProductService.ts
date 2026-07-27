import { API_URL } from '../constants';
import { apiService } from './api';
import { tokenStorage } from './tokenStorage';
import { QueryBuilder } from './QueryBuilder';
import { FilterOption, I18nText, PaginationResponse, Product } from '../models';

export type ProductPayload = {
  name: I18nText;
  description: I18nText;
  price: number;
  currency?: string;
  dimensions?: string;
  thickness?: string;
  texture?: string;
  applicationDomains?: string[];
  category: string;
  stock?: number;
};

class ProductService {
  async getAll(
    params: { page?: number; limit?: number; search?: string; category?: string } = {},
  ): Promise<PaginationResponse<Product>> {
    const url = QueryBuilder.generateURL('/api/products')
      .setQueryParam('page', params.page)
      .setQueryParam('limit', params.limit)
      .setQueryParam('search', params.search)
      .setQueryParam('category', params.category)
      .build();
    return apiService.get<PaginationResponse<Product>>(url);
  }

  async getFilter(): Promise<FilterOption[]> {
    return apiService.get<FilterOption[]>('/api/products/filter');
  }

  async getById(id: string): Promise<Product> {
    return apiService.get<Product>(`/api/products/${id}`);
  }

  async create(payload: ProductPayload): Promise<Product> {
    return apiService.post<Product>('/api/products', payload);
  }

  async update(id: string, payload: Partial<ProductPayload>): Promise<Product> {
    return apiService.patch<Product>(`/api/products/${id}`, payload);
  }

  async remove(id: string): Promise<void> {
    await apiService.delete(`/api/products/${id}`);
  }

  /** Uploads local image URIs (from expo-image-picker) as multipart/form-data. */
  async addImages(id: string, imageUris: { uri: string; name: string; type: string }[]): Promise<Product> {
    const formData = new FormData();
    imageUris.forEach((image) => {
      // React Native's FormData accepts this {uri,name,type} shape directly.
      formData.append('images', {
        uri: image.uri,
        name: image.name,
        type: image.type,
      } as unknown as Blob);
    });

    const token = await tokenStorage.getAccessToken();
    const response = await fetch(`${API_URL}/api/products/${id}/images`, {
      method: 'POST',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        Accept: 'application/json',
      },
      body: formData,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `Upload failed with status ${response.status}`);
    }
    return response.json();
  }

  async removeImage(id: string, path: string): Promise<Product> {
    return apiService.delete<Product>(`/api/products/${id}/images`, { data: { path } });
  }

  /** Prefixes a relative image path returned by the API with the API base URL. */
  resolveImageUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `${API_URL}${path.startsWith('/') ? path : `/${path}`}`;
  }
}

export const productService = new ProductService();
