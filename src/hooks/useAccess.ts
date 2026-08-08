import { useAuth } from './useAuth';
import { USER_ROLES } from '../models';

/**
 * Mirrors the backend permission matrix (verified against delaplak-server's route files):
 *  - Catalog/products/categories: browsable by both roles.
 *  - Category & Product write access: ADMIN only.
 *  - Users CRUD: ADMIN only.
 *  - Cart & self-checkout: CLIENT only.
 *  - Order confirmation: ADMIN only.
 *  - Invoices list/download: ADMIN and CLIENT (server-side scoped to own invoices for CLIENT).
 *
 * This is UX-only; the backend re-enforces every one of these server-side. Hiding/disabling
 * here just avoids showing controls a given role would get a 403 for.
 */
export const useAccess = () => {
  const { user } = useAuth();
  const role = user?.role ?? null;

  const isAdmin = role === USER_ROLES.ADMIN;
  const isClient = role === USER_ROLES.CLIENT;

  return {
    role,
    isAdmin,
    isClient,
    isStaff: isAdmin,
    canAccessAdminTab: isAdmin,
    canManageUsers: isAdmin,
    canWriteCategories: isAdmin,
    canWriteProducts: isAdmin,
    canWriteProductAttributes: isAdmin,
    canConfirmOrders: isAdmin,
    // Guests and signed-in clients can add to cart; staff have no cart. Checkout still
    // requires a signed-in CLIENT (guests are prompted to sign in from the cart screen).
    canUseCart: !role || isClient,
    canCheckout: isClient,
  };
};
