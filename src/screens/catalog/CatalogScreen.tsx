import React, { useMemo, useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import { useApp, useTheme } from '../../hooks';
import { Badge, EmptyState, ErrorState, Input, LoadingState } from '../../components/ui';
import { categoryService } from '../../services/CategoryService';
import { productService } from '../../services/ProductService';
import { queryKeys } from '../../services/QueryClientManager';
import { pickI18nText, formatCurrency } from '../../utils/format';
import { getErrorMessage } from '../../utils/errorHandling';
import { spacing, radius, typography } from '../../theme/theme';
import type { Product } from '../../models';
import type { MainTabScreenProps } from '../../navigation/types';

export default function CatalogScreen({ navigation }: MainTabScreenProps<'CatalogTab'>) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { language } = useApp();
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);

  const categoriesQuery = useQuery([queryKeys.CATEGORY_FILTER], () => categoryService.getFilter());

  const productsQuery = useQuery(
    [queryKeys.PRODUCTS, { search, categoryId }],
    () => productService.getAll({ search: search || undefined, category: categoryId || undefined, limit: 30 }),
  );

  const categoryOptions = useMemo(() => categoriesQuery.data ?? [], [categoriesQuery.data]);

  const renderProduct = ({ item }: { item: Product }) => {
    const imageUri = item.images[0] ? productService.resolveImageUrl(item.images[0]) : undefined;
    const outOfStock = item.stock <= 0;
    return (
      <Pressable
        style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
        onPress={() => navigation.navigate('ProductDetail', { productId: item._id })}
      >
        <View style={[styles.imageWrap, { backgroundColor: theme.colors.surfaceAlt }]}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
          ) : (
            <Text style={styles.imagePlaceholder}>🧱</Text>
          )}
        </View>
        <View style={styles.cardBody}>
          <Text numberOfLines={1} style={[styles.productName, { color: theme.colors.text }]}>
            {pickI18nText(item.name, language)}
          </Text>
          <Text style={[styles.price, { color: theme.colors.primary }]}>{formatCurrency(item.price, item.currency)}</Text>
          <Badge
            label={outOfStock ? t('catalog.outOfStock') : t('catalog.inStock')}
            tone={outOfStock ? 'danger' : 'success'}
          />
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>{t('catalog.title')}</Text>
        <Input placeholder={t('catalog.searchPlaceholder')} value={search} onChangeText={setSearch} style={styles.searchInput} />
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[{ label: t('catalog.allCategories'), value: '' }, ...categoryOptions]}
          keyExtractor={(item) => item.value}
          contentContainerStyle={styles.chipsRow}
          renderItem={({ item }) => {
            const active = (item.value || null) === categoryId;
            return (
              <Pressable
                onPress={() => setCategoryId(item.value || null)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active ? theme.colors.primary : theme.colors.surfaceAlt,
                    borderColor: active ? theme.colors.primary : theme.colors.border,
                  },
                ]}
              >
                <Text style={{ color: active ? theme.colors.primaryText : theme.colors.text, fontSize: 13 }}>{item.label}</Text>
              </Pressable>
            );
          }}
        />
      </View>

      {productsQuery.isLoading ? (
        <LoadingState />
      ) : productsQuery.isError ? (
        <ErrorState message={getErrorMessage(productsQuery.error)} onRetry={() => productsQuery.refetch()} />
      ) : (
        <FlatList
          data={productsQuery.data?.docs ?? []}
          keyExtractor={(item) => item._id}
          renderItem={renderProduct}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          refreshing={productsQuery.isFetching}
          onRefresh={() => productsQuery.refetch()}
          ListEmptyComponent={<EmptyState title={t('catalog.noProducts')} message={t('catalog.noProductsMessage')} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  title: { ...typography.h1, marginBottom: spacing.md },
  searchInput: { marginBottom: spacing.sm },
  chipsRow: { gap: spacing.sm, paddingBottom: spacing.md },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.full,
    borderWidth: 1,
    marginRight: spacing.sm,
  },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, flexGrow: 1 },
  row: { gap: spacing.md },
  card: {
    flex: 1,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  imageWrap: { height: 130, alignItems: 'center', justifyContent: 'center' },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: { fontSize: 36 },
  cardBody: { padding: spacing.sm, gap: 4 },
  productName: { ...typography.bodyBold },
  price: { ...typography.bodyBold },
});
