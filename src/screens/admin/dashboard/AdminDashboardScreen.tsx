import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import { useAccess, useApp, useTheme } from '../../../hooks';
import { AccessControl } from '../../../components/AccessControl';
import { Card, ErrorState, LoadingState, Screen } from '../../../components/ui';
import { BarList } from '../../../components/charts/BarList';
import { TrendBars } from '../../../components/charts/TrendBars';
import { CATEGORICAL_CHART_COLORS, SEQUENTIAL_CHART_COLOR, STATUS_CHART_COLORS } from '../../../theme/chartColors';
import { dashboardService } from '../../../services/DashboardService';
import { queryKeys } from '../../../services/QueryClientManager';
import { getErrorMessage } from '../../../utils/errorHandling';
import { formatCurrency, pickI18nText } from '../../../utils/format';
import { spacing, radius, typography } from '../../../theme/theme';
import type { DashboardStats } from '../../../models';

const ORDER_STATUS_COLORS: Record<string, string> = {
  PENDING: STATUS_CHART_COLORS.warning,
  CONFIRMED: STATUS_CHART_COLORS.good,
  CANCELLED: STATUS_CHART_COLORS.critical,
};

export default function AdminDashboardScreen() {
  const { canAccessDashboard } = useAccess();

  const statsQuery = useQuery([queryKeys.DASHBOARD_STATS], () => dashboardService.getStats());

  return (
    <AccessControl allowed={canAccessDashboard}>
      {statsQuery.isLoading ? (
        <LoadingState />
      ) : statsQuery.isError || !statsQuery.data ? (
        <ErrorState message={getErrorMessage(statsQuery.error)} onRetry={() => statsQuery.refetch()} />
      ) : (
        <DashboardContent stats={statsQuery.data} />
      )}
    </AccessControl>
  );
}

function DashboardContent({ stats }: { stats: DashboardStats }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { language } = useApp();
  const kpis = [
    { key: 'products', label: t('admin.dashboard.products'), value: String(stats.products.total) },
    { key: 'stock', label: t('admin.dashboard.totalStock'), value: String(stats.products.totalStock) },
    {
      key: 'lowStock',
      label: t('admin.dashboard.lowStock'),
      value: String(stats.products.lowStockCount),
      color: stats.products.lowStockCount > 0 ? theme.colors.warning : undefined,
    },
    { key: 'categories', label: t('admin.dashboard.categories'), value: String(stats.categories.total) },
    { key: 'orders', label: t('admin.dashboard.orders'), value: String(stats.orders.total) },
    { key: 'revenue', label: t('admin.dashboard.revenue'), value: formatCurrency(stats.orders.totalRevenue, stats.orders.currency) },
    { key: 'users', label: t('admin.dashboard.users'), value: String(stats.users.total) },
    {
      key: 'invoices',
      label: t('admin.dashboard.invoices'),
      value: `${stats.invoices.total} · ${formatCurrency(stats.invoices.totalAmount, stats.invoices.currency)}`,
    },
  ];

  const orderStatusItems = stats.orders.byStatus.map((s) => ({
    key: s.status,
    label: t(`orders.status.${s.status}`),
    value: s.count,
    color: ORDER_STATUS_COLORS[s.status] ?? SEQUENTIAL_CHART_COLOR,
  }));

  const categoryItems = stats.products.byCategory.map((c, i) => ({
    key: c.label,
    label: c.label,
    value: c.value,
    color: CATEGORICAL_CHART_COLORS[i % CATEGORICAL_CHART_COLORS.length],
  }));

  const roleItems = stats.users.byRole.map((r, i) => ({
    key: r.role,
    label: r.role,
    value: r.count,
    color: CATEGORICAL_CHART_COLORS[i % CATEGORICAL_CHART_COLORS.length],
  }));

  return (
    <Screen scroll>
      <Text style={[styles.title, { color: theme.colors.text }]}>{t('admin.dashboard.title')}</Text>

      <View style={styles.kpiGrid}>
        {kpis.map((kpi) => (
          <Card key={kpi.key} style={styles.kpiCard}>
            <Text style={[styles.kpiLabel, { color: theme.colors.textMuted }]}>{kpi.label}</Text>
            <Text style={[styles.kpiValue, { color: kpi.color ?? theme.colors.text }]} numberOfLines={1} adjustsFontSizeToFit>
              {kpi.value}
            </Text>
          </Card>
        ))}
      </View>

      <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>{t('admin.dashboard.ordersTrend')}</Text>
      <Card>
        <TrendBars data={stats.orders.trend} color={SEQUENTIAL_CHART_COLOR} />
      </Card>

      <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>{t('admin.dashboard.ordersByStatus')}</Text>
      <Card>
        <BarList items={orderStatusItems} emptyLabel={t('admin.dashboard.noData')} />
      </Card>

      <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>{t('admin.dashboard.productsByCategory')}</Text>
      <Card>
        <BarList items={categoryItems} emptyLabel={t('admin.dashboard.noData')} />
      </Card>

      <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>{t('admin.dashboard.usersByRole')}</Text>
      <Card>
        <BarList items={roleItems} emptyLabel={t('admin.dashboard.noData')} />
      </Card>

      <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>{t('admin.dashboard.lowStockProducts')}</Text>
      <Card style={styles.lowStockCard}>
        {stats.lowStockProducts.length === 0 ? (
          <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>{t('admin.dashboard.noLowStock')}</Text>
        ) : (
          stats.lowStockProducts.map((product) => (
            <View key={product._id} style={styles.lowStockRow}>
              <Text style={[styles.lowStockName, { color: theme.colors.text }]} numberOfLines={1}>
                {pickI18nText(product.name, language)}
              </Text>
              <Text style={[styles.lowStockValue, { color: theme.colors.danger }]}>{product.stock}</Text>
            </View>
          ))
        )}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h1, marginBottom: spacing.lg },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  kpiCard: { width: '47%', gap: 4 },
  kpiLabel: { ...typography.tiny },
  kpiValue: { ...typography.h3 },
  sectionHeading: { ...typography.h3, marginTop: spacing.md, marginBottom: spacing.sm },
  lowStockCard: { gap: spacing.sm },
  lowStockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  lowStockName: { ...typography.body, flex: 1 },
  lowStockValue: { ...typography.bodyBold },
  emptyText: { ...typography.small, textAlign: 'center', paddingVertical: spacing.md },
});
