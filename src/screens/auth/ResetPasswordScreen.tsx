import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../hooks';
import { Button, Input, Screen } from '../../components/ui';
import { authService } from '../../services/AuthService';
import { getErrorMessage } from '../../utils/errorHandling';
import { spacing, typography } from '../../theme/theme';
import type { RootStackScreenProps } from '../../navigation/types';

export default function ResetPasswordScreen({ navigation, route }: RootStackScreenProps<'ResetPassword'>) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [token, setToken] = useState(route.params?.token ?? '');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      await authService.resetPassword(token.trim(), newPassword);
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
        <Text style={[styles.title, { color: theme.colors.text }]}>{t('auth.resetPassword.title')}</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>{t('auth.resetPassword.subtitle')}</Text>
      </View>

      {success ? (
        <>
          <Text style={[styles.success, { color: theme.colors.success }]}>{t('auth.resetPassword.success')}</Text>
          <Button title={t('auth.forgotPassword.backToLogin')} onPress={() => navigation.replace('Login')} fullWidth />
        </>
      ) : (
        <>
          <Input label={t('auth.resetPassword.token')} value={token} onChangeText={setToken} autoCapitalize="none" />
          <Input label={t('auth.resetPassword.newPassword')} value={newPassword} onChangeText={setNewPassword} secureTextEntry />
          {error ? <Text style={[styles.error, { color: theme.colors.danger }]}>{error}</Text> : null}
          <Button title={t('auth.resetPassword.submit')} onPress={handleSubmit} loading={loading} fullWidth />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: spacing.xxl, marginBottom: spacing.xl },
  title: { ...typography.h1 },
  subtitle: { ...typography.body, marginTop: spacing.xs },
  error: { ...typography.small, marginBottom: spacing.md },
  success: { ...typography.body, marginBottom: spacing.lg },
});
