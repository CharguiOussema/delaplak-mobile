import { QueryClient } from 'react-query';

export const queryKeys = {
  CURRENT_USER: 'currentUser',
  CATEGORIES: 'categories',
  CATEGORY_TREE: 'categoryTree',
  CATEGORY_FILTER: 'categoryFilter',
  PRODUCTS: 'products',
  PRODUCT_FILTER: 'productFilter',
  PRODUCT: 'product',
  PRODUCT_ATTRIBUTES: 'productAttributes',
  PRODUCT_ATTRIBUTE_FILTER: 'productAttributeFilter',
  CART: 'cart',
  ORDERS: 'orders',
  ORDER: 'order',
  INVOICES: 'invoices',
  INVOICE: 'invoice',
  USERS: 'users',
  USER: 'user',
  SITE_SETTINGS: 'siteSettings',
  DASHBOARD_STATS: 'dashboardStats',
} as const;

class QueryClientManager {
  private static instance: QueryClientManager;
  private queryClient: QueryClient;

  private constructor() {
    this.queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 1000 * 60 * 5,
          refetchOnWindowFocus: false,
          retry: 1,
        },
        mutations: { retry: 0 },
      },
    });
  }

  static getInstance(): QueryClientManager {
    if (!QueryClientManager.instance) {
      QueryClientManager.instance = new QueryClientManager();
    }
    return QueryClientManager.instance;
  }

  getQueryClient(): QueryClient {
    return this.queryClient;
  }

  invalidateQueries(queryKey: string | string[]) {
    return this.queryClient.invalidateQueries(queryKey);
  }

  clear() {
    this.queryClient.clear();
  }
}

export const queryClientManager = QueryClientManager.getInstance();
