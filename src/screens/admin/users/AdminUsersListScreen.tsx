import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import { useTheme } from '../../../hooks';
import { Badge, Button, EmptyState, ErrorState, LoadingState, Screen } from '../../../components/ui';
import { userService } from '../../../services/UserService';
import { queryKeys } from '../../../services/QueryClientManager';
import { getErrorMessage } from '../../../utils/errorHandling';
import { spacing, radius, typography } from '../../../theme/theme';
import type { User } from '../../../models';
import type { RootStackScreenProps } from '../../../navigation/types';

export default function AdminUsersListScreen({ navigation }: RootStackScreenProps<'AdminUsersList'>) {
  const { t } = useTranslation();
  const theme = useTheme();

  const usersQuery = useQuery([queryKeys.USERS], () => userService.getAll({ limit: 50 }));

  if (usersQuery.isLoading) return <LoadingState />;
  if (usersQuery.isError) return <ErrorState message={getErrorMessage(usersQuery.error)} onRetry={() => usersQuery.refetch()} />;

  const users = usersQuery.data?.docs ?? [];

  const renderItem = ({ item }: { item: User }) => (
    <Pressable
      style={[styles.row, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
      onPress={() => navigation.navigate('AdminUserForm', { userId: item._id })}
    >
      <View style={styles.rowBody}>
        <Text style={[styles.email, { color: theme.colors.text }]}>{item.fullName}</Text>
        <Text style={[styles.subtext, { color: theme.colors.textMuted }]}>{item.email}</Text>
        <Text style={[styles.subtext, { color: theme.colors.textMuted }]}>{item.phone}</Text>
        <View style={styles.badgeRow}>
          <Badge label={item.role} tone="primary" />
          <Badge label={item.isActive ? t('common.active') : t('common.inactive')} tone={item.isActive ? 'success' : 'danger'} />
        </View>
      </View>
    </Pressable>
  );

  return (
    <Screen padded={false}>
      <View style={styles.header}>
        <Button title={t('admin.users.add')} onPress={() => navigation.navigate('AdminUserForm', undefined)} />
      </View>
      <FlatList
        data={users}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshing={usersQuery.isFetching}
        onRefresh={() => usersQuery.refetch()}
        ListEmptyComponent={<EmptyState title={t('admin.users.empty')} />}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { padding: spacing.lg, paddingBottom: spacing.sm },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, flexGrow: 1 },
  row: { borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, padding: spacing.md, marginBottom: spacing.md },
  rowBody: { gap: spacing.xs },
  email: { ...typography.bodyBold },
  subtext: { ...typography.small },
  badgeRow: { flexDirection: 'row', gap: spacing.xs },
});
