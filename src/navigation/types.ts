import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token?: string } | undefined;
};

export type MainTabParamList = {
  CatalogTab: undefined;
  CartTab: undefined;
  OrdersTab: undefined;
  AdminTab: undefined;
  ProfileTab: undefined;
};

export type RootStackParamList = {
  MainTabs: undefined;
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

export type AuthStackScreenProps<T extends keyof AuthStackParamList> = NativeStackScreenProps<AuthStackParamList, T>;
