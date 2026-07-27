import React from 'react';
import { Alert, FlatList, Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useApp, useTheme } from '../../hooks';
import { Button, EmptyState, ErrorState, LoadingState } from '../../components/ui';
import { cartService } from '../../services/CartService';
import { productService } from '../../services/ProductService';
import { queryKeys } from '../../services/QueryClientManager';
import { pickI18nText, formatCurrency } from '../../utils/format';
import { getErrorMessage } from '../../utils/errorHandling';
import { spacing, radius, typography } from '../../theme/theme';
import type { CartItem, Product } from '../../models';
import type { MainTabScreenProps } from '../../navigation/types';

export default function CartScreen({ navigation }: MainTabScreenProps<'CartTab'>) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { language } = useApp();
  const queryClient = useQueryClient();

  const cartQuery = useQuery([queryKeys.CART], () => cartService.getCart());

  const invalidate = () => queryClient.invalidateQueries(queryKeys.CART);

  const setQuantityMutation = useMutation(
    ({ productId, quantity }: { productId: string; quantity: number }) => cartService.setItemQuantity(productId, quantity),
    { onSuccess: invalidate },
  );
  const removeMutation = useMutation((productId: string) => cartService.removeItem(productId), { onSuccess: invalidate });
  const clearMutation = useMutation(() => cartService.clear(), { onSuccess: invalidate });

  const handleClear = () => {
    Alert.alert(t('cart.clear'), t('cart.clearConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.confirm'), style: 'destructive', onPress: () => clearMutation.mutate() },
    ]);
  };

  if (cartQuery.isLoading) return <LoadingState />;
  if (cartQuery.isError) {
    return <ErrorState message={getErrorMessage(cartQuery.error)} onRetry={() => cartQuery.refetch()} />;
  }

  const items = cartQuery.data?.items ?? [];
  const populatedItems = items.filter((item): item is CartItem & { product: Product } => typeof item.product === 'object');
  const total = populatedItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const currency = populatedItems[0]?.product.currency ?? 'MAD';

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>{t('cart.title')}</Text>
        {items.length > 0 ? <Text style={[styles.clearLink, { color: theme.colors.danger }]} onPress={handleClear}>{t('cart.clear')}</Text> : null}
      </View>

      {items.length === 0 ? (
        <EmptyState
          title={t('cart.empty')}
          message={t('cart.emptyMessage')}
          actionLabel={t('cart.browseCta')}
          onAction={() => navigation.navigate('CatalogTab')}
        />
      ) : (
        <>
          <FlatList
            data={populatedItems}
            keyExtractor={(item) => item.product._id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              const imageUri = item.product.images[0] ? productService.resolveImageUrl(item.product.images[0]) : undefined;
              return (
                <View style={[styles.row, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                  <View style={[styles.thumb, { backgroundColor: theme.colors.surfaceAlt }]}>
                    {imageUri ? <Image source={{ uri: imageUri }} style={styles.thumbImage} /> : <Text>🧱</Text>}
                  </View>
                  <View style={styles.rowBody}>
                    <Text numberOfLines={1} style={[styles.itemName, { color: theme.colors.text }]}>
                      {pickI18nText(item.product.name, language)}
                    </Text>
                    <Text style={[styles.itemPrice, { color: theme.colors.primary }]}>
                      {formatCurrency(item.product.price, item.product.currency)}
                    </Text>
                    <View style={styles.quantityRow}>
                      <Button
                        title="-"
                        variant="outline"
                        size="sm"
                        onPress={() =>
                          setQuantityMutation.mutate({ productId: item.product._id, quantity: Math.max(1, item.quantity - 1) })
                        }
                      />
                      <Text style={[styles.quantityValue, { color: theme.colors.text }]}>{item.quantity}</Text>
                      <Button
                        title="+"
                        variant="outline"
                        size="sm"
                        onPress={() => setQuantityMutation.mutate({ productId: item.product._id, quantity: item.quantity + 1 })}
                      />
                      <Text
                        style={[styles.remove, { color: theme.colors.danger }]}
                        onPress={() => removeMutation.mutate(item.product._id)}
                      >
                        {t('cart.remove')}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            }}
          />
          <View style={[styles.footer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: theme.colors.text }]}>{t('cart.total')}</Text>
              <Text style={[styles.totalValue, { color: theme.colors.text }]}>{formatCurrency(total, currency)}</Text>
            </View>
            <Button title={t('cart.checkout')} onPress={() => navigation.navigate('Checkout')} fullWidth />
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: { ...typography.h1 },
  clearLink: { ...typography.small },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md, gap: spacing.md },
  row: {
    flexDirection: 'row',
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.sm,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  thumb: { width: 64, height: 64, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  thumbImage: { width: '100%', height: '100%' },
  rowBody: { flex: 1, justifyContent: 'center', gap: 4 },
  itemName: { ...typography.bodyBold },
  itemPrice: { ...typography.small },
  quantityRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 4 },
  quantityValue: { ...typography.bodyBold, minWidth: 20, textAlign: 'center' },
  remove: { ...typography.small, marginLeft: 'auto' },
  footer: { padding: spacing.lg, borderTopWidth: StyleSheet.hairlineWidth, gap: spacing.md },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between' },
  totalLabel: { ...typography.h3 },
  totalValue: { ...typography.h3 },
});
