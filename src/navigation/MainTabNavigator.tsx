import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { useAccess, useTheme } from '../hooks';
import CatalogScreen from '../screens/catalog/CatalogScreen';
import CartScreen from '../screens/cart/CartScreen';
import OrdersScreen from '../screens/orders/OrdersScreen';
import AdminHomeScreen from '../screens/admin/AdminHomeScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_ICONS: Record<keyof MainTabParamList, string> = {
  CatalogTab: '🧱',
  CartTab: '🛒',
  OrdersTab: '📦',
  AdminTab: '⚙️',
  ProfileTab: '👤',
};

export default function MainTabNavigator() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { canUseCart, canAccessAdminTab } = useAccess();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border },
        tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>{TAB_ICONS[route.name as keyof MainTabParamList]}</Text>,
      })}
    >
      <Tab.Screen name="CatalogTab" component={CatalogScreen} options={{ tabBarLabel: t('nav.catalog') }} />
      {canUseCart ? <Tab.Screen name="CartTab" component={CartScreen} options={{ tabBarLabel: t('nav.cart') }} /> : null}
      <Tab.Screen name="OrdersTab" component={OrdersScreen} options={{ tabBarLabel: t('nav.orders') }} />
      {canAccessAdminTab ? <Tab.Screen name="AdminTab" component={AdminHomeScreen} options={{ tabBarLabel: t('nav.admin') }} /> : null}
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ tabBarLabel: t('nav.profile') }} />
    </Tab.Navigator>
  );
}
