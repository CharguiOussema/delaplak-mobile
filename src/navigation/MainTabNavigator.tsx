import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { useAccess, useTheme } from '../hooks';
import { withAuthGuard } from './withAuthGuard';
import { radius } from '../theme/theme';
import HomeScreen from '../screens/home/HomeScreen';
import CatalogScreen from '../screens/catalog/CatalogScreen';
import CartScreen from '../screens/cart/CartScreen';
import OrdersScreen from '../screens/orders/OrdersScreen';
import AdminHomeScreen from '../screens/admin/AdminHomeScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();
// Orders and Profile require an identity; guests tapping either tab get a sign-in prompt.
const GuardedOrdersScreen = withAuthGuard(OrdersScreen);
const GuardedProfileScreen = withAuthGuard(ProfileScreen);

const TAB_ICONS: Record<keyof MainTabParamList, string> = {
  HomeTab: '🏠',
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
        tabBarLabelStyle: { fontWeight: '600' },
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopWidth: 0,
          borderTopLeftRadius: radius.lg,
          borderTopRightRadius: radius.lg,
          height: 64,
          paddingTop: 8,
          boxShadow: '0px -4px 20px rgba(15, 23, 42, 0.08)',
          elevation: 8,
        },
        tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>{TAB_ICONS[route.name as keyof MainTabParamList]}</Text>,
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ tabBarLabel: t('nav.home') }} />
      <Tab.Screen name="CatalogTab" component={CatalogScreen} options={{ tabBarLabel: t('nav.catalog') }} />
      {canUseCart ? <Tab.Screen name="CartTab" component={CartScreen} options={{ tabBarLabel: t('nav.cart') }} /> : null}
      <Tab.Screen name="OrdersTab" component={GuardedOrdersScreen} options={{ tabBarLabel: t('nav.orders') }} />
      {canAccessAdminTab ? <Tab.Screen name="AdminTab" component={AdminHomeScreen} options={{ tabBarLabel: t('nav.admin') }} /> : null}
      <Tab.Screen name="ProfileTab" component={GuardedProfileScreen} options={{ tabBarLabel: t('nav.profile') }} />
    </Tab.Navigator>
  );
}
