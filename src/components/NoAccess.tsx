import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../hooks';
import { spacing, typography } from '../theme/theme';

export const NoAccess: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <View style={styles.container}>
      <View style={[styles.iconCircle, { backgroundColor: theme.colors.surfaceAlt }]}>
        <Text style={styles.icon}>🔒</Text>
      </View>
      <Text style={[styles.title, { color: theme.colors.text }]}>{t('access.noAccess.title')}</Text>
      <Text style={[styles.message, { color: theme.colors.textMuted }]}>{t('access.noAccess.message')}</Text>
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
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  icon: { fontSize: 32 },
  title: { ...typography.h3, textAlign: 'center' },
  message: { ...typography.body, textAlign: 'center' },
});
