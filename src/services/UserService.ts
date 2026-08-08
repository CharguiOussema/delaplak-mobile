import { apiService } from './api';
import { QueryBuilder } from './QueryBuilder';
import { PaginationResponse, User } from '../models';

export type CreateUserPayload = {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  role: string;
};

export type UpdateUserPayload = Partial<{
  email: string;
  fullName: string;
  phone: string;
  role: string;
  isActive: boolean;
  preferredLanguage: string;
}>;

class UserService {
  async getAll(params: { page?: number; limit?: number; search?: string } = {}): Promise<PaginationResponse<User>> {
    const url = QueryBuilder.generateURL('/api/users')
      .setQueryParam('page', params.page)
      .setQueryParam('limit', params.limit)
      .setQueryParam('search', params.search)
      .build();
    return apiService.get<PaginationResponse<User>>(url);
  }

  async getById(id: string): Promise<User> {
    return apiService.get<User>(`/api/users/${id}`);
  }

  async create(payload: CreateUserPayload): Promise<User> {
    return apiService.post<User>('/api/users', payload);
  }

  async update(id: string, payload: UpdateUserPayload): Promise<User> {
    return apiService.patch<User>(`/api/users/${id}`, payload);
  }

  async deactivate(id: string): Promise<User> {
    return apiService.patch<User>(`/api/users/${id}/deactivate`);
  }
}

export const userService = new UserService();
