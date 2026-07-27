import React from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useApp, useTheme } from '../hooks';
import { Button } from './ui/Button';
import { spacing, typography } from '../theme/theme';

/**
 * I18nManager.forceRTL() (triggered from AppContext.setLanguage when switching to/from Arabic)
 * only takes effect after a full JS reload — a known React Native platform limitation. This
 * modal surfaces that requirement to the user instead of silently leaving the UI half-mirrored.
 */
export const RestartPromptModal: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { restartPromptVisible, confirmRestart, dismissRestartPrompt } = useApp();

  return (
    <Modal visible={restartPromptVisible} transparent animationType="fade" onRequestClose={dismissRestartPrompt}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.title, { color: theme.colors.text }]}>{t('language.restartTitle')}</Text>
          <Text style={[styles.message, { color: theme.colors.textMuted }]}>{t('language.restartMessage')}</Text>
          <View style={styles.actions}>
            <Button title={t('common.later')} variant="ghost" onPress={dismissRestartPrompt} style={styles.actionButton} />
            <Button title={t('common.restartNow')} onPress={confirmRestart} style={styles.actionButton} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  card: {
    width: '100%',
    borderRadius: 16,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  title: { ...typography.h3 },
  message: { ...typography.body },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionButton: { flexShrink: 0 },
});
