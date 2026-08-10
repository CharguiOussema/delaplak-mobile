import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../hooks';
import { radius, spacing, typography } from '../../theme/theme';

export type BarListItem = {
  key: string;
  label: string;
  value: number;
  color: string;
};

interface BarListProps {
  items: BarListItem[];
  emptyLabel?: string;
}

/** Horizontal bar list — the right form for "compare a handful of named categories"
 * (order status, products by category, users by role): identity (the label) and
 * magnitude (the bar) both read directly, no axis needed. Touch has no hover, so the
 * value is always shown as a direct label instead of a tap tooltip. */
export function BarList({ items, emptyLabel }: BarListProps) {
  const theme = useTheme();

  if (items.length === 0) {
    return <Text style={[styles.empty, { color: theme.colors.textMuted }]}>{emptyLabel}</Text>;
  }

  const max = Math.max(...items.map((i) => i.value), 1);

  return (
    <View style={styles.list}>
      {items.map((item) => (
        <View key={item.key} style={styles.row}>
          <Text style={[styles.label, { color: theme.colors.text }]} numberOfLines={1}>
            {item.label}
          </Text>
          <View style={[styles.track, { backgroundColor: theme.colors.surfaceAlt }]}>
            <View style={[styles.fill, { width: `${(item.value / max) * 100}%`, backgroundColor: item.color }]} />
          </View>
          <Text style={[styles.value, { color: theme.colors.text }]}>{item.value}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  label: { ...typography.small, width: 88 },
  track: { flex: 1, height: 10, borderRadius: radius.full, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.full },
  value: { ...typography.small, fontWeight: '600', width: 32, textAlign: 'right' },
  empty: { ...typography.small, textAlign: 'center', paddingVertical: spacing.lg },
});
