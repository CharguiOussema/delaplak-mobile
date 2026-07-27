import React, { useState } from 'react';
import { Dimensions, FlatList, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useApp, useAccess, useTheme } from '../../hooks';
import { Badge, Button, ErrorState, LoadingState, Screen } from '../../components/ui';
import { productService } from '../../services/ProductService';
import { cartService } from '../../services/CartService';
import { queryKeys } from '../../services/QueryClientManager';
import { pickI18nText, formatCurrency } from '../../utils/format';
import { getErrorMessage } from '../../utils/errorHandling';
import { spacing, radius, typography } from '../../theme/theme';
import type { RootStackScreenProps } from '../../navigation/types';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen({ route }: RootStackScreenProps<'ProductDetail'>) {
  const { productId } = route.params;
  const { t } = useTranslation();
  const theme = useTheme();
  const { language } = useApp();
  const { canUseCart } = useAccess();
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(1);
  const [addedFeedback, setAddedFeedback] = useState(false);

  const productQuery = useQuery([queryKeys.PRODUCT, productId], () => productService.getById(productId));

  const addToCartMutation = useMutation((qty: number) => cartService.addItem(productId, qty), {
    onSuccess: () => {
      queryClient.invalidateQueries(queryKeys.CART);
      setAddedFeedback(true);
      setTimeout(() => setAddedFeedback(false), 2000);
    },
  });

  if (productQuery.isLoading) return <LoadingState />;
  if (productQuery.isError || !productQuery.data) {
    return <ErrorState message={getErrorMessage(productQuery.error, t('product.detail.notFound'))} onRetry={() => productQuery.refetch()} />;
  }

  const product = productQuery.data;
  const images = product.images.length > 0 ? product.images : [];
  const outOfStock = product.stock <= 0;

  return (
    <Screen scroll padded={false}>
      {images.length > 0 ? (
        <FlatList
          data={images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <Image source={{ uri: productService.resolveImageUrl(item) }} style={styles.carouselImage} resizeMode="cover" />
          )}
        />
      ) : (
        <View style={[styles.carouselImage, styles.placeholderImage, { backgroundColor: theme.colors.surfaceAlt }]}>
          <Text style={{ fontSize: 48 }}>🧱</Text>
        </View>
      )}

      <View style={styles.content}>
        <Text style={[styles.name, { color: theme.colors.text }]}>{pickI18nText(product.name, language)}</Text>
        <Text style={[styles.price, { color: theme.colors.primary }]}>{formatCurrency(product.price, product.currency)}</Text>
        <Badge label={outOfStock ? t('catalog.outOfStock') : t('catalog.inStock')} tone={outOfStock ? 'danger' : 'success'} />

        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('product.detail.description')}</Text>
        <Text style={[styles.body, { color: theme.colors.textMuted }]}>{pickI18nText(product.description, language)}</Text>

        <View style={styles.specsGrid}>
          <Spec label={t('product.detail.dimensions')} value={product.dimensions} theme={theme} />
          <Spec label={t('product.detail.thickness')} value={product.thickness} theme={theme} />
          <Spec label={t('product.detail.texture')} value={product.texture} theme={theme} />
          <Spec label={t('product.detail.stock')} value={String(product.stock)} theme={theme} />
        </View>

        {product.applicationDomains.length > 0 ? (
          <>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('product.detail.applicationDomains')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.domainsRow}>
              {product.applicationDomains.map((domain) => (
                <View key={domain} style={[styles.domainChip, { backgroundColor: theme.colors.surfaceAlt }]}>
                  <Text style={{ color: theme.colors.text, fontSize: 13 }}>{domain}</Text>
                </View>
              ))}
            </ScrollView>
          </>
        ) : null}

        {canUseCart ? (
          <View style={styles.cartSection}>
            <View style={styles.quantityRow}>
              <Text style={[styles.body, { color: theme.colors.text }]}>{t('product.detail.quantity')}</Text>
              <View style={styles.quantityControls}>
                <Button title="-" variant="outline" size="sm" onPress={() => setQuantity((q) => Math.max(1, q - 1))} />
                <Text style={[styles.quantityValue, { color: theme.colors.text }]}>{quantity}</Text>
                <Button title="+" variant="outline" size="sm" onPress={() => setQuantity((q) => q + 1)} />
              </View>
            </View>
            <Button
              title={addedFeedback ? t('product.detail.addedToCart') : t('product.detail.addToCart')}
              onPress={() => addToCartMutation.mutate(quantity)}
              loading={addToCartMutation.isLoading}
              disabled={outOfStock}
              fullWidth
            />
            {addToCartMutation.isError ? (
              <Text style={[styles.error, { color: theme.colors.danger }]}>{getErrorMessage(addToCartMutation.error)}</Text>
            ) : null}
          </View>
        ) : null}
      </View>
    </Screen>
  );
}

function Spec({ label, value, theme }: { label: string; value: string; theme: ReturnType<typeof useTheme> }) {
  if (!value) return null;
  return (
    <View style={specStyles.item}>
      <Text style={[specStyles.label, { color: theme.colors.textMuted }]}>{label}</Text>
      <Text style={[specStyles.value, { color: theme.colors.text }]}>{value}</Text>
    </View>
  );
}

const specStyles = StyleSheet.create({
  item: { width: '50%', marginBottom: spacing.md },
  label: { ...typography.tiny, marginBottom: 2 },
  value: { ...typography.bodyBold },
});

const styles = StyleSheet.create({
  carouselImage: { width, height: 280 },
  placeholderImage: { alignItems: 'center', justifyContent: 'center' },
  content: { padding: spacing.lg },
  name: { ...typography.h1, marginBottom: spacing.xs },
  price: { ...typography.h2, marginBottom: spacing.sm },
  sectionTitle: { ...typography.h3, marginTop: spacing.lg, marginBottom: spacing.sm },
  body: { ...typography.body, lineHeight: 22 },
  specsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.md },
  domainsRow: { marginBottom: spacing.sm },
  domainChip: { paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.full, marginRight: spacing.sm },
  cartSection: { marginTop: spacing.xl, gap: spacing.md },
  quantityRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  quantityControls: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  quantityValue: { ...typography.bodyBold, minWidth: 24, textAlign: 'center' },
  error: { ...typography.small, textAlign: 'center' },
});
