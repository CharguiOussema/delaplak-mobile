import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../hooks';
import { spacing, typography } from '../../theme/theme';

export const LoadingState: React.FC<{ label?: string }> = ({ label }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={[styles.label, { color: theme.colors.textMuted }]}>{label ?? t('common.loading')}</Text>
    </View>
  );
};

export const ErrorState: React.FC<{ message?: string; onRetry?: () => void }> = ({ message, onRetry }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <View style={styles.container}>
      <Text style={[styles.errorTitle, { color: theme.colors.danger }]}>{message ?? t('common.error')}</Text>
      {onRetry ? (
        <Text onPress={onRetry} style={[styles.retry, { color: theme.colors.primary }]}>
          {t('common.retry')}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
  },
  label: { ...typography.body },
  errorTitle: { ...typography.body, textAlign: 'center' },
  retry: { ...typography.bodyBold, marginTop: spacing.xs },
});
