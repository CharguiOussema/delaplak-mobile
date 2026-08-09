import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAccess, useTheme } from '../../../hooks';
import { AccessControl } from '../../../components/AccessControl';
import { Card, Screen } from '../../../components/ui';
import { spacing, typography } from '../../../theme/theme';
import type { RootStackScreenProps } from '../../../navigation/types';

export default function AdminSettingsScreen({ navigation }: RootStackScreenProps<'AdminSettings'>) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { canWriteSiteSettings } = useAccess();

  const sections = [
    {
      key: 'home',
      icon: '🏠',
      title: t('admin.settings.homeContent'),
      subtitle: t('admin.settings.homeContentSubtitle'),
      onPress: () => navigation.navigate('AdminHomeContent'),
    },
    {
      key: 'productAttributes',
      icon: '⚙️',
      title: t('admin.productAttributes'),
      subtitle: t('admin.productAttributesSubtitle'),
      onPress: () => navigation.navigate('AdminProductAttributesList'),
    },
  ];

  return (
    <AccessControl allowed={canWriteSiteSettings}>
      <Screen scroll>
        <Text style={[styles.title, { color: theme.colors.text }]}>{t('admin.settings.title')}</Text>
        <View style={styles.list}>
          {sections.map((section) => (
            <Pressable key={section.key} onPress={section.onPress}>
              <Card style={styles.card}>
                <Text style={styles.icon}>{section.icon}</Text>
                <View style={styles.cardBody}>
                  <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{section.title}</Text>
                  <Text style={[styles.cardSubtitle, { color: theme.colors.textMuted }]}>{section.subtitle}</Text>
                </View>
              </Card>
            </Pressable>
          ))}
        </View>
      </Screen>
    </AccessControl>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h1, marginBottom: spacing.lg },
  list: { gap: spacing.md },
  card: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  icon: { fontSize: 28 },
  cardBody: { flex: 1 },
  cardTitle: { ...typography.h3 },
  cardSubtitle: { ...typography.small, marginTop: 2 },
});
