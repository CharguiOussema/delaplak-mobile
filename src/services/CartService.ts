import { apiService } from './api';
import { Cart, SelectedOption } from '../models';

class CartService {
  async getCart(): Promise<Cart> {
    return apiService.get<Cart>('/api/cart');
  }

  async addItem(productId: string, quantity: number, selectedOptions?: SelectedOption[]): Promise<Cart> {
    return apiService.post<Cart>('/api/cart/items', { product: productId, quantity, selectedOptions });
  }

  // `itemId` targets a specific cart line — a product with several option combinations in
  // the cart occupies several lines, so productId alone can't disambiguate which to update.
  async setItemQuantity(itemId: string, quantity: number): Promise<Cart> {
    return apiService.patch<Cart>(`/api/cart/items/${itemId}`, { quantity });
  }

  async removeItem(itemId: string): Promise<Cart> {
    return apiService.delete<Cart>(`/api/cart/items/${itemId}`);
  }

  async clear(): Promise<Cart> {
    return apiService.delete<Cart>('/api/cart');
  }
}

export const cartService = new CartService();
