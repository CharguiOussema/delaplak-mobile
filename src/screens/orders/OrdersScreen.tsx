import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import { useTheme } from '../../hooks';
import { Badge, EmptyState, ErrorState, LoadingState } from '../../components/ui';
import { orderService } from '../../services/OrderService';
import { queryKeys } from '../../services/QueryClientManager';
import { formatCurrency, formatDate } from '../../utils/format';
import { getErrorMessage } from '../../utils/errorHandling';
import { ORDER_STATUS } from '../../models';
import { spacing, radius, typography } from '../../theme/theme';
import type { Order } from '../../models';
import type { MainTabScreenProps } from '../../navigation/types';

const statusTone: Record<ORDER_STATUS, 'warning' | 'success' | 'danger'> = {
  [ORDER_STATUS.PENDING]: 'warning',
  [ORDER_STATUS.CONFIRMED]: 'success',
  [ORDER_STATUS.CANCELLED]: 'danger',
};

export default function OrdersScreen({ navigation }: MainTabScreenProps<'OrdersTab'>) {
  const { t } = useTranslation();
  const theme = useTheme();

  const ordersQuery = useQuery([queryKeys.ORDERS], () => orderService.getAll({ limit: 30 }));

  if (ordersQuery.isLoading) return <LoadingState />;
  if (ordersQuery.isError) return <ErrorState message={getErrorMessage(ordersQuery.error)} onRetry={() => ordersQuery.refetch()} />;

  const orders = ordersQuery.data?.docs ?? [];

  const renderItem = ({ item }: { item: Order }) => (
    <Pressable
      style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
      onPress={() => navigation.navigate('OrderDetail', { orderId: item._id })}
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.orderNumber, { color: theme.colors.text }]}>
          {t('orders.orderNumber')} #{item._id.slice(-6).toUpperCase()}
        </Text>
        <Badge label={t(`orders.status.${item.status}`)} tone={statusTone[item.status]} />
      </View>
      <Text style={[styles.date, { color: theme.colors.textMuted }]}>{formatDate(item.createdAt)}</Text>
      <View style={styles.cardFooter}>
        <Text style={[styles.items, { color: theme.colors.textMuted }]}>
          {item.items.length} {t('orders.items').toLowerCase()}
        </Text>
        <Text style={[styles.total, { color: theme.colors.text }]}>{formatCurrency(item.totalAmount, item.currency)}</Text>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <Text style={[styles.title, { color: theme.colors.text }]}>{t('orders.title')}</Text>
      <FlatList
        data={orders}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshing={ordersQuery.isFetching}
        onRefresh={() => ordersQuery.refetch()}
        ListEmptyComponent={<EmptyState title={t('orders.empty')} message={t('orders.emptyMessage')} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  title: { ...typography.h1, paddingHorizontal: spacing.lg, paddingTop: spacing.md, marginBottom: spacing.md },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, flexGrow: 1 },
  card: { borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, padding: spacing.md, marginBottom: spacing.md },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderNumber: { ...typography.bodyBold },
  date: { ...typography.small, marginTop: 4 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
  items: { ...typography.small },
  total: { ...typography.bodyBold },
});
