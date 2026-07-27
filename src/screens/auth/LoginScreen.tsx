import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth, useTheme } from '../../hooks';
import { Button, Input, Screen } from '../../components/ui';
import { getErrorMessage } from '../../utils/errorHandling';
import { spacing, typography } from '../../theme/theme';
import type { AuthStackScreenProps } from '../../navigation/types';

export default function LoginScreen({ navigation }: AuthStackScreenProps<'Login'>) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(getErrorMessage(err, t('auth.login.error')));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>{t('auth.login.title')}</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>{t('auth.login.subtitle')}</Text>
      </View>

      <Input
        label={t('auth.login.email')}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        testID="login-email"
      />
      <Input
        label={t('auth.login.password')}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        testID="login-password"
      />

      {error ? <Text style={[styles.error, { color: theme.colors.danger }]}>{error}</Text> : null}

      <Button title={t('auth.login.submit')} onPress={handleSubmit} loading={loading} fullWidth testID="login-submit" />

      <Text
        style={[styles.link, { color: theme.colors.primary }]}
        onPress={() => navigation.navigate('ForgotPassword')}
      >
        {t('auth.login.forgotPassword')}
      </Text>

      <View style={styles.footer}>
        <Text style={{ color: theme.colors.textMuted }}>{t('auth.login.noAccount')} </Text>
        <Text style={[styles.link, { color: theme.colors.primary }]} onPress={() => navigation.navigate('Signup')}>
          {t('auth.login.signupLink')}
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
  link: { ...typography.bodyBold, marginTop: spacing.lg, textAlign: 'center' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl },
});
