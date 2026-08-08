import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { useAuth, useTheme } from '../../hooks';
import { Button, Input, Screen } from '../../components/ui';
import { getErrorMessage } from '../../utils/errorHandling';
import { spacing, typography } from '../../theme/theme';
import type { RootStackScreenProps } from '../../navigation/types';

export default function LoginScreen({ navigation, route }: RootStackScreenProps<'Login'>) {
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
      const { redirectTo, redirectParams } = route.params ?? {};
      if (redirectTo) {
        // Dynamic redirect target: the destination route name/params come from wherever
        // pushed this Login screen, so they can't be statically typed here.
        (navigation as { replace: (name: string, params?: object) => void }).replace(redirectTo, redirectParams);
      } else if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.replace('MainTabs');
      }
    } catch (err) {
      setError(getErrorMessage(err, t('auth.login.error')));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll>
      <Image source={require('../../../assets/logo-full.png')} style={styles.logo} contentFit="contain" />
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
        <Text style={[styles.link, { color: theme.colors.primary }]} onPress={() => navigation.replace('Signup', route.params)}>
          {t('auth.login.signupLink')}
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  logo: { width: '100%', height: 56, marginTop: spacing.xl },
  header: { marginTop: spacing.xl, marginBottom: spacing.xl },
  title: { ...typography.h1 },
  subtitle: { ...typography.body, marginTop: spacing.xs },
  error: { ...typography.small, marginBottom: spacing.md },
  link: { ...typography.bodyBold, marginTop: spacing.lg, textAlign: 'center' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl },
});
