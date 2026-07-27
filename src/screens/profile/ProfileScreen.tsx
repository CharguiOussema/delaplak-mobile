import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import { useApp, useAuth, useTheme } from '../../hooks';
import { Badge, Button, Card, Input, Screen } from '../../components/ui';
import { authService } from '../../services/AuthService';
import { getErrorMessage } from '../../utils/errorHandling';
import { spacing, typography, radius } from '../../theme/theme';
import type { Language } from '../../contexts/AppContext';
import type { MainTabScreenProps } from '../../navigation/types';

const LANGUAGES: Language[] = ['en', 'fr', 'ar'];

export default function ProfileScreen({ navigation }: MainTabScreenProps<'ProfileTab'>) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { language, setLanguage } = useApp();
  const { user, logout } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const updatePasswordMutation = useMutation(
    () => authService.updatePassword(currentPassword, newPassword),
    {
      onSuccess: () => {
        setPasswordSuccess(true);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        // Backend revoked this session's refresh token too; force the app back to Login.
        setTimeout(() => logout(), 1200);
      },
    },
  );

  const handleUpdatePassword = () => {
    setPasswordError(null);
    setPasswordSuccess(false);
    if (newPassword !== confirmNewPassword) {
      setPasswordError(t('auth.signup.passwordMismatch'));
      return;
    }
    updatePasswordMutation.mutate();
  };

  const handleLogout = () => {
    Alert.alert(t('profile.logout'), t('profile.logoutConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('profile.logout'), style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <Screen scroll>
      <Text style={[styles.title, { color: theme.colors.text }]}>{t('profile.title')}</Text>

      <Card style={styles.card}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('profile.account')}</Text>
        <Text style={[styles.email, { color: theme.colors.text }]}>{user?.email}</Text>
        {user?.role ? <Badge label={user.role} tone="primary" /> : null}
      </Card>

      <Pressable onPress={() => navigation.navigate('InvoicesList')}>
        <Card style={[styles.card, styles.linkCard]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('invoices.title')}</Text>
          <Text style={{ color: theme.colors.textMuted }}>{'›'}</Text>
        </Card>
      </Pressable>

      <Card style={styles.card}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('profile.language')}</Text>
        <View style={styles.optionsRow}>
          {LANGUAGES.map((lang) => (
            <Pressable
              key={lang}
              onPress={() => setLanguage(lang)}
              style={[
                styles.option,
                {
                  backgroundColor: language === lang ? theme.colors.primary : theme.colors.surfaceAlt,
                  borderColor: language === lang ? theme.colors.primary : theme.colors.border,
                },
              ]}
            >
              <Text style={{ color: language === lang ? theme.colors.primaryText : theme.colors.text }}>{t(`language.${lang}`)}</Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('profile.updatePassword')}</Text>
        <Input label={t('profile.currentPassword')} value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry />
        <Input label={t('profile.newPassword')} value={newPassword} onChangeText={setNewPassword} secureTextEntry />
        <Input
          label={t('profile.confirmNewPassword')}
          value={confirmNewPassword}
          onChangeText={setConfirmNewPassword}
          secureTextEntry
        />
        {passwordError ? <Text style={[styles.error, { color: theme.colors.danger }]}>{passwordError}</Text> : null}
        {updatePasswordMutation.isError ? (
          <Text style={[styles.error, { color: theme.colors.danger }]}>{getErrorMessage(updatePasswordMutation.error)}</Text>
        ) : null}
        {passwordSuccess ? <Text style={[styles.success, { color: theme.colors.success }]}>{t('profile.passwordUpdated')}</Text> : null}
        <Button
          title={t('profile.save')}
          onPress={handleUpdatePassword}
          loading={updatePasswordMutation.isLoading}
          fullWidth
        />
      </Card>

      <Button title={t('profile.logout')} variant="danger" onPress={handleLogout} fullWidth style={styles.logoutButton} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h1, marginBottom: spacing.lg },
  card: { marginBottom: spacing.lg, gap: spacing.sm },
  linkCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { ...typography.h3, marginBottom: spacing.xs },
  email: { ...typography.bodyBold, marginBottom: 4 },
  optionsRow: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  option: { paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.full, borderWidth: 1 },
  error: { ...typography.small, marginTop: -spacing.xs },
  success: { ...typography.small, marginTop: -spacing.xs },
  logoutButton: { marginTop: spacing.md, marginBottom: spacing.xxl },
});
