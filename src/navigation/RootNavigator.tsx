import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { useAuth, useApp, useTheme } from '../hooks';
import { LoadingState } from '../components/ui';
import AuthNavigator from './AuthNavigator';
import AppStackNavigator from './AppStackNavigator';
import { RestartPromptModal } from '../components/RestartPromptModal';

/**
 * Auth gate at the navigator root, mirroring the web app's ProtectedRoute: unauthenticated
 * users only ever see the Auth stack, authenticated users only ever see the main app stack.
 */
export default function RootNavigator() {
  const { isAuthenticated, isBootstrapping } = useAuth();
  const { isLoading: isAppLoading } = useApp();
  const theme = useTheme();

  if (isBootstrapping || isAppLoading) {
    return <LoadingState />;
  }

  return (
    <NavigationContainer
      theme={{
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: theme.colors.background,
          card: theme.colors.surface,
          text: theme.colors.text,
          border: theme.colors.border,
          primary: theme.colors.primary,
        },
      }}
    >
      {isAuthenticated ? <AppStackNavigator /> : <AuthNavigator />}
      <RestartPromptModal />
    </NavigationContainer>
  );
}
