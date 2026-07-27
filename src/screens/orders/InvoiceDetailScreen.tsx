import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import { useTheme } from '../../hooks';
import { Button, ErrorState, LoadingState, Screen } from '../../components/ui';
import { invoiceService } from '../../services/InvoiceService';
import { queryKeys } from '../../services/QueryClientManager';
import { formatCurrency, formatDate } from '../../utils/format';
import { getErrorMessage } from '../../utils/errorHandling';
import { spacing, typography } from '../../theme/theme';
import type { RootStackScreenProps } from '../../navigation/types';

export default function InvoiceDetailScreen({ route }: RootStackScreenProps<'InvoiceDetail'>) {
  const { invoiceId } = route.params;
  const { t } = useTranslation();
  const theme = useTheme();
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [localUri, setLocalUri] = useState<string | null>(null);

  const invoiceQuery = useQuery([queryKeys.INVOICE, invoiceId], () => invoiceService.getById(invoiceId));

  const handleDownload = async () => {
    if (!invoiceQuery.data) return;
    setDownloading(true);
    setDownloadError(null);
    try {
      const fileName = `${invoiceQuery.data.number}.pdf`;
      const uri = localUri ?? (await invoiceService.downloadPdf(invoiceId, fileName));
      setLocalUri(uri);
      await invoiceService.sharePdf(uri);
    } catch (err) {
      setDownloadError(getErrorMessage(err, t('invoice.downloadError')));
    } finally {
      setDownloading(false);
    }
  };

  if (invoiceQuery.isLoading) return <LoadingState />;
  if (invoiceQuery.isError || !invoiceQuery.data) {
    return <ErrorState message={getErrorMessage(invoiceQuery.error, t('invoice.notFound'))} onRetry={() => invoiceQuery.refetch()} />;
  }

  const invoice = invoiceQuery.data;

  return (
    <Screen scroll>
      <Text style={[styles.title, { color: theme.colors.text }]}>{t('invoice.title')}</Text>
      <Text style={[styles.number, { color: theme.colors.textMuted }]}>
        {t('invoice.number')}: {invoice.number}
      </Text>
      <Text style={[styles.number, { color: theme.colors.textMuted }]}>
        {t('invoice.issuedAt')}: {formatDate(invoice.issuedAt)}
      </Text>

      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('invoice.lines')}</Text>
      <FlatList
        data={invoice.lines}
        keyExtractor={(_, index) => String(index)}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <View style={styles.lineRow}>
            <Text style={[styles.lineDescription, { color: theme.colors.text }]} numberOfLines={2}>
              {item.quantity} × {item.description}
            </Text>
            <Text style={[styles.lineTotal, { color: theme.colors.text }]}>{formatCurrency(item.lineTotal)}</Text>
          </View>
        )}
      />

      <View style={styles.summaryRow}>
        <Text style={{ color: theme.colors.textMuted }}>{t('invoice.subtotal')}</Text>
        <Text style={{ color: theme.colors.text }}>{formatCurrency(invoice.subtotal)}</Text>
      </View>
      <View style={styles.summaryRow}>
        <Text style={[styles.totalLabel, { color: theme.colors.text }]}>{t('invoice.total')}</Text>
        <Text style={[styles.totalValue, { color: theme.colors.text }]}>{formatCurrency(invoice.total)}</Text>
      </View>

      {downloadError ? <Text style={[styles.error, { color: theme.colors.danger }]}>{downloadError}</Text> : null}

      <Button
        title={downloading ? t('invoice.downloading') : t('invoice.sharePdf')}
        onPress={handleDownload}
        loading={downloading}
        fullWidth
        style={styles.downloadButton}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h1, marginBottom: spacing.sm },
  number: { ...typography.small, marginBottom: 2 },
  sectionTitle: { ...typography.h3, marginTop: spacing.lg, marginBottom: spacing.sm },
  lineRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs },
  lineDescription: { ...typography.body, flex: 1, marginRight: spacing.sm },
  lineTotal: { ...typography.bodyBold },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs },
  totalLabel: { ...typography.h3 },
  totalValue: { ...typography.h3 },
  error: { ...typography.small, marginTop: spacing.md, textAlign: 'center' },
  downloadButton: { marginTop: spacing.xl },
});
