import { apiService } from './api';
import { Cart } from '../models';

class CartService {
  async getCart(): Promise<Cart> {
    return apiService.get<Cart>('/api/cart');
  }

  async addItem(productId: string, quantity: number): Promise<Cart> {
    return apiService.post<Cart>('/api/cart/items', { productId, quantity });
  }

  async setItemQuantity(productId: string, quantity: number): Promise<Cart> {
    return apiService.patch<Cart>(`/api/cart/items/${productId}`, { quantity });
  }

  async removeItem(productId: string): Promise<Cart> {
    return apiService.delete<Cart>(`/api/cart/items/${productId}`);
  }

  async clear(): Promise<Cart> {
    return apiService.delete<Cart>('/api/cart');
  }
}

export const cartService = new CartService();
