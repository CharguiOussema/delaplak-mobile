import React, { useEffect, useState } from 'react';
import { Alert, Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import * as ImagePicker from 'expo-image-picker';
import { useAccess, useApp, useTheme } from '../../../hooks';
import { AccessControl } from '../../../components/AccessControl';
import { Button, ErrorState, Input, LoadingState, Screen } from '../../../components/ui';
import { productService } from '../../../services/ProductService';
import { categoryService } from '../../../services/CategoryService';
import { productAttributeService } from '../../../services/ProductAttributeService';
import { queryKeys } from '../../../services/QueryClientManager';
import { getErrorMessage } from '../../../utils/errorHandling';
import { pickI18nText } from '../../../utils/format';
import type { FilterOption, ProductAttribute } from '../../../models';
import { spacing, radius, typography } from '../../../theme/theme';
import type { RootStackScreenProps } from '../../../navigation/types';

export default function AdminProductFormScreen({ route, navigation }: RootStackScreenProps<'AdminProductForm'>) {
  const productId = route.params?.productId;
  const isEdit = !!productId;
  const { t } = useTranslation();
  const theme = useTheme();
  const { language } = useApp();
  const { canWriteProducts } = useAccess();
  const queryClient = useQueryClient();

  const productQuery = useQuery([queryKeys.PRODUCT, productId], () => productService.getById(productId as string), {
    enabled: isEdit,
  });
  const categoriesQuery = useQuery([queryKeys.CATEGORY_FILTER], () => categoryService.getFilter());
  const attributeTypesQuery = useQuery([queryKeys.PRODUCT_ATTRIBUTES], () => productAttributeService.getAll({ limit: 100 }));

  const [nameEn, setNameEn] = useState('');
  const [nameFr, setNameFr] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [descriptionFr, setDescriptionFr] = useState('');
  const [descriptionAr, setDescriptionAr] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('TND');
  const [applicationDomains, setApplicationDomains] = useState('');
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [stock, setStock] = useState('0');
  const [error, setError] = useState<string | null>(null);
  const [pickedImages, setPickedImages] = useState<ImagePicker.ImagePickerAsset[]>([]);

  // Flattened rows mirroring the server payload shape: one row per (attribute, option) this
  // product offers, each with its own price adjustment. Toggling an option in the picker
  // below adds/removes a row; selected rows render an inline price adjustment input.
  const [attributeOptionRows, setAttributeOptionRows] = useState<{ attribute: string; option: string; priceAdjustment: string }[]>([]);

  // Categories created inline via the "+ Add category" modal, kept locally until the
  // CATEGORY_FILTER query refetches so they show up in the picker immediately.
  const [extraCategoryOptions, setExtraCategoryOptions] = useState<FilterOption[]>([]);
  const [isAddCategoryVisible, setAddCategoryVisible] = useState(false);
  const [qcNameEn, setQcNameEn] = useState('');
  const [qcNameFr, setQcNameFr] = useState('');
  const [qcNameAr, setQcNameAr] = useState('');
  const [qcDescriptionEn, setQcDescriptionEn] = useState('');
  const [qcDescriptionFr, setQcDescriptionFr] = useState('');
  const [qcDescriptionAr, setQcDescriptionAr] = useState('');
  const [qcSlug, setQcSlug] = useState('');
  const [qcError, setQcError] = useState<string | null>(null);

  useEffect(() => {
    if (productQuery.data) {
      const p = productQuery.data;
      setNameEn(p.name.en);
      setNameFr(p.name.fr);
      setNameAr(p.name.ar);
      setDescriptionEn(p.description.en);
      setDescriptionFr(p.description.fr);
      setDescriptionAr(p.description.ar);
      setPrice(String(p.price));
      setCurrency(p.currency);
      setApplicationDomains(p.applicationDomains.join(', '));
      setCategoryIds(p.categories.map((c) => (typeof c === 'string' ? c : c._id)));
      setStock(String(p.stock));
      setAttributeOptionRows(
        p.attributeOptions.map((a) => ({
          attribute: typeof a.attribute === 'string' ? a.attribute : a.attribute._id,
          option: a.option,
          priceAdjustment: String(a.priceAdjustment),
        })),
      );
    }
  }, [productQuery.data]);

  const saveMutation = useMutation(
    () => {
      const payload = {
        name: { en: nameEn, fr: nameFr, ar: nameAr },
        description: { en: descriptionEn, fr: descriptionFr, ar: descriptionAr },
        price: Number(price) || 0,
        currency,
        applicationDomains: applicationDomains
          .split(',')
          .map((d) => d.trim())
          .filter(Boolean),
        categories: categoryIds,
        stock: Number(stock) || 0,
        attributeOptions: attributeOptionRows.map((row) => ({
          attribute: row.attribute,
          option: row.option,
          priceAdjustment: Number(row.priceAdjustment) || 0,
        })),
      };
      return isEdit ? productService.update(productId as string, payload) : productService.create(payload);
    },
    {
      onSuccess: async (product) => {
        queryClient.invalidateQueries(queryKeys.PRODUCTS);
        if (pickedImages.length > 0) {
          await uploadImagesMutation.mutateAsync(product._id);
        } else {
          navigation.goBack();
        }
      },
    },
  );

  const uploadImagesMutation = useMutation(
    (targetProductId: string) =>
      productService.addImages(
        targetProductId,
        pickedImages.map((img, index) => ({
          uri: img.uri,
          name: img.fileName ?? `image-${index}.jpg`,
          type: img.mimeType ?? 'image/jpeg',
        })),
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(queryKeys.PRODUCTS);
        queryClient.invalidateQueries(queryKeys.PRODUCT);
        navigation.goBack();
      },
    },
  );

  const removeImageMutation = useMutation((path: string) => productService.removeImage(productId as string, path), {
    onSuccess: () => {
      queryClient.invalidateQueries([queryKeys.PRODUCT, productId]);
      queryClient.invalidateQueries(queryKeys.PRODUCTS);
    },
  });

  const handlePickImages = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: 10,
      quality: 0.8,
    });
    if (!result.canceled) {
      setPickedImages((prev) => [...prev, ...result.assets]);
    }
  };

  const handleSave = () => {
    setError(null);
    if (!nameEn.trim() || !nameFr.trim() || !nameAr.trim() || !price) {
      setError(t('common.required'));
      return;
    }
    if (categoryIds.length === 0) {
      setError(t('admin.products.categoryRequired'));
      return;
    }
    saveMutation.mutate();
  };

  const handleDelete = () => {
    Alert.alert(t('admin.products.delete'), t('admin.products.deleteConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: () => deleteMutation.mutate() },
    ]);
  };

  const deleteMutation = useMutation(() => productService.remove(productId as string), {
    onSuccess: () => {
      queryClient.invalidateQueries(queryKeys.PRODUCTS);
      navigation.goBack();
    },
    onError: (deleteError) => {
      Alert.alert(t('common.error'), getErrorMessage(deleteError));
    },
  });

  const toggleCategory = (id: string) => {
    setCategoryIds((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  };

  const toggleAttributeOption = (attributeId: string, optionId: string) => {
    setAttributeOptionRows((prev) =>
      prev.some((row) => row.attribute === attributeId && row.option === optionId)
        ? prev.filter((row) => !(row.attribute === attributeId && row.option === optionId))
        : [...prev, { attribute: attributeId, option: optionId, priceAdjustment: '0' }],
    );
  };

  const setAttributeOptionPrice = (attributeId: string, optionId: string, priceAdjustment: string) => {
    setAttributeOptionRows((prev) =>
      prev.map((row) => (row.attribute === attributeId && row.option === optionId ? { ...row, priceAdjustment } : row)),
    );
  };

  const resetQuickAddForm = () => {
    setQcNameEn('');
    setQcNameFr('');
    setQcNameAr('');
    setQcDescriptionEn('');
    setQcDescriptionFr('');
    setQcDescriptionAr('');
    setQcSlug('');
    setQcError(null);
  };

  const addCategoryMutation = useMutation(
    () =>
      categoryService.create({
        name: {
          en: qcNameEn.trim() || undefined,
          fr: qcNameFr.trim() || undefined,
          ar: qcNameAr.trim() || undefined,
        },
        description: {
          en: qcDescriptionEn.trim() || undefined,
          fr: qcDescriptionFr.trim() || undefined,
          ar: qcDescriptionAr.trim() || undefined,
        },
        slug: qcSlug.trim(),
        parent: null,
      }),
    {
      onSuccess: (category) => {
        queryClient.invalidateQueries(queryKeys.CATEGORY_FILTER);
        queryClient.invalidateQueries(queryKeys.CATEGORIES);
        setExtraCategoryOptions((prev) => [...prev, { value: category._id, label: pickI18nText(category.name, language) }]);
        setCategoryIds((prev) => [...prev, category._id]);
        resetQuickAddForm();
        setAddCategoryVisible(false);
      },
      onError: (addError) => {
        setQcError(getErrorMessage(addError));
      },
    },
  );

  const handleQuickAddCategory = () => {
    setQcError(null);
    if (!qcNameEn.trim() && !qcNameFr.trim() && !qcNameAr.trim()) {
      setQcError(t('admin.categories.nameRequired'));
      return;
    }
    if (!qcSlug.trim()) {
      setQcError(t('common.required'));
      return;
    }
    addCategoryMutation.mutate();
  };

  if (isEdit && productQuery.isLoading) return <LoadingState />;
  if (isEdit && productQuery.isError) {
    return <ErrorState message={getErrorMessage(productQuery.error)} onRetry={() => productQuery.refetch()} />;
  }

  const fetchedCategoryOptions = categoriesQuery.data ?? [];
  const categoryOptions = [
    ...fetchedCategoryOptions,
    ...extraCategoryOptions.filter((extra) => !fetchedCategoryOptions.some((option) => option.value === extra.value)),
  ];
  const existingImages = productQuery.data?.images ?? [];
  const isSaving = saveMutation.isLoading || uploadImagesMutation.isLoading;
  const attributeTypes: ProductAttribute[] = attributeTypesQuery.data?.docs ?? [];

  return (
    <AccessControl allowed={canWriteProducts}>
      <Screen scroll>
        <Text style={[styles.title, { color: theme.colors.text }]}>{isEdit ? t('admin.products.edit') : t('admin.products.add')}</Text>

        <Input label={t('admin.products.nameEn')} value={nameEn} onChangeText={setNameEn} />
        <Input label={t('admin.products.nameFr')} value={nameFr} onChangeText={setNameFr} />
        <Input label={t('admin.products.nameAr')} value={nameAr} onChangeText={setNameAr} />
        <Input label={t('admin.products.descriptionEn')} value={descriptionEn} onChangeText={setDescriptionEn} multiline />
        <Input label={t('admin.products.descriptionFr')} value={descriptionFr} onChangeText={setDescriptionFr} multiline />
        <Input label={t('admin.products.descriptionAr')} value={descriptionAr} onChangeText={setDescriptionAr} multiline />
        <Input label={t('admin.products.price')} value={price} onChangeText={setPrice} keyboardType="decimal-pad" />
        <Input label={t('admin.products.currency')} value={currency} onChangeText={setCurrency} autoCapitalize="characters" />
        <Input label={t('admin.products.applicationDomains')} value={applicationDomains} onChangeText={setApplicationDomains} />
        <Input label={t('admin.products.stock')} value={stock} onChangeText={setStock} keyboardType="number-pad" />

        <Text style={[styles.label, { color: theme.colors.text }]}>{t('admin.products.category')}</Text>
        <View style={styles.optionsRow}>
          {categoryOptions.map((option) => {
            const selected = categoryIds.includes(option.value);
            return (
              <Pressable
                key={option.value}
                onPress={() => toggleCategory(option.value)}
                style={[
                  styles.option,
                  {
                    backgroundColor: selected ? theme.colors.primary : theme.colors.surfaceAlt,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <Text style={{ color: selected ? theme.colors.primaryText : theme.colors.text }}>
                  {selected ? '✓ ' : ''}
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
          <Pressable
            onPress={() => setAddCategoryVisible(true)}
            style={[styles.option, { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.border }]}
          >
            <Text style={{ color: theme.colors.primary }}>{t('admin.products.addCategory')}</Text>
          </Pressable>
        </View>

        <Text style={[styles.label, { color: theme.colors.text }]}>{t('admin.products.settings')}</Text>
        <Text style={[styles.hint, { color: theme.colors.textMuted }]}>{t('admin.products.settingsHint')}</Text>
        {attributeTypes.length === 0 ? (
          <Text style={[styles.body, { color: theme.colors.textMuted }]}>{t('admin.products.noAttributesYet')}</Text>
        ) : (
          attributeTypes.map((attribute) => {
            const rowsForAttribute = attributeOptionRows.filter((row) => row.attribute === attribute._id);
            return (
              <View key={attribute._id} style={[styles.attributeCard, { borderColor: theme.colors.border }]}>
                <Text style={[styles.attributeName, { color: theme.colors.text }]}>{pickI18nText(attribute.name, language)}</Text>
                <View style={styles.optionsRow}>
                  {attribute.options.map((option) => {
                    const selected = rowsForAttribute.some((row) => row.option === option._id);
                    return (
                      <Pressable
                        key={option._id}
                        onPress={() => toggleAttributeOption(attribute._id, option._id)}
                        style={[
                          styles.option,
                          {
                            backgroundColor: selected ? theme.colors.primary : theme.colors.surfaceAlt,
                            borderColor: theme.colors.border,
                          },
                        ]}
                      >
                        <Text style={{ color: selected ? theme.colors.primaryText : theme.colors.text }}>
                          {selected ? '✓ ' : ''}
                          {pickI18nText(option.name, language)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
                {rowsForAttribute.map((row) => {
                  const option = attribute.options.find((o) => o._id === row.option);
                  return (
                    <View key={row.option} style={styles.priceRow}>
                      <Text style={[styles.priceRowLabel, { color: theme.colors.text }]} numberOfLines={1}>
                        {option ? pickI18nText(option.name, language) : row.option}
                      </Text>
                      <Input
                        value={row.priceAdjustment}
                        onChangeText={(value) => setAttributeOptionPrice(attribute._id, row.option, value)}
                        keyboardType="numbers-and-punctuation"
                        placeholder={t('admin.products.priceAdjustment') ?? undefined}
                        style={styles.priceRowInput}
                      />
                    </View>
                  );
                })}
              </View>
            );
          })
        )}

        <Text style={[styles.label, { color: theme.colors.text }]}>{t('admin.products.images')}</Text>
        {existingImages.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesRow}>
            {existingImages.map((path) => (
              <View key={path} style={styles.imageWrap}>
                <Image source={{ uri: productService.resolveImageUrl(path) }} style={styles.image} />
                <Pressable
                  style={[styles.removeBadge, { backgroundColor: theme.colors.danger }]}
                  onPress={() => removeImageMutation.mutate(path)}
                >
                  <Text style={[styles.removeBadgeText, { color: theme.colors.textInverse }]}>×</Text>
                </Pressable>
              </View>
            ))}
          </ScrollView>
        ) : null}
        {pickedImages.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesRow}>
            {pickedImages.map((img) => (
              <Image key={img.uri} source={{ uri: img.uri }} style={styles.image} />
            ))}
          </ScrollView>
        ) : null}
        <Button title={t('admin.products.addImage')} variant="outline" onPress={handlePickImages} style={styles.pickButton} />

        {error ? <Text style={[styles.error, { color: theme.colors.danger }]}>{error}</Text> : null}
        {saveMutation.isError ? (
          <Text style={[styles.error, { color: theme.colors.danger }]}>{getErrorMessage(saveMutation.error)}</Text>
        ) : null}
        {uploadImagesMutation.isError ? (
          <Text style={[styles.error, { color: theme.colors.danger }]}>{getErrorMessage(uploadImagesMutation.error)}</Text>
        ) : null}

        <Button title={t('common.save')} onPress={handleSave} loading={isSaving} fullWidth style={styles.saveButton} />
        {deleteMutation.isError ? (
          <Text style={[styles.error, { color: theme.colors.danger }]}>{getErrorMessage(deleteMutation.error)}</Text>
        ) : null}
        {isEdit ? (
          <Button
            title={t('admin.products.delete')}
            variant="danger"
            onPress={handleDelete}
            loading={deleteMutation.isLoading}
            fullWidth
            style={styles.deleteButton}
          />
        ) : null}
      </Screen>

      <Modal
        visible={isAddCategoryVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAddCategoryVisible(false)}
      >
        <View style={styles.overlay}>
          <ScrollView contentContainerStyle={[styles.modalCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.title, { color: theme.colors.text, fontSize: 18 }]}>{t('admin.products.addCategoryTitle')}</Text>
            <Input label={t('admin.categories.nameEn')} value={qcNameEn} onChangeText={setQcNameEn} />
            <Input label={t('admin.categories.nameFr')} value={qcNameFr} onChangeText={setQcNameFr} />
            <Input label={t('admin.categories.nameAr')} value={qcNameAr} onChangeText={setQcNameAr} />
            <Input label={t('admin.categories.descriptionEn')} value={qcDescriptionEn} onChangeText={setQcDescriptionEn} multiline />
            <Input label={t('admin.categories.descriptionFr')} value={qcDescriptionFr} onChangeText={setQcDescriptionFr} multiline />
            <Input label={t('admin.categories.descriptionAr')} value={qcDescriptionAr} onChangeText={setQcDescriptionAr} multiline />
            <Input label={t('admin.categories.slug')} value={qcSlug} onChangeText={setQcSlug} autoCapitalize="none" />
            {qcError ? <Text style={[styles.error, { color: theme.colors.danger }]}>{qcError}</Text> : null}
            <View style={styles.modalActions}>
              <Button
                title={t('common.cancel')}
                variant="ghost"
                onPress={() => {
                  resetQuickAddForm();
                  setAddCategoryVisible(false);
                }}
                style={styles.modalActionButton}
              />
              <Button
                title={t('common.save')}
                onPress={handleQuickAddCategory}
                loading={addCategoryMutation.isLoading}
                style={styles.modalActionButton}
              />
            </View>
          </ScrollView>
        </View>
      </Modal>
    </AccessControl>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h1, marginBottom: spacing.lg },
  label: { ...typography.small, fontWeight: '600', marginBottom: spacing.xs, marginTop: spacing.xs },
  hint: { ...typography.tiny, marginBottom: spacing.sm },
  body: { ...typography.body, marginBottom: spacing.md },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  option: { paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.full, borderWidth: 1 },
  attributeCard: { borderWidth: StyleSheet.hairlineWidth, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md },
  attributeName: { ...typography.bodyBold, marginBottom: spacing.sm },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  priceRowLabel: { ...typography.small, flex: 1 },
  priceRowInput: { width: 90 },
  imagesRow: { marginBottom: spacing.sm },
  imageWrap: { marginRight: spacing.sm },
  image: { width: 80, height: 80, borderRadius: radius.md, marginRight: spacing.sm },
  removeBadge: {
    position: 'absolute',
    top: -6,
    right: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBadgeText: { fontSize: 14, lineHeight: 16 },
  pickButton: { marginBottom: spacing.md },
  error: { ...typography.small, marginBottom: spacing.sm },
  saveButton: { marginTop: spacing.md },
  deleteButton: { marginTop: spacing.md },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  modalCard: {
    width: '100%',
    borderRadius: 16,
    padding: spacing.lg,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  modalActionButton: { flexShrink: 0 },
});
