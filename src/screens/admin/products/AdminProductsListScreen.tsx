import React from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import { useApp, useAccess, useTheme } from '../../../hooks';
import { Button, EmptyState, ErrorState, LoadingState, Screen } from '../../../components/ui';
import { productService } from '../../../services/ProductService';
import { queryKeys } from '../../../services/QueryClientManager';
import { pickI18nText, formatCurrency } from '../../../utils/format';
import { getErrorMessage } from '../../../utils/errorHandling';
import { spacing, radius, typography } from '../../../theme/theme';
import type { Product } from '../../../models';
import type { RootStackScreenProps } from '../../../navigation/types';

export default function AdminProductsListScreen({ navigation }: RootStackScreenProps<'AdminProductsList'>) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { language } = useApp();
  const { canWriteProducts } = useAccess();

  const productsQuery = useQuery([queryKeys.PRODUCTS, 'admin'], () => productService.getAll({ limit: 50 }));

  if (productsQuery.isLoading) return <LoadingState />;
  if (productsQuery.isError) return <ErrorState message={getErrorMessage(productsQuery.error)} onRetry={() => productsQuery.refetch()} />;

  const products = productsQuery.data?.docs ?? [];

  const renderItem = ({ item }: { item: Product }) => {
    const imageUri = item.images[0] ? productService.resolveImageUrl(item.images[0]) : undefined;
    return (
      <Pressable
        style={[styles.row, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
        onPress={() => canWriteProducts && navigation.navigate('AdminProductForm', { productId: item._id })}
      >
        <View style={[styles.thumb, { backgroundColor: theme.colors.surfaceAlt }]}>
          {imageUri ? <Image source={{ uri: imageUri }} style={styles.thumbImage} /> : <Text>🧱</Text>}
        </View>
        <View style={styles.rowBody}>
          <Text style={[styles.name, { color: theme.colors.text }]} numberOfLines={1}>
            {pickI18nText(item.name, language)}
          </Text>
          <Text style={[styles.meta, { color: theme.colors.textMuted }]}>
            {formatCurrency(item.price, item.currency)} · {t('admin.products.stock')}: {item.stock}
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <Screen padded={false}>
      {canWriteProducts ? (
        <View style={styles.header}>
          <Button title={t('admin.products.add')} onPress={() => navigation.navigate('AdminProductForm', undefined)} />
        </View>
      ) : null}
      <FlatList
        data={products}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshing={productsQuery.isFetching}
        onRefresh={() => productsQuery.refetch()}
        ListEmptyComponent={<EmptyState title={t('admin.products.empty')} />}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { padding: spacing.lg, paddingBottom: spacing.sm },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, flexGrow: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.sm,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  thumb: { width: 56, height: 56, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  thumbImage: { width: '100%', height: '100%' },
  rowBody: { flex: 1, gap: 2 },
  name: { ...typography.bodyBold },
  meta: { ...typography.small },
});
