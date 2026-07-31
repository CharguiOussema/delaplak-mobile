import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import { useApp, useAccess, useTheme } from '../../../hooks';
import { Button, EmptyState, ErrorState, LoadingState, Screen } from '../../../components/ui';
import { productAttributeService } from '../../../services/ProductAttributeService';
import { queryKeys } from '../../../services/QueryClientManager';
import { pickI18nText } from '../../../utils/format';
import { getErrorMessage } from '../../../utils/errorHandling';
import { spacing, radius, typography } from '../../../theme/theme';
import type { ProductAttribute } from '../../../models';
import type { RootStackScreenProps } from '../../../navigation/types';

export default function AdminProductAttributesListScreen({ navigation }: RootStackScreenProps<'AdminProductAttributesList'>) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { language } = useApp();
  const { canWriteProductAttributes } = useAccess();

  const attributesQuery = useQuery([queryKeys.PRODUCT_ATTRIBUTES], () => productAttributeService.getAll({ limit: 100 }));

  if (attributesQuery.isLoading) return <LoadingState />;
  if (attributesQuery.isError) {
    return <ErrorState message={getErrorMessage(attributesQuery.error)} onRetry={() => attributesQuery.refetch()} />;
  }

  const attributes = attributesQuery.data?.docs ?? [];

  const renderItem = ({ item }: { item: ProductAttribute }) => (
    <Pressable
      style={[styles.row, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
      onPress={() => canWriteProductAttributes && navigation.navigate('AdminProductAttributeForm', { attributeId: item._id })}
    >
      <Text style={[styles.name, { color: theme.colors.text }]}>{pickI18nText(item.name, language)}</Text>
      <Text style={[styles.meta, { color: theme.colors.textMuted }]}>
        {item.options.length} {t('admin.productAttributes.optionsCount')}
      </Text>
    </Pressable>
  );

  return (
    <Screen padded={false}>
      <View style={styles.header}>
        {canWriteProductAttributes ? (
          <Button title={t('admin.productAttributes.add')} onPress={() => navigation.navigate('AdminProductAttributeForm', undefined)} />
        ) : null}
      </View>
      <FlatList
        data={attributes}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshing={attributesQuery.isFetching}
        onRefresh={() => attributesQuery.refetch()}
        ListEmptyComponent={<EmptyState title={t('admin.productAttributes.empty')} />}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'flex-end', padding: spacing.lg, paddingBottom: spacing.sm, gap: spacing.sm },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, flexGrow: 1 },
  row: { borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, padding: spacing.md, marginBottom: spacing.md, gap: 2 },
  name: { ...typography.bodyBold },
  meta: { ...typography.small },
});
