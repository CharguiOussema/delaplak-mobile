import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../hooks';
import { Button, Input, Screen } from '../../components/ui';
import { authService } from '../../services/AuthService';
import { getErrorMessage } from '../../utils/errorHandling';
import { spacing, typography } from '../../theme/theme';
import type { RootStackScreenProps } from '../../navigation/types';

export default function ForgotPasswordScreen({ navigation }: RootStackScreenProps<'ForgotPassword'>) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      await authService.forgotPassword(email.trim());
      setSuccess(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>{t('auth.forgotPassword.title')}</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>{t('auth.forgotPassword.subtitle')}</Text>
      </View>

      {success ? (
        <Text style={[styles.success, { color: theme.colors.success }]}>{t('auth.forgotPassword.success')}</Text>
      ) : (
        <>
          <Input
            label={t('auth.forgotPassword.email')}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          {error ? <Text style={[styles.error, { color: theme.colors.danger }]}>{error}</Text> : null}
          <Button title={t('auth.forgotPassword.submit')} onPress={handleSubmit} loading={loading} fullWidth />
        </>
      )}

      <Text style={[styles.link, { color: theme.colors.primary }]} onPress={() => navigation.replace('Login')}>
        {t('auth.forgotPassword.backToLogin')}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: spacing.xxl, marginBottom: spacing.xl },
  title: { ...typography.h1 },
  subtitle: { ...typography.body, marginTop: spacing.xs },
  error: { ...typography.small, marginBottom: spacing.md },
  success: { ...typography.body, marginBottom: spacing.lg },
  link: { ...typography.bodyBold, marginTop: spacing.xl, textAlign: 'center' },
});
