import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../../hooks';
import { radius, spacing, typography } from '../../theme/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  style,
  testID,
}) => {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  const backgroundColor = {
    primary: theme.colors.primary,
    secondary: theme.colors.surfaceAlt,
    outline: 'transparent',
    ghost: 'transparent',
    danger: theme.colors.danger,
  }[variant];

  const textColor = {
    primary: theme.colors.primaryText,
    secondary: theme.colors.text,
    outline: theme.colors.primary,
    ghost: theme.colors.primary,
    danger: theme.colors.primaryText,
  }[variant];

  const borderColor = variant === 'outline' ? theme.colors.primary : 'transparent';
  const paddingVertical = { sm: 8, md: 12, lg: 16 }[size];
  const fontSize = { sm: 13, md: 15, lg: 17 }[size];

  const tintedShadow = {
    primary: { boxShadow: '0px 8px 20px rgba(184, 134, 62, 0.35)', elevation: 4 },
    danger: { boxShadow: '0px 8px 20px rgba(239, 68, 68, 0.35)', elevation: 4 },
    secondary: {},
    outline: {},
    ghost: {},
  }[variant];

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor,
          borderColor,
          borderWidth: variant === 'outline' ? 1 : 0,
          paddingVertical,
          opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1,
          width: fullWidth ? '100%' : undefined,
        },
        !isDisabled && tintedShadow,
        style,
      ]}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color={textColor} size="small" />
        ) : (
          <>
            {icon}
            <Text style={[styles.text, { color: textColor, fontSize }]}>{title}</Text>
          </>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  text: {
    fontFamily: typography.bodyBold.fontFamily,
    fontWeight: typography.bodyBold.fontWeight,
  },
});
