import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import { useApp, useAccess, useTheme } from '../../../hooks';
import { Button, EmptyState, ErrorState, LoadingState, Screen } from '../../../components/ui';
import { categoryService } from '../../../services/CategoryService';
import { queryKeys } from '../../../services/QueryClientManager';
import { pickI18nText } from '../../../utils/format';
import { getErrorMessage } from '../../../utils/errorHandling';
import { spacing, radius, typography } from '../../../theme/theme';
import type { Category } from '../../../models';
import type { RootStackScreenProps } from '../../../navigation/types';

export default function AdminCategoriesListScreen({ navigation }: RootStackScreenProps<'AdminCategoriesList'>) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { language } = useApp();
  const { canWriteCategories } = useAccess();

  const categoriesQuery = useQuery([queryKeys.CATEGORIES], () => categoryService.getAll({ limit: 100 }));

  if (categoriesQuery.isLoading) return <LoadingState />;
  if (categoriesQuery.isError) {
    return <ErrorState message={getErrorMessage(categoriesQuery.error)} onRetry={() => categoriesQuery.refetch()} />;
  }

  const categories = categoriesQuery.data?.docs ?? [];

  const renderItem = ({ item }: { item: Category }) => (
    <Pressable
      style={[styles.row, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
      onPress={() => canWriteCategories && navigation.navigate('AdminCategoryForm', { categoryId: item._id })}
    >
      <Text style={[styles.name, { color: theme.colors.text }]}>{pickI18nText(item.name, language)}</Text>
      <Text style={[styles.meta, { color: theme.colors.textMuted }]}>{item.slug}</Text>
    </Pressable>
  );

  return (
    <Screen padded={false}>
      <View style={styles.header}>
        <Button title={t('admin.categories.tree')} variant="outline" onPress={() => navigation.navigate('AdminCategoryTree')} />
        {canWriteCategories ? (
          <Button title={t('admin.categories.add')} onPress={() => navigation.navigate('AdminCategoryForm', undefined)} />
        ) : null}
      </View>
      <FlatList
        data={categories}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshing={categoriesQuery.isFetching}
        onRefresh={() => categoriesQuery.refetch()}
        ListEmptyComponent={<EmptyState title={t('admin.categories.empty')} />}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: spacing.lg, paddingBottom: spacing.sm, gap: spacing.sm },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, flexGrow: 1 },
  row: { borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, padding: spacing.md, marginBottom: spacing.md, gap: 2 },
  name: { ...typography.bodyBold },
  meta: { ...typography.small },
});
