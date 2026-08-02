import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../hooks';
import MainTabNavigator from './MainTabNavigator';
import ProductDetailScreen from '../screens/catalog/ProductDetailScreen';
import CheckoutScreen from '../screens/cart/CheckoutScreen';
import OrderDetailScreen from '../screens/orders/OrderDetailScreen';
import InvoicesListScreen from '../screens/invoices/InvoicesListScreen';
import InvoiceDetailScreen from '../screens/orders/InvoiceDetailScreen';
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
      <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: t('checkout.title') }} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: t('orderDetail.title') }} />
      <Stack.Screen name="InvoicesList" component={InvoicesListScreen} options={{ title: t('invoices.title') }} />
      <Stack.Screen name="InvoiceDetail" component={InvoiceDetailScreen} options={{ title: t('invoice.title') }} />

      <Stack.Screen name="AdminUsersList" component={AdminUsersListScreen} options={{ title: t('admin.users.title') }} />
      <Stack.Screen
        name="AdminUserForm"
        component={AdminUserFormScreen}
        options={({ route }) => ({ title: route.params?.userId ? t('admin.users.edit') : t('admin.users.add') })}
      />

      <Stack.Screen name="AdminCategoriesList" component={AdminCategoriesListScreen} options={{ title: t('admin.categories.title') }} />
      <Stack.Screen name="AdminCategoryTree" component={AdminCategoryTreeScreen} options={{ title: t('admin.categories.tree') }} />
      <Stack.Screen
        name="AdminCategoryForm"
        component={AdminCategoryFormScreen}
        options={({ route }) => ({ title: route.params?.categoryId ? t('admin.categories.edit') : t('admin.categories.add') })}
      />

      <Stack.Screen name="AdminProductsList" component={AdminProductsListScreen} options={{ title: t('admin.products.title') }} />
      <Stack.Screen
        name="AdminProductForm"
        component={AdminProductFormScreen}
        options={({ route }) => ({ title: route.params?.productId ? t('admin.products.edit') : t('admin.products.add') })}
      />

      <Stack.Screen
        name="AdminProductAttributesList"
        component={AdminProductAttributesListScreen}
        options={{ title: t('admin.productAttributes.title') }}
      />
      <Stack.Screen
        name="AdminProductAttributeForm"
        component={AdminProductAttributeFormScreen}
        options={({ route }) => ({ title: route.params?.attributeId ? t('admin.productAttributes.edit') : t('admin.productAttributes.add') })}
      />
    </Stack.Navigator>
  );
}
