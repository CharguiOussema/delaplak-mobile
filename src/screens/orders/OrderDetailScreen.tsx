import React from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useApp, useAccess, useTheme } from '../../hooks';
import { Badge, Button, ErrorState, LoadingState, Screen } from '../../components/ui';
import { orderService } from '../../services/OrderService';
import { invoiceService } from '../../services/InvoiceService';
import { queryKeys } from '../../services/QueryClientManager';
import { pickI18nText, formatCurrency, formatDateTime } from '../../utils/format';
import { getErrorMessage } from '../../utils/errorHandling';
import { ORDER_STATUS, type User } from '../../models';
import { spacing, typography } from '../../theme/theme';
import type { RootStackScreenProps } from '../../navigation/types';

const statusTone: Record<ORDER_STATUS, 'warning' | 'success' | 'danger'> = {
  [ORDER_STATUS.PENDING]: 'warning',
  [ORDER_STATUS.CONFIRMED]: 'success',
  [ORDER_STATUS.CANCELLED]: 'danger',
};

export default function OrderDetailScreen({ route, navigation }: RootStackScreenProps<'OrderDetail'>) {
  const { orderId } = route.params;
  const { t } = useTranslation();
  const theme = useTheme();
  const { language } = useApp();
  const { canConfirmOrders } = useAccess();
  const queryClient = useQueryClient();

  const orderQuery = useQuery([queryKeys.ORDER, orderId], () => orderService.getById(orderId));

  const invoiceQuery = useQuery(
    [queryKeys.INVOICE, 'byOrder', orderId],
    () => invoiceService.findByOrderId(orderId),
    { enabled: orderQuery.data?.status === ORDER_STATUS.CONFIRMED },
  );

  const confirmMutation = useMutation(() => orderService.confirm(orderId), {
    onSuccess: ({ invoice }) => {
      queryClient.invalidateQueries(queryKeys.ORDER);
      queryClient.invalidateQueries(queryKeys.ORDERS);
      queryClient.invalidateQueries([queryKeys.INVOICE, 'byOrder', orderId]);
      navigation.navigate('InvoiceDetail', { invoiceId: invoice._id });
    },
  });

  const handleConfirm = () => {
    Alert.alert(t('orders.confirm'), t('orders.confirmConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.confirm'), onPress: () => confirmMutation.mutate() },
    ]);
  };

  if (orderQuery.isLoading) return <LoadingState />;
  if (orderQuery.isError || !orderQuery.data) {
    return <ErrorState message={getErrorMessage(orderQuery.error, t('orderDetail.notFound'))} onRetry={() => orderQuery.refetch()} />;
  }

  const order = orderQuery.data;
  const confirmedByUser = typeof order.confirmedBy === 'object' ? (order.confirmedBy as User) : null;

  return (
    <Screen scroll>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {t('orders.orderNumber')} #{order._id.slice(-6).toUpperCase()}
        </Text>
        <Badge label={t(`orders.status.${order.status}`)} tone={statusTone[order.status]} />
      </View>
      <Text style={[styles.date, { color: theme.colors.textMuted }]}>{formatDateTime(order.createdAt)}</Text>

      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('orderDetail.items')}</Text>
      <FlatList
        data={order.items}
        keyExtractor={(item, index) => `${item.product}-${index}`}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <Text style={[styles.itemName, { color: theme.colors.text }]} numberOfLines={1}>
              {item.quantity} × {pickI18nText(item.name, language)}
            </Text>
            <Text style={[styles.itemTotal, { color: theme.colors.text }]}>{formatCurrency(item.price * item.quantity)}</Text>
          </View>
        )}
      />

      <View style={styles.totalRow}>
        <Text style={[styles.totalLabel, { color: theme.colors.text }]}>{t('orderDetail.total')}</Text>
        <Text style={[styles.totalValue, { color: theme.colors.text }]}>{formatCurrency(order.totalAmount)}</Text>
      </View>

      {order.status === ORDER_STATUS.CONFIRMED ? (
        <View style={styles.confirmedInfo}>
          {confirmedByUser ? (
            <Text style={[styles.meta, { color: theme.colors.textMuted }]}>
              {t('orderDetail.confirmedBy')}: {confirmedByUser.email}
            </Text>
          ) : null}
          {order.confirmedAt ? (
            <Text style={[styles.meta, { color: theme.colors.textMuted }]}>
              {t('orderDetail.confirmedAt')}: {formatDateTime(order.confirmedAt)}
            </Text>
          ) : null}
        </View>
      ) : null}

      {canConfirmOrders && order.status === ORDER_STATUS.PENDING ? (
        <Button
          title={t('orderDetail.confirmAction')}
          onPress={handleConfirm}
          loading={confirmMutation.isLoading}
          fullWidth
          style={styles.actionButton}
        />
      ) : null}
      {confirmMutation.isError ? (
        <Text style={[styles.error, { color: theme.colors.danger }]}>{getErrorMessage(confirmMutation.error)}</Text>
      ) : null}

      {order.status === ORDER_STATUS.CONFIRMED ? (
        <View style={styles.invoiceSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('orderDetail.invoice')}</Text>
          {invoiceQuery.isLoading ? (
            <LoadingState />
          ) : invoiceQuery.data ? (
            <Button
              title={t('orders.viewInvoice')}
              variant="outline"
              onPress={() => navigation.navigate('InvoiceDetail', { invoiceId: invoiceQuery.data!._id })}
              fullWidth
            />
          ) : (
            <Text style={{ color: theme.colors.textMuted }}>{t('orderDetail.noInvoiceYet')}</Text>
          )}
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { ...typography.h2, flexShrink: 1, marginRight: spacing.sm },
  date: { ...typography.small, marginTop: 4, marginBottom: spacing.lg },
  sectionTitle: { ...typography.h3, marginBottom: spacing.sm, marginTop: spacing.md },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs },
  itemName: { ...typography.body, flex: 1, marginRight: spacing.sm },
  itemTotal: { ...typography.bodyBold },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E2E8F0',
  },
  totalLabel: { ...typography.h3 },
  totalValue: { ...typography.h3 },
  confirmedInfo: { marginTop: spacing.md, gap: 4 },
  meta: { ...typography.small },
  actionButton: { marginTop: spacing.lg },
  error: { ...typography.small, marginTop: spacing.sm, textAlign: 'center' },
  invoiceSection: { marginTop: spacing.lg },
});
