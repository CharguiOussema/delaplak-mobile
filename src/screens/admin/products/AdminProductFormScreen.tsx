import React, { useEffect, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import * as ImagePicker from 'expo-image-picker';
import { useAccess, useTheme } from '../../../hooks';
import { AccessControl } from '../../../components/AccessControl';
import { Button, ErrorState, Input, LoadingState, Screen } from '../../../components/ui';
import { productService } from '../../../services/ProductService';
import { categoryService } from '../../../services/CategoryService';
import { queryKeys } from '../../../services/QueryClientManager';
import { getErrorMessage } from '../../../utils/errorHandling';
import { spacing, radius, typography } from '../../../theme/theme';
import type { RootStackScreenProps } from '../../../navigation/types';

export default function AdminProductFormScreen({ route, navigation }: RootStackScreenProps<'AdminProductForm'>) {
  const productId = route.params?.productId;
  const isEdit = !!productId;
  const { t } = useTranslation();
  const theme = useTheme();
  const { canWriteProducts } = useAccess();
  const queryClient = useQueryClient();

  const productQuery = useQuery([queryKeys.PRODUCT, productId], () => productService.getById(productId as string), {
    enabled: isEdit,
  });
  const categoriesQuery = useQuery([queryKeys.CATEGORY_FILTER], () => categoryService.getFilter());

  const [nameEn, setNameEn] = useState('');
  const [nameFr, setNameFr] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [descriptionFr, setDescriptionFr] = useState('');
  const [descriptionAr, setDescriptionAr] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('MAD');
  const [dimensions, setDimensions] = useState('');
  const [thickness, setThickness] = useState('');
  const [texture, setTexture] = useState('');
  const [applicationDomains, setApplicationDomains] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [stock, setStock] = useState('0');
  const [error, setError] = useState<string | null>(null);
  const [pickedImages, setPickedImages] = useState<ImagePicker.ImagePickerAsset[]>([]);

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
      setDimensions(p.dimensions);
      setThickness(p.thickness);
      setTexture(p.texture);
      setApplicationDomains(p.applicationDomains.join(', '));
      setCategoryId(typeof p.category === 'string' ? p.category : p.category._id);
      setStock(String(p.stock));
    }
  }, [productQuery.data]);

  const saveMutation = useMutation(
    () => {
      const payload = {
        name: { en: nameEn, fr: nameFr, ar: nameAr },
        description: { en: descriptionEn, fr: descriptionFr, ar: descriptionAr },
        price: Number(price) || 0,
        currency,
        dimensions,
        thickness,
        texture,
        applicationDomains: applicationDomains
          .split(',')
          .map((d) => d.trim())
          .filter(Boolean),
        category: categoryId as string,
        stock: Number(stock) || 0,
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
    if (!nameEn.trim() || !nameFr.trim() || !nameAr.trim() || !categoryId || !price) {
      setError(t('common.required'));
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
  });

  if (isEdit && productQuery.isLoading) return <LoadingState />;
  if (isEdit && productQuery.isError) {
    return <ErrorState message={getErrorMessage(productQuery.error)} onRetry={() => productQuery.refetch()} />;
  }

  const categoryOptions = categoriesQuery.data ?? [];
  const existingImages = productQuery.data?.images ?? [];
  const isSaving = saveMutation.isLoading || uploadImagesMutation.isLoading;

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
        <Input label={t('admin.products.dimensions')} value={dimensions} onChangeText={setDimensions} />
        <Input label={t('admin.products.thickness')} value={thickness} onChangeText={setThickness} />
        <Input label={t('admin.products.texture')} value={texture} onChangeText={setTexture} />
        <Input label={t('admin.products.applicationDomains')} value={applicationDomains} onChangeText={setApplicationDomains} />
        <Input label={t('admin.products.stock')} value={stock} onChangeText={setStock} keyboardType="number-pad" />

        <Text style={[styles.label, { color: theme.colors.text }]}>{t('admin.products.category')}</Text>
        <View style={styles.optionsRow}>
          {categoryOptions.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => setCategoryId(option.value)}
              style={[
                styles.option,
                {
                  backgroundColor: categoryId === option.value ? theme.colors.primary : theme.colors.surfaceAlt,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Text style={{ color: categoryId === option.value ? theme.colors.primaryText : theme.colors.text }}>{option.label}</Text>
            </Pressable>
          ))}
        </View>

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
                  <Text style={styles.removeBadgeText}>×</Text>
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
    </AccessControl>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h1, marginBottom: spacing.lg },
  label: { ...typography.small, fontWeight: '600', marginBottom: spacing.xs, marginTop: spacing.xs },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  option: { paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.full, borderWidth: 1 },
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
  removeBadgeText: { color: '#fff', fontSize: 14, lineHeight: 16 },
  pickButton: { marginBottom: spacing.md },
  error: { ...typography.small, marginBottom: spacing.sm },
  saveButton: { marginTop: spacing.md },
  deleteButton: { marginTop: spacing.md },
});
