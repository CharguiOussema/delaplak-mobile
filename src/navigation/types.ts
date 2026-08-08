import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';

export type MainTabParamList = {
  HomeTab: undefined;
  CatalogTab: undefined;
  CartTab: undefined;
  OrdersTab: undefined;
  AdminTab: undefined;
  ProfileTab: undefined;
};

// A screen that requires sign-in (e.g. Checkout) pushes 'Login' on top of itself with
// `redirectTo` set to its own route name; LoginScreen/SignupScreen replace themselves
// with that route on success, or just go back if no redirect was requested.
export type AuthRedirect = { redirectTo?: keyof RootStackParamList; redirectParams?: object };

export type RootStackParamList = {
  MainTabs: undefined;
  Login: AuthRedirect | undefined;
  Signup: AuthRedirect | undefined;
  ForgotPassword: undefined;
  ResetPassword: { token?: string } | undefined;
  ProductDetail: { productId: string };
  Checkout: undefined;
  OrderDetail: { orderId: string };
  InvoicesList: undefined;
  InvoiceDetail: { invoiceId: string };
  AdminUsersList: undefined;
  AdminUserForm: { userId?: string } | undefined;
  AdminCategoriesList: undefined;
  AdminCategoryTree: undefined;
  AdminCategoryForm: { categoryId?: string } | undefined;
  AdminProductsList: undefined;
  AdminProductForm: { productId?: string } | undefined;
  AdminProductAttributesList: undefined;
  AdminProductAttributeForm: { attributeId?: string } | undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, T>;

export type MainTabScreenProps<T extends keyof MainTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;
