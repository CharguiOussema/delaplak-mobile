import React from 'react';
import { FlatList, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import { useApp, useAuth, useTheme } from '../../hooks';
import { Button, Card, LoadingState, Screen } from '../../components/ui';
import { spacing, radius, typography } from '../../theme/theme';
import { siteSettingsService } from '../../services/SiteSettingsService';
import { queryKeys } from '../../services/QueryClientManager';
import { pickI18nText } from '../../utils/format';
import { heroImageFallback } from '../../content/home';
import type { DecorItem } from '../../models';
import type { MainTabScreenProps } from '../../navigation/types';

export default function HomeScreen({ navigation }: MainTabScreenProps<'HomeTab'>) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { language } = useApp();
  const { isAuthenticated } = useAuth();

  const settingsQuery = useQuery([queryKeys.SITE_SETTINGS], () => siteSettingsService.get());

  const goToCatalog = () => navigation.navigate('CatalogTab');

  if (settingsQuery.isLoading || !settingsQuery.data) {
    return <LoadingState />;
  }

  const settings = settingsQuery.data;
  const heroSource = settings.hero.mainImage ? { uri: siteSettingsService.resolveImageUrl(settings.hero.mainImage) } : heroImageFallback;

  const renderDecor = ({ item }: { item: DecorItem }) => (
    <Pressable onPress={goToCatalog} style={styles.decorCard}>
      {item.image ? (
        <Image source={{ uri: siteSettingsService.resolveImageUrl(item.image) }} style={styles.decorImage} contentFit="cover" />
      ) : (
        <View style={[styles.decorImage, { backgroundColor: theme.colors.surfaceAlt }]} />
      )}
      <View style={styles.decorOverlay} />
      <Text style={styles.decorTitle}>{pickI18nText(item.title, language)}</Text>
    </Pressable>
  );

  return (
    <Screen scroll padded={false}>
      <ImageBackground source={heroSource} style={styles.hero} imageStyle={styles.heroImage}>
        <View style={styles.heroOverlay} />
        <Image source={require('../../../assets/logo-mark.png')} style={styles.heroLogo} contentFit="contain" />
        <Text style={styles.heroEyebrow}>{pickI18nText(settings.hero.eyebrow, language)}</Text>
        <Text style={styles.heroTitle}>
          {pickI18nText(settings.hero.titleLine1, language)} {pickI18nText(settings.hero.titleAccent, language)}
        </Text>
        <Button title={pickI18nText(settings.hero.ctaPrimaryLabel, language)} onPress={goToCatalog} style={styles.heroButton} />
      </ImageBackground>

      {!isAuthenticated ? (
        <View style={styles.section}>
          <Card style={styles.guestCard}>
            <Text style={[styles.guestTitle, { color: theme.colors.text }]}>{t('auth.required.title')}</Text>
            <Text style={[styles.guestMessage, { color: theme.colors.textMuted }]}>{t('auth.required.message')}</Text>
            <View style={styles.guestActions}>
              <Button title={t('auth.login.submit')} onPress={() => navigation.navigate('Login')} style={styles.guestButton} />
              <Button
                title={t('auth.signup.title')}
                variant="outline"
                onPress={() => navigation.navigate('Signup')}
                style={styles.guestButton}
              />
            </View>
          </Card>
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{pickI18nText(settings.strengthsSection.title, language)}</Text>
        <View style={styles.strengthList}>
          {settings.strengths.map((item) => (
            <Card key={item._id} style={styles.strengthCard}>
              <View style={[styles.dot, { backgroundColor: theme.colors.primary }]} />
              <Text style={[styles.strengthText, { color: theme.colors.text }]}>{pickI18nText(item.text, language)}</Text>
            </Card>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{pickI18nText(settings.decorsSection.title, language)}</Text>
        <FlatList
          data={settings.decors}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item._id}
          renderItem={renderDecor}
          contentContainerStyle={styles.decorList}
        />
      </View>

      <View style={[styles.cta, { backgroundColor: theme.colors.primary }]}>
        <Text style={styles.ctaTitle}>{pickI18nText(settings.cta.title, language)}</Text>
        <Button title={pickI18nText(settings.cta.actionLabel, language)} onPress={goToCatalog} variant="secondary" style={styles.ctaButton} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  guestCard: { gap: spacing.sm },
  guestTitle: { ...typography.h3 },
  guestMessage: { ...typography.body },
  guestActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  guestButton: { flex: 1 },

  hero: {
    height: 320,
    justifyContent: 'flex-end',
    padding: spacing.lg,
  },
  heroImage: { resizeMode: 'cover' },
  heroOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(28, 26, 23, 0.45)',
  },
  heroLogo: { width: 48, height: 48, marginBottom: spacing.sm },
  heroEyebrow: { ...typography.tiny, color: '#DBB164', textTransform: 'uppercase', letterSpacing: 2 },
  heroTitle: { ...typography.h1, color: '#FFFFFF', marginTop: spacing.xs, marginBottom: spacing.md },
  heroButton: { alignSelf: 'flex-start' },

  section: { paddingHorizontal: spacing.lg, marginTop: spacing.xl },
  sectionTitle: { ...typography.h2, marginBottom: spacing.md },

  strengthList: { gap: spacing.sm },
  strengthCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dot: { width: 8, height: 8, borderRadius: radius.full },
  strengthText: { ...typography.body, flex: 1 },

  decorList: { gap: spacing.md, paddingRight: spacing.lg },
  decorCard: {
    width: 140,
    height: 180,
    borderRadius: radius.sm,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  decorImage: { ...StyleSheet.absoluteFill },
  decorOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(28, 26, 23, 0.35)',
  },
  decorTitle: { ...typography.bodyBold, color: '#FFFFFF', padding: spacing.sm },

  cta: { margin: spacing.lg, marginTop: spacing.xl, padding: spacing.lg, borderRadius: radius.md, gap: spacing.md },
  ctaTitle: { ...typography.h3, color: '#FFFFFF' },
  ctaButton: { alignSelf: 'flex-start' },
});
