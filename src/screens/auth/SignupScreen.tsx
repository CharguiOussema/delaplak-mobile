import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth, useTheme } from '../../hooks';
import { Button, Input, Screen } from '../../components/ui';
import { getErrorMessage } from '../../utils/errorHandling';
import { spacing, typography } from '../../theme/theme';
import type { AuthStackScreenProps } from '../../navigation/types';

export default function SignupScreen({ navigation }: AuthStackScreenProps<'Signup'>) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { signup } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    if (password !== confirmPassword) {
      setError(t('auth.signup.passwordMismatch'));
      return;
    }
    setLoading(true);
    try {
      await signup(email.trim(), password);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>{t('auth.signup.title')}</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>{t('auth.signup.subtitle')}</Text>
      </View>

      <Input label={t('auth.signup.email')} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <Input label={t('auth.signup.password')} value={password} onChangeText={setPassword} secureTextEntry />
      <Input
        label={t('auth.signup.confirmPassword')}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      {error ? <Text style={[styles.error, { color: theme.colors.danger }]}>{error}</Text> : null}

      <Button title={t('auth.signup.submit')} onPress={handleSubmit} loading={loading} fullWidth />

      <View style={styles.footer}>
        <Text style={{ color: theme.colors.textMuted }}>{t('auth.signup.haveAccount')} </Text>
        <Text style={[styles.link, { color: theme.colors.primary }]} onPress={() => navigation.navigate('Login')}>
          {t('auth.signup.loginLink')}
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: spacing.xxl, marginBottom: spacing.xl },
  title: { ...typography.h1 },
  subtitle: { ...typography.body, marginTop: spacing.xs },
  error: { ...typography.small, marginBottom: spacing.md },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl },
  link: { ...typography.bodyBold },
});
