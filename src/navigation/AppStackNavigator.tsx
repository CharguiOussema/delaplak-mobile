import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../hooks';
import { withAuthGuard } from './withAuthGuard';
import MainTabNavigator from './MainTabNavigator';
import ProductDetailScreen from '../screens/catalog/ProductDetailScreen';
import CheckoutScreen from '../screens/cart/CheckoutScreen';
import OrderDetailScreen from '../screens/orders/OrderDetailScreen';
import InvoicesListScreen from '../screens/invoices/InvoicesListScreen';
import InvoiceDetailScreen from '../screens/orders/InvoiceDetailScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';
import AdminUsersListScreen from '../screens/admin/users/AdminUsersListScreen';
import AdminUserFormScreen from '../screens/admin/users/AdminUserFormScreen';
import AdminCategoriesListScreen from '../screens/admin/categories/AdminCategoriesListScreen';
import AdminCategoryTreeScreen from '../screens/admin/categories/AdminCategoryTreeScreen';
import AdminCategoryFormScreen from '../screens/admin/categories/AdminCategoryFormScreen';
import AdminProductsListScreen from '../screens/admin/products/AdminProductsListScreen';
import AdminProductFormScreen from '../screens/admin/products/AdminProductFormScreen';
import AdminProductAttributesListScreen from '../screens/admin/productAttributes/AdminProductAttributesListScreen';
import AdminProductAttributeFormScreen from '../screens/admin/productAttributes/AdminProductAttributeFormScreen';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Guarded once here (not swapped at the navigator root) — Home, Catalog, ProductDetail
// and Cart (inside MainTabs) are public; everything below requires sign-in.
const GuardedCheckout = withAuthGuard(CheckoutScreen);
const GuardedOrderDetail = withAuthGuard(OrderDetailScreen);
const GuardedInvoicesList = withAuthGuard(InvoicesListScreen);
const GuardedInvoiceDetail = withAuthGuard(InvoiceDetailScreen);
const GuardedAdminUsersList = withAuthGuard(AdminUsersListScreen);
const GuardedAdminUserForm = withAuthGuard(AdminUserFormScreen);
const GuardedAdminCategoriesList = withAuthGuard(AdminCategoriesListScreen);
const GuardedAdminCategoryTree = withAuthGuard(AdminCategoryTreeScreen);
const GuardedAdminCategoryForm = withAuthGuard(AdminCategoryFormScreen);
const GuardedAdminProductsList = withAuthGuard(AdminProductsListScreen);
const GuardedAdminProductForm = withAuthGuard(AdminProductFormScreen);
const GuardedAdminProductAttributesList = withAuthGuard(AdminProductAttributesListScreen);
const GuardedAdminProductAttributeForm = withAuthGuard(AdminProductAttributeFormScreen);

export default function AppStackNavigator() {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.text,
        headerTitleStyle: { color: theme.colors.text, fontWeight: '700' },
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: t('product.detail.title') }} />
      <Stack.Screen name="Checkout" component={GuardedCheckout} options={{ title: t('checkout.title') }} />
      <Stack.Screen name="OrderDetail" component={GuardedOrderDetail} options={{ title: t('orderDetail.title') }} />
      <Stack.Screen name="InvoicesList" component={GuardedInvoicesList} options={{ title: t('invoices.title') }} />
      <Stack.Screen name="InvoiceDetail" component={GuardedInvoiceDetail} options={{ title: t('invoice.title') }} />

      {/* Sign in/up open as a modal on top of whatever screen requested them. */}
      <Stack.Group screenOptions={{ presentation: 'modal', headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
      </Stack.Group>
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ headerShown: true, title: '' }} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ headerShown: true, title: '' }} />

      <Stack.Screen name="AdminUsersList" component={GuardedAdminUsersList} options={{ title: t('admin.users.title') }} />
      <Stack.Screen
        name="AdminUserForm"
        component={GuardedAdminUserForm}
        options={({ route }) => ({ title: route.params?.userId ? t('admin.users.edit') : t('admin.users.add') })}
      />

      <Stack.Screen name="AdminCategoriesList" component={GuardedAdminCategoriesList} options={{ title: t('admin.categories.title') }} />
      <Stack.Screen name="AdminCategoryTree" component={GuardedAdminCategoryTree} options={{ title: t('admin.categories.tree') }} />
      <Stack.Screen
        name="AdminCategoryForm"
        component={GuardedAdminCategoryForm}
        options={({ route }) => ({ title: route.params?.categoryId ? t('admin.categories.edit') : t('admin.categories.add') })}
      />

      <Stack.Screen name="AdminProductsList" component={GuardedAdminProductsList} options={{ title: t('admin.products.title') }} />
      <Stack.Screen
        name="AdminProductForm"
        component={GuardedAdminProductForm}
        options={({ route }) => ({ title: route.params?.productId ? t('admin.products.edit') : t('admin.products.add') })}
      />

      <Stack.Screen
        name="AdminProductAttributesList"
        component={GuardedAdminProductAttributesList}
        options={{ title: t('admin.productAttributes.title') }}
      />
      <Stack.Screen
        name="AdminProductAttributeForm"
        component={GuardedAdminProductAttributeForm}
        options={({ route }) => ({ title: route.params?.attributeId ? t('admin.productAttributes.edit') : t('admin.productAttributes.add') })}
      />
    </Stack.Navigator>
  );
}
