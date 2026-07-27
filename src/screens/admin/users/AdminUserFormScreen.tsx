import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useTheme } from '../../../hooks';
import { Button, ErrorState, Input, LoadingState, Screen } from '../../../components/ui';
import { userService } from '../../../services/UserService';
import { queryKeys } from '../../../services/QueryClientManager';
import { getErrorMessage } from '../../../utils/errorHandling';
import { USER_ROLES } from '../../../models';
import { spacing, radius, typography } from '../../../theme/theme';
import type { RootStackScreenProps } from '../../../navigation/types';

export default function AdminUserFormScreen({ route, navigation }: RootStackScreenProps<'AdminUserForm'>) {
  const userId = route.params?.userId;
  const isEdit = !!userId;
  const { t } = useTranslation();
  const theme = useTheme();
  const queryClient = useQueryClient();

  const userQuery = useQuery([queryKeys.USER, userId], () => userService.getById(userId as string), { enabled: isEdit });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<USER_ROLES>(USER_ROLES.CLIENT);
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userQuery.data) {
      setEmail(userQuery.data.email);
      setRole(userQuery.data.role);
      setIsActive(userQuery.data.isActive);
    }
  }, [userQuery.data]);

  // No higher tier than ADMIN exists anymore, so any ADMIN viewer may assign either role.
  const availableRoles = [USER_ROLES.CLIENT, USER_ROLES.ADMIN];

  const saveMutation = useMutation(
    async () => {
      if (isEdit) {
        return userService.update(userId as string, { email, role, isActive });
      }
      return userService.create({ email, password, role });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(queryKeys.USERS);
        navigation.goBack();
      },
    },
  );

  const deactivateMutation = useMutation(() => userService.deactivate(userId as string), {
    onSuccess: () => {
      queryClient.invalidateQueries(queryKeys.USERS);
      navigation.goBack();
    },
  });

  const handleSave = () => {
    setError(null);
    if (!email.trim()) {
      setError(t('common.required'));
      return;
    }
    saveMutation.mutate();
  };

  const handleDeactivate = () => {
    Alert.alert(t('admin.users.deactivate'), t('admin.users.deactivateConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('admin.users.deactivate'), style: 'destructive', onPress: () => deactivateMutation.mutate() },
    ]);
  };

  if (isEdit && userQuery.isLoading) return <LoadingState />;
  if (isEdit && userQuery.isError) return <ErrorState message={getErrorMessage(userQuery.error)} onRetry={() => userQuery.refetch()} />;

  return (
    <Screen scroll>
      <Text style={[styles.title, { color: theme.colors.text }]}>{isEdit ? t('admin.users.edit') : t('admin.users.add')}</Text>

      <Input label={t('admin.users.email')} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      {!isEdit ? <Input label={t('admin.users.password')} value={password} onChangeText={setPassword} secureTextEntry /> : null}

      <Text style={[styles.label, { color: theme.colors.text }]}>{t('admin.users.role')}</Text>
      <View style={styles.optionsRow}>
        {availableRoles.map((r) => (
          <Pressable
            key={r}
            onPress={() => setRole(r)}
            style={[
              styles.option,
              { backgroundColor: role === r ? theme.colors.primary : theme.colors.surfaceAlt, borderColor: theme.colors.border },
            ]}
          >
            <Text style={{ color: role === r ? theme.colors.primaryText : theme.colors.text }}>{r}</Text>
          </Pressable>
        ))}
      </View>

      {isEdit ? (
        <View style={styles.activeRow}>
          <Text style={[styles.label, { color: theme.colors.text }]}>{t('admin.users.isActive')}</Text>
          <Pressable onPress={() => setIsActive((v) => !v)}>
            <Text style={{ color: isActive ? theme.colors.success : theme.colors.danger, fontWeight: '600' }}>
              {isActive ? t('common.yes') : t('common.no')}
            </Text>
          </Pressable>
        </View>
      ) : null}

      {error ? <Text style={[styles.error, { color: theme.colors.danger }]}>{error}</Text> : null}
      {saveMutation.isError ? <Text style={[styles.error, { color: theme.colors.danger }]}>{getErrorMessage(saveMutation.error)}</Text> : null}

      <Button title={t('common.save')} onPress={handleSave} loading={saveMutation.isLoading} fullWidth style={styles.saveButton} />

      {isEdit ? (
        <Button
          title={t('admin.users.deactivate')}
          variant="danger"
          onPress={handleDeactivate}
          loading={deactivateMutation.isLoading}
          fullWidth
          style={styles.deactivateButton}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h1, marginBottom: spacing.lg },
  label: { ...typography.small, fontWeight: '600', marginBottom: spacing.xs },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  option: { paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.full, borderWidth: 1 },
  activeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  error: { ...typography.small, marginBottom: spacing.sm },
  saveButton: { marginTop: spacing.md },
  deactivateButton: { marginTop: spacing.md },
});
