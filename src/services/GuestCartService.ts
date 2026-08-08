import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants';
import type { Cart, Product, SelectedOption } from '../models';

// Anonymous shoppers get a cart persisted in AsyncStorage instead of the server-backed one
// (backend's /api/cart requires a signed-in CLIENT). Same `Cart` shape so every screen that
// renders a cart doesn't need to branch on auth state.
function emptyCart(): Cart {
  return { _id: 'guest-cart', client: 'guest', items: [], createdAt: '', updatedAt: '' };
}

function sortedOptionsKey(options: SelectedOption[]): string {
  return [...options]
    .map((o) => `${o.attribute}:${o.option}`)
    .sort()
    .join('|');
}

function computeUnitPrice(product: Product, selectedOptions: SelectedOption[]): number {
  return selectedOptions.reduce((sum, selection) => {
    const match = product.attributeOptions.find(
      (entry) =>
        (typeof entry.attribute === 'object' ? entry.attribute._id : entry.attribute) === selection.attribute &&
        entry.option === selection.option,
    );
    return sum + (match?.priceAdjustment ?? 0);
  }, product.price);
}

async function read(): Promise<Cart> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.GUEST_CART);
    return raw ? (JSON.parse(raw) as Cart) : emptyCart();
  } catch {
    return emptyCart();
  }
}

async function write(cart: Cart): Promise<Cart> {
  await AsyncStorage.setItem(STORAGE_KEYS.GUEST_CART, JSON.stringify(cart));
  return cart;
}

class GuestCartService {
  getCart(): Promise<Cart> {
    return read();
  }

  async addItem(product: Product, quantity: number, selectedOptions: SelectedOption[] = []): Promise<Cart> {
    const cart = await read();
    const key = sortedOptionsKey(selectedOptions);
    const existing = cart.items.find(
      (item) => typeof item.product === 'object' && item.product._id === product._id && sortedOptionsKey(item.selectedOptions) === key,
    );

    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.items.push({
        _id: `guest-${product._id}-${key}`,
        product,
        quantity,
        selectedOptions,
        unitPrice: computeUnitPrice(product, selectedOptions),
      });
    }
    return write(cart);
  }

  async setItemQuantity(itemId: string, quantity: number): Promise<Cart> {
    const cart = await read();
    cart.items = cart.items.map((item) => (item._id === itemId ? { ...item, quantity } : item));
    return write(cart);
  }

  async removeItem(itemId: string): Promise<Cart> {
    const cart = await read();
    cart.items = cart.items.filter((item) => item._id !== itemId);
    return write(cart);
  }

  clear(): Promise<Cart> {
    return write(emptyCart());
  }
}

export const guestCartService = new GuestCartService();
