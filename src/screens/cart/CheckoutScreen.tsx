import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useApp, useTheme } from '../../hooks';
import { Button, ErrorState, LoadingState, Screen } from '../../components/ui';
import { cartService } from '../../services/CartService';
import { orderService } from '../../services/OrderService';
import { queryKeys } from '../../services/QueryClientManager';
import { pickI18nText, formatCurrency, describeSelectedOptions } from '../../utils/format';
import { getErrorMessage } from '../../utils/errorHandling';
import { spacing, typography } from '../../theme/theme';
import type { CartItem, Product } from '../../models';
import type { RootStackScreenProps } from '../../navigation/types';

export default function CheckoutScreen({ navigation }: RootStackScreenProps<'Checkout'>) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { language } = useApp();
  const queryClient = useQueryClient();
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);

  const cartQuery = useQuery([queryKeys.CART], () => cartService.getCart());

  const placeOrderMutation = useMutation(() => orderService.create(), {
    onSuccess: (order) => {
      setPlacedOrderId(order._id);
      queryClient.invalidateQueries(queryKeys.CART);
      queryClient.invalidateQueries(queryKeys.ORDERS);
    },
  });

  if (cartQuery.isLoading) return <LoadingState />;
  if (cartQuery.isError) return <ErrorState message={getErrorMessage(cartQuery.error)} onRetry={() => cartQuery.refetch()} />;

  if (placedOrderId) {
    return (
      <Screen>
        <View style={styles.successContainer}>
          <Text style={styles.successIcon}>✅</Text>
          <Text style={[styles.successTitle, { color: theme.colors.text }]}>{t('checkout.success')}</Text>
          <Text style={[styles.successMessage, { color: theme.colors.textMuted }]}>{t('checkout.successMessage')}</Text>
          <Button
            title={t('checkout.viewOrder')}
            onPress={() => navigation.replace('OrderDetail', { orderId: placedOrderId })}
            fullWidth
            style={styles.successButton}
          />
        </View>
      </Screen>
    );
  }

  const items = cartQuery.data?.items ?? [];
  const populatedItems = items.filter((item): item is CartItem & { product: Product } => typeof item.product === 'object');
  const total = populatedItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const currency = populatedItems[0]?.product.currency ?? 'MAD';

  return (
    <Screen scroll>
      <Text style={[styles.title, { color: theme.colors.text }]}>{t('checkout.title')}</Text>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('checkout.orderSummary')}</Text>

      <FlatList
        data={populatedItems}
        keyExtractor={(item) => item._id}
        scrollEnabled={false}
        renderItem={({ item }) => {
          const optionLabels = describeSelectedOptions(item, language);
          return (
            <View style={styles.summaryRow}>
              <View style={styles.summaryRowBody}>
                <Text style={[styles.itemName, { color: theme.colors.text }]} numberOfLines={1}>
                  {item.quantity} × {pickI18nText(item.product.name, language)}
                </Text>
                {optionLabels.length > 0 ? (
                  <Text style={[styles.itemOptions, { color: theme.colors.textMuted }]} numberOfLines={1}>
                    {optionLabels.join(', ')}
                  </Text>
                ) : null}
              </View>
              <Text style={[styles.itemTotal, { color: theme.colors.text }]}>
                {formatCurrency(item.unitPrice * item.quantity, item.product.currency)}
              </Text>
            </View>
          );
        }}
      />

      <View style={styles.totalRow}>
        <Text style={[styles.totalLabel, { color: theme.colors.text }]}>{t('cart.total')}</Text>
        <Text style={[styles.totalValue, { color: theme.colors.text }]}>{formatCurrency(total, currency)}</Text>
      </View>

      {placeOrderMutation.isError ? (
        <Text style={[styles.error, { color: theme.colors.danger }]}>{getErrorMessage(placeOrderMutation.error)}</Text>
      ) : null}

      <Button
        title={placeOrderMutation.isLoading ? t('checkout.placingOrder') : t('checkout.placeOrder')}
        onPress={() => placeOrderMutation.mutate()}
        loading={placeOrderMutation.isLoading}
        disabled={populatedItems.length === 0}
        fullWidth
        style={styles.placeOrderButton}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h1, marginBottom: spacing.lg },
  sectionTitle: { ...typography.h3, marginBottom: spacing.sm },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs },
  summaryRowBody: { flex: 1, marginRight: spacing.sm },
  itemName: { ...typography.body },
  itemOptions: { ...typography.tiny, marginTop: 2 },
  itemTotal: { ...typography.bodyBold },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E2E8F0',
  },
  totalLabel: { ...typography.h3 },
  totalValue: { ...typography.h3 },
  error: { ...typography.small, marginTop: spacing.md, textAlign: 'center' },
  placeOrderButton: { marginTop: spacing.xl },
  successContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  successIcon: { fontSize: 56 },
  successTitle: { ...typography.h2 },
  successMessage: { ...typography.body, textAlign: 'center' },
  successButton: { marginTop: spacing.lg, width: '100%' },
});
