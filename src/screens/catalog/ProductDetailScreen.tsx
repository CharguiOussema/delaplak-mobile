import React, { useEffect, useMemo, useState } from 'react';
import { Dimensions, FlatList, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
import type { Product, ProductAttribute } from '../../models';
import type { RootStackScreenProps } from '../../navigation/types';

const { width } = Dimensions.get('window');

interface AttributeGroup {
  attribute: ProductAttribute;
  options: { option: string; priceAdjustment: number }[];
}

// Product.attributeOptions is a flat list of (attribute, option, priceAdjustment) rows —
// group it back by attribute type so the client picks one option per setting, the way the
// admin configured it (Texture / Thickness / Dimensions, each with its own price deltas).
function groupByAttribute(product: Product): AttributeGroup[] {
  const groups = new Map<string, AttributeGroup>();
  for (const selection of product.attributeOptions) {
    if (typeof selection.attribute !== 'object') continue;
    const attribute = selection.attribute;
    if (!groups.has(attribute._id)) groups.set(attribute._id, { attribute, options: [] });
    groups.get(attribute._id)!.options.push({ option: selection.option, priceAdjustment: selection.priceAdjustment });
  }
  return [...groups.values()];
}

export default function ProductDetailScreen({ route }: RootStackScreenProps<'ProductDetail'>) {
  const { productId } = route.params;
  const { t } = useTranslation();
  const theme = useTheme();
  const { language } = useApp();
  const { canUseCart } = useAccess();
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(1);
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [selections, setSelections] = useState<Record<string, string>>({});

  const productQuery = useQuery([queryKeys.PRODUCT, productId], () => productService.getById(productId));

  const attributeGroups = useMemo(() => (productQuery.data ? groupByAttribute(productQuery.data) : []), [productQuery.data]);

  // Defaults to the first configured option per setting, mirroring how the admin lists
  // them — the client can still change it before adding to cart.
  useEffect(() => {
    if (attributeGroups.length === 0) return;
    setSelections((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const group of attributeGroups) {
        if (!next[group.attribute._id]) {
          next[group.attribute._id] = group.options[0].option;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [attributeGroups]);

  const unitPrice = useMemo(() => {
    if (!productQuery.data) return 0;
    return attributeGroups.reduce((sum, group) => {
      const selectedOption = selections[group.attribute._id];
      const match = group.options.find((o) => o.option === selectedOption);
      return sum + (match?.priceAdjustment ?? 0);
    }, productQuery.data.price);
  }, [productQuery.data, attributeGroups, selections]);

  const addToCartMutation = useMutation(
    (qty: number) =>
      cartService.addItem(
        productId,
        qty,
        attributeGroups.map((group) => ({ attribute: group.attribute._id, option: selections[group.attribute._id] })),
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(queryKeys.CART);
        setAddedFeedback(true);
        setTimeout(() => setAddedFeedback(false), 2000);
      },
    },
  );

  if (productQuery.isLoading) return <LoadingState />;
  if (productQuery.isError || !productQuery.data) {
    return <ErrorState message={getErrorMessage(productQuery.error, t('product.detail.notFound'))} onRetry={() => productQuery.refetch()} />;
  }

  const product = productQuery.data;
  const images = product.images.length > 0 ? product.images : [];
  const outOfStock = product.stock <= 0;
  const allSelected = attributeGroups.every((group) => !!selections[group.attribute._id]);

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
        <Text style={[styles.price, { color: theme.colors.primary }]}>{formatCurrency(unitPrice, product.currency)}</Text>
        <Badge label={outOfStock ? t('catalog.outOfStock') : t('catalog.inStock')} tone={outOfStock ? 'danger' : 'success'} />

        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('product.detail.description')}</Text>
        <Text style={[styles.body, { color: theme.colors.textMuted }]}>{pickI18nText(product.description, language)}</Text>

        <View style={styles.specsGrid}>
          <Spec label={t('product.detail.stock')} value={String(product.stock)} theme={theme} />
        </View>

        {attributeGroups.length > 0 ? (
          <View style={styles.attributeGroups}>
            {attributeGroups.map((group) => (
              <View key={group.attribute._id} style={styles.attributeGroup}>
                <Text style={[styles.attributeLabel, { color: theme.colors.text }]}>{pickI18nText(group.attribute.name, language)}</Text>
                <View style={styles.optionsRow}>
                  {group.options.map(({ option, priceAdjustment }) => {
                    const optionInfo = group.attribute.options.find((o) => o._id === option);
                    const label = optionInfo ? pickI18nText(optionInfo.name, language) : option;
                    const suffix =
                      priceAdjustment > 0
                        ? ` (+${formatCurrency(priceAdjustment, product.currency)})`
                        : priceAdjustment < 0
                          ? ` (${formatCurrency(priceAdjustment, product.currency)})`
                          : '';
                    const selected = selections[group.attribute._id] === option;
                    return (
                      <Pressable
                        key={option}
                        onPress={() => setSelections((prev) => ({ ...prev, [group.attribute._id]: option }))}
                        style={[
                          styles.option,
                          {
                            backgroundColor: selected ? theme.colors.primary : theme.colors.surfaceAlt,
                            borderColor: theme.colors.border,
                          },
                        ]}
                      >
                        <Text style={{ color: selected ? theme.colors.primaryText : theme.colors.text }}>
                          {label}
                          {suffix}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
        ) : null}

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
              disabled={outOfStock || !allSelected}
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
  attributeGroups: { marginTop: spacing.lg, gap: spacing.md },
  attributeGroup: { gap: spacing.xs },
  attributeLabel: { ...typography.bodyBold },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  option: { paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.full, borderWidth: 1 },
  domainsRow: { marginBottom: spacing.sm },
  domainChip: { paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.full, marginRight: spacing.sm },
  cartSection: { marginTop: spacing.xl, gap: spacing.md },
  quantityRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  quantityControls: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  quantityValue: { ...typography.bodyBold, minWidth: 24, textAlign: 'center' },
  error: { ...typography.small, textAlign: 'center' },
});
