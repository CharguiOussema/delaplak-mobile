import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../hooks';
import { EmptyState, LoadingState } from './ui';
import type { RootStackParamList } from '../navigation/types';

interface RequireAuthProps {
  children: React.ReactNode;
}

// Guards a screen that only makes sense for a signed-in user (Checkout, Orders, admin
// screens, ...). Mirrors the web app's ProtectedRoute, but since React Navigation keeps
// every screen mounted on its own stack entry (no root swap), the gate lives per-screen:
// prompt to sign in, push the Login screen, and let it navigate back on success.
export function RequireAuth({ children }: RequireAuthProps) {
  const { t } = useTranslation();
  const { isAuthenticated, isBootstrapping } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  if (isBootstrapping) {
    return <LoadingState />;
  }

  if (!isAuthenticated) {
    return (
      <EmptyState
        title={t('auth.required.title')}
        message={t('auth.required.message')}
        actionLabel={t('auth.login.submit')}
        onAction={() => navigation.navigate('Login')}
      />
    );
  }

  return <>{children}</>;
}
