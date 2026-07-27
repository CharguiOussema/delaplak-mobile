import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import { useApp, useTheme } from '../../../hooks';
import { ErrorState, LoadingState, Screen } from '../../../components/ui';
import { categoryService } from '../../../services/CategoryService';
import { queryKeys } from '../../../services/QueryClientManager';
import { pickI18nText } from '../../../utils/format';
import { getErrorMessage } from '../../../utils/errorHandling';
import { spacing, typography } from '../../../theme/theme';
import type { CategoryTreeNode } from '../../../models';

function TreeNode({ node, depth, language }: { node: CategoryTreeNode; depth: number; language: 'en' | 'fr' | 'ar' }) {
  const theme = useTheme();
  return (
    <View>
      <View style={[styles.node, { marginLeft: depth * spacing.lg, borderColor: theme.colors.border }]}>
        <Text style={[styles.nodeText, { color: theme.colors.text }]}>
          {depth > 0 ? '└ ' : ''}
          {pickI18nText(node.name, language)}
        </Text>
      </View>
      {node.children?.map((child) => (
        <TreeNode key={child._id} node={child} depth={depth + 1} language={language} />
      ))}
    </View>
  );
}

export default function AdminCategoryTreeScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { language } = useApp();

  const treeQuery = useQuery([queryKeys.CATEGORY_TREE], () => categoryService.getTree());

  if (treeQuery.isLoading) return <LoadingState />;
  if (treeQuery.isError) return <ErrorState message={getErrorMessage(treeQuery.error)} onRetry={() => treeQuery.refetch()} />;

  return (
    <Screen scroll>
      <Text style={[styles.title, { color: theme.colors.text }]}>{t('admin.categories.tree')}</Text>
      {(treeQuery.data ?? []).map((node) => (
        <TreeNode key={node._id} node={node} depth={0} language={language} />
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h1, marginBottom: spacing.lg },
  node: { paddingVertical: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth },
  nodeText: { ...typography.body },
});
