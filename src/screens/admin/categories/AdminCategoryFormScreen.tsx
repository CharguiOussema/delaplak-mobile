import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useAccess, useTheme } from '../../../hooks';
import { AccessControl } from '../../../components/AccessControl';
import { Button, ErrorState, Input, LoadingState, Screen } from '../../../components/ui';
import { categoryService } from '../../../services/CategoryService';
import { queryKeys } from '../../../services/QueryClientManager';
import { getErrorMessage } from '../../../utils/errorHandling';
import { spacing, radius, typography } from '../../../theme/theme';
import type { RootStackScreenProps } from '../../../navigation/types';

export default function AdminCategoryFormScreen({ route, navigation }: RootStackScreenProps<'AdminCategoryForm'>) {
  const categoryId = route.params?.categoryId;
  const isEdit = !!categoryId;
  const { t } = useTranslation();
  const theme = useTheme();
  const { canWriteCategories } = useAccess();
  const queryClient = useQueryClient();

  const categoryQuery = useQuery([queryKeys.CATEGORIES, categoryId], () => categoryService.getById(categoryId as string), {
    enabled: isEdit,
  });
  const parentOptionsQuery = useQuery([queryKeys.CATEGORY_FILTER], () => categoryService.getFilter());

  const [nameEn, setNameEn] = useState('');
  const [nameFr, setNameFr] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [descriptionFr, setDescriptionFr] = useState('');
  const [descriptionAr, setDescriptionAr] = useState('');
  const [slug, setSlug] = useState('');
  const [parentId, setParentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (categoryQuery.data) {
      setNameEn(categoryQuery.data.name.en);
      setNameFr(categoryQuery.data.name.fr);
      setNameAr(categoryQuery.data.name.ar);
      setDescriptionEn(categoryQuery.data.description?.en ?? '');
      setDescriptionFr(categoryQuery.data.description?.fr ?? '');
      setDescriptionAr(categoryQuery.data.description?.ar ?? '');
      setSlug(categoryQuery.data.slug);
      setParentId(categoryQuery.data.parent);
    }
  }, [categoryQuery.data]);

  const parentOptions = (parentOptionsQuery.data ?? []).filter((option) => option.value !== categoryId);

  const saveMutation = useMutation(
    () => {
      // Empty/untouched language inputs are sent as undefined (not ""), so the backend's
      // first-non-empty-wins auto-fill logic can pick the right value to copy to the others.
      const payload = {
        name: {
          en: nameEn.trim() || undefined,
          fr: nameFr.trim() || undefined,
          ar: nameAr.trim() || undefined,
        },
        description: {
          en: descriptionEn.trim() || undefined,
          fr: descriptionFr.trim() || undefined,
          ar: descriptionAr.trim() || undefined,
        },
        slug,
        parent: parentId,
      };
      return isEdit ? categoryService.update(categoryId as string, payload) : categoryService.create(payload);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(queryKeys.CATEGORIES);
        queryClient.invalidateQueries(queryKeys.CATEGORY_TREE);
        queryClient.invalidateQueries(queryKeys.CATEGORY_FILTER);
        navigation.goBack();
      },
    },
  );

  const deleteMutation = useMutation(() => categoryService.remove(categoryId as string), {
    onSuccess: () => {
      queryClient.invalidateQueries(queryKeys.CATEGORIES);
      queryClient.invalidateQueries(queryKeys.CATEGORY_TREE);
      navigation.goBack();
    },
    onError: (deleteError) => {
      Alert.alert(t('common.error'), getErrorMessage(deleteError));
    },
  });

  const handleSave = () => {
    setError(null);
    if (!nameEn.trim() && !nameFr.trim() && !nameAr.trim()) {
      setError(t('admin.categories.nameRequired'));
      return;
    }
    if (!slug.trim()) {
      setError(t('common.required'));
      return;
    }
    saveMutation.mutate();
  };

  const handleDelete = () => {
    Alert.alert(t('admin.categories.delete'), t('admin.categories.deleteConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: () => deleteMutation.mutate() },
    ]);
  };

  if (isEdit && categoryQuery.isLoading) return <LoadingState />;
  if (isEdit && categoryQuery.isError) {
    return <ErrorState message={getErrorMessage(categoryQuery.error)} onRetry={() => categoryQuery.refetch()} />;
  }

  return (
    <AccessControl allowed={canWriteCategories}>
      <Screen scroll>
        <Text style={[styles.title, { color: theme.colors.text }]}>{isEdit ? t('admin.categories.edit') : t('admin.categories.add')}</Text>

        <Input label={t('admin.categories.nameEn')} value={nameEn} onChangeText={setNameEn} />
        <Input label={t('admin.categories.nameFr')} value={nameFr} onChangeText={setNameFr} />
        <Input label={t('admin.categories.nameAr')} value={nameAr} onChangeText={setNameAr} />
        <Input label={t('admin.categories.descriptionEn')} value={descriptionEn} onChangeText={setDescriptionEn} multiline />
        <Input label={t('admin.categories.descriptionFr')} value={descriptionFr} onChangeText={setDescriptionFr} multiline />
        <Input label={t('admin.categories.descriptionAr')} value={descriptionAr} onChangeText={setDescriptionAr} multiline />
        <Input label={t('admin.categories.slug')} value={slug} onChangeText={setSlug} autoCapitalize="none" />

        <Text style={[styles.label, { color: theme.colors.text }]}>{t('admin.categories.parent')}</Text>
        <View style={styles.optionsRow}>
          <Pressable
            onPress={() => setParentId(null)}
            style={[
              styles.option,
              { backgroundColor: !parentId ? theme.colors.primary : theme.colors.surfaceAlt, borderColor: theme.colors.border },
            ]}
          >
            <Text style={{ color: !parentId ? theme.colors.primaryText : theme.colors.text }}>{t('admin.categories.noParent')}</Text>
          </Pressable>
          {parentOptions.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => setParentId(option.value)}
              style={[
                styles.option,
                {
                  backgroundColor: parentId === option.value ? theme.colors.primary : theme.colors.surfaceAlt,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Text style={{ color: parentId === option.value ? theme.colors.primaryText : theme.colors.text }}>{option.label}</Text>
            </Pressable>
          ))}
        </View>

        {error ? <Text style={[styles.error, { color: theme.colors.danger }]}>{error}</Text> : null}
        {saveMutation.isError ? (
          <Text style={[styles.error, { color: theme.colors.danger }]}>{getErrorMessage(saveMutation.error)}</Text>
        ) : null}

        <Button title={t('common.save')} onPress={handleSave} loading={saveMutation.isLoading} fullWidth style={styles.saveButton} />

        {deleteMutation.isError ? (
          <Text style={[styles.error, { color: theme.colors.danger }]}>{getErrorMessage(deleteMutation.error)}</Text>
        ) : null}
        {isEdit ? (
          <Button
            title={t('admin.categories.delete')}
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
  label: { ...typography.small, fontWeight: '600', marginBottom: spacing.xs },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  option: { paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.full, borderWidth: 1 },
  error: { ...typography.small, marginBottom: spacing.sm },
  saveButton: { marginTop: spacing.md },
  deleteButton: { marginTop: spacing.md },
});
