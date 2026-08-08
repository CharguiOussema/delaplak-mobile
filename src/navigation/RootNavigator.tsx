import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { useApp, useTheme } from '../hooks';
import { LoadingState } from '../components/ui';
import AppStackNavigator from './AppStackNavigator';
import { RestartPromptModal } from '../components/RestartPromptModal';

/**
 * Home, Catalog, ProductDetail and Cart are public (mirrors the web app) — there is no
 * auth gate at the navigator root anymore. Screens that require sign-in are guarded
 * individually in AppStackNavigator via withAuthGuard, which pushes the Login screen
 * as a modal instead of swapping the whole app to an "Auth stack".
 */
export default function RootNavigator() {
  const { isLoading: isAppLoading } = useApp();
  const theme = useTheme();

  if (isAppLoading) {
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
      <AppStackNavigator />
      <RestartPromptModal />
    </NavigationContainer>
  );
}
