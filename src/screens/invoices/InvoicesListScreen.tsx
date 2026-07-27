import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import { useTheme } from '../../hooks';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui';
import { invoiceService } from '../../services/InvoiceService';
import { queryKeys } from '../../services/QueryClientManager';
import { formatCurrency, formatDate } from '../../utils/format';
import { getErrorMessage } from '../../utils/errorHandling';
import { spacing, radius, typography } from '../../theme/theme';
import type { Invoice } from '../../models';
import type { RootStackScreenProps } from '../../navigation/types';

export default function InvoicesListScreen({ navigation }: RootStackScreenProps<'InvoicesList'>) {
  const { t } = useTranslation();
  const theme = useTheme();

  const invoicesQuery = useQuery([queryKeys.INVOICES], () => invoiceService.getAll({ limit: 30 }));

  if (invoicesQuery.isLoading) return <LoadingState />;
  if (invoicesQuery.isError) {
    return <ErrorState message={getErrorMessage(invoicesQuery.error)} onRetry={() => invoicesQuery.refetch()} />;
  }

  const invoices = invoicesQuery.data?.docs ?? [];

  const renderItem = ({ item }: { item: Invoice }) => (
    <Pressable
      style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
      onPress={() => navigation.navigate('InvoiceDetail', { invoiceId: item._id })}
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.number, { color: theme.colors.text }]}>{item.number}</Text>
        <Text style={[styles.total, { color: theme.colors.text }]}>{formatCurrency(item.total)}</Text>
      </View>
      <Text style={[styles.date, { color: theme.colors.textMuted }]}>{formatDate(item.issuedAt)}</Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <Text style={[styles.title, { color: theme.colors.text }]}>{t('invoices.title')}</Text>
      <FlatList
        data={invoices}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshing={invoicesQuery.isFetching}
        onRefresh={() => invoicesQuery.refetch()}
        ListEmptyComponent={<EmptyState title={t('invoices.empty')} message={t('invoices.emptyMessage')} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  title: { ...typography.h1, paddingHorizontal: spacing.lg, paddingTop: spacing.md, marginBottom: spacing.md },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, flexGrow: 1 },
  card: { borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, padding: spacing.md, marginBottom: spacing.md },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  number: { ...typography.bodyBold },
  date: { ...typography.small, marginTop: 4 },
  total: { ...typography.bodyBold },
});
