import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../hooks';
import { radius, spacing, typography } from '../../theme/theme';

export type TrendPoint = { date: string; count: number };

interface TrendBarsProps {
  data: TrendPoint[];
  color: string;
}

const formatDate = (date: string) => date.slice(5);

/** Vertical bar trend — a short (~14-point) daily series read as discrete counts, not a
 * continuous line. One series, one hue: no legend needed, the card title names it. */
export function TrendBars({ data, color }: TrendBarsProps) {
  const theme = useTheme();
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <View>
      <View style={styles.bars}>
        {data.map((point) => (
          <View key={point.date} style={styles.barSlot}>
            <View style={[styles.bar, { height: `${Math.max((point.count / max) * 100, 3)}%`, backgroundColor: color }]} />
          </View>
        ))}
      </View>
      <View style={[styles.baseline, { backgroundColor: theme.colors.border }]} />
      <View style={styles.labels}>
        <Text style={[styles.labelText, { color: theme.colors.textMuted }]}>{formatDate(data[0]?.date ?? '')}</Text>
        <Text style={[styles.labelText, { color: theme.colors.textMuted }]}>{formatDate(data[data.length - 1]?.date ?? '')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bars: { flexDirection: 'row', alignItems: 'flex-end', height: 110, gap: 3 },
  barSlot: { flex: 1, height: '100%', justifyContent: 'flex-end' },
  bar: { width: '100%', borderTopLeftRadius: radius.sm, borderTopRightRadius: radius.sm },
  baseline: { height: StyleSheet.hairlineWidth, marginTop: spacing.xs },
  labels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs },
  labelText: { ...typography.tiny },
});
