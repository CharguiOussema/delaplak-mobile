import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../hooks';
import { radius, spacing, typography } from '../../theme/theme';

export type BadgeTone = 'primary' | 'success' | 'danger' | 'warning' | 'neutral';

interface BadgeProps {
  label: string;
  tone?: BadgeTone;
}

export const Badge: React.FC<BadgeProps> = ({ label, tone = 'neutral' }) => {
  const theme = useTheme();

  const toneColors: Record<BadgeTone, { bg: string; fg: string }> = {
    primary: { bg: theme.colors.primarySoft, fg: theme.colors.primary },
    success: { bg: theme.colors.successSoft, fg: theme.colors.success },
    danger: { bg: theme.colors.dangerSoft, fg: theme.colors.danger },
    warning: { bg: theme.colors.warningSoft, fg: theme.colors.warning },
    neutral: { bg: theme.colors.surfaceAlt, fg: theme.colors.textMuted },
  };
  const colors = toneColors[tone];

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.text, { color: colors.fg }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
  },
  text: {
    ...typography.tiny,
  },
});
