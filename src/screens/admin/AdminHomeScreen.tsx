import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAccess, useTheme } from '../../hooks';
import { Card, Screen } from '../../components/ui';
import { spacing, typography } from '../../theme/theme';
import type { MainTabScreenProps } from '../../navigation/types';

export default function AdminHomeScreen({ navigation }: MainTabScreenProps<'AdminTab'>) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { canManageUsers } = useAccess();

  const sections = [
    canManageUsers && {
      key: 'users',
      title: t('admin.users'),
      subtitle: t('admin.usersSubtitle'),
      icon: '👥',
      onPress: () => navigation.navigate('AdminUsersList'),
    },
    {
      key: 'categories',
      title: t('admin.categories'),
      subtitle: t('admin.categoriesSubtitle'),
      icon: '🗂️',
      onPress: () => navigation.navigate('AdminCategoriesList'),
    },
    {
      key: 'products',
      title: t('admin.products'),
      subtitle: t('admin.productsSubtitle'),
      icon: '🧱',
      onPress: () => navigation.navigate('AdminProductsList'),
    },
  ].filter(Boolean) as { key: string; title: string; subtitle: string; icon: string; onPress: () => void }[];

  return (
    <Screen scroll>
      <Text style={[styles.title, { color: theme.colors.text }]}>{t('admin.title')}</Text>
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
