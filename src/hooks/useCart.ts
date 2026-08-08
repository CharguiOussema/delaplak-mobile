import { useMutation, useQuery, useQueryClient } from 'react-query';
import { cartService } from '../services/CartService';
import { guestCartService } from '../services/GuestCartService';
import { queryKeys } from '../services/QueryClientManager';
import { useAuth } from './useAuth';
import { USER_ROLES } from '../models';
import type { Cart, Product, SelectedOption } from '../models';

interface AddItemArgs {
  product: Product;
  quantity: number;
  selectedOptions?: SelectedOption[];
}

// Single cart surface used by every screen: server-backed cart for signed-in CLIENTs,
// AsyncStorage-backed cart for guests, empty for staff (backend's cart router is
// CLIENT_ONLY) — so screens don't have to branch on auth state themselves.
export function useCart() {
  const { user } = useAuth();
  const useServerCart = user?.role === USER_ROLES.CLIENT;
  const isStaff = user?.role === USER_ROLES.ADMIN;
  const queryClient = useQueryClient();

  const cartQuery = useQuery<Cart>(
    [queryKeys.CART, useServerCart],
    () => (useServerCart ? cartService.getCart() : guestCartService.getCart()),
    { enabled: !isStaff },
  );

  const invalidate = () => queryClient.invalidateQueries(queryKeys.CART);

  const addItem = useMutation(
    ({ product, quantity, selectedOptions = [] }: AddItemArgs) =>
      useServerCart
        ? cartService.addItem(product._id, quantity, selectedOptions)
        : guestCartService.addItem(product, quantity, selectedOptions),
    { onSuccess: invalidate },
  );

  const setItemQuantity = useMutation(
    ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      useServerCart ? cartService.setItemQuantity(itemId, quantity) : guestCartService.setItemQuantity(itemId, quantity),
    { onSuccess: invalidate },
  );

  const removeItem = useMutation(
    (itemId: string) => (useServerCart ? cartService.removeItem(itemId) : guestCartService.removeItem(itemId)),
    { onSuccess: invalidate },
  );

  const clear = useMutation(() => (useServerCart ? cartService.clear() : guestCartService.clear()), { onSuccess: invalidate });

  return {
    cart: cartQuery.data,
    isLoading: cartQuery.isLoading,
    isError: cartQuery.isError,
    error: cartQuery.error,
    refetch: cartQuery.refetch,
    addItem,
    setItemQuantity,
    removeItem,
    clear,
  };
}

// Pushes any items added while browsing as a guest into the freshly-authenticated user's
// server cart, then clears local storage. Best-effort: a failed line item is skipped
// rather than blocking login.
export async function mergeGuestCartIntoServer(): Promise<void> {
  const guestCart = await guestCartService.getCart();
  if (guestCart.items.length === 0) return;

  for (const item of guestCart.items) {
    if (typeof item.product === 'string') continue;
    try {
      await cartService.addItem(item.product._id, item.quantity, item.selectedOptions);
    } catch {
      // skip items the server rejects (e.g. now out of stock) — don't block login
    }
  }
  await guestCartService.clear();
}
