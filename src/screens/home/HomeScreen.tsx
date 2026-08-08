import React from 'react';
import { FlatList, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { useAuth, useTheme } from '../../hooks';
import { Button, Card, Screen } from '../../components/ui';
import { spacing, radius, typography } from '../../theme/theme';
import { decors, heroImage, strengthKeys, type Decor } from '../../content/home';
import type { MainTabScreenProps } from '../../navigation/types';

export default function HomeScreen({ navigation }: MainTabScreenProps<'HomeTab'>) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { isAuthenticated } = useAuth();

  const goToCatalog = () => navigation.navigate('CatalogTab');

  const renderDecor = ({ item }: { item: Decor }) => (
    <Pressable onPress={goToCatalog} style={styles.decorCard}>
      <Image source={item.image} style={styles.decorImage} contentFit="cover" />
      <View style={styles.decorOverlay} />
      <Text style={styles.decorTitle}>{t(item.titleKey)}</Text>
    </Pressable>
  );

  return (
    <Screen scroll padded={false}>
      <ImageBackground source={heroImage} style={styles.hero} imageStyle={styles.heroImage}>
        <View style={styles.heroOverlay} />
        <Image source={require('../../../assets/logo-mark.png')} style={styles.heroLogo} contentFit="contain" />
        <Text style={styles.heroEyebrow}>{t('home.hero.eyebrow')}</Text>
        <Text style={styles.heroTitle}>{t('home.hero.title')}</Text>
        <Button title={t('home.hero.cta')} onPress={goToCatalog} style={styles.heroButton} />
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
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('home.strengths.title')}</Text>
        <View style={styles.strengthList}>
          {strengthKeys.map((key) => (
            <Card key={key} style={styles.strengthCard}>
              <View style={[styles.dot, { backgroundColor: theme.colors.primary }]} />
              <Text style={[styles.strengthText, { color: theme.colors.text }]}>{t(key)}</Text>
            </Card>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('home.decors.title')}</Text>
        <FlatList
          data={decors}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.slug}
          renderItem={renderDecor}
          contentContainerStyle={styles.decorList}
        />
      </View>

      <View style={[styles.cta, { backgroundColor: theme.colors.primary }]}>
        <Text style={styles.ctaTitle}>{t('home.cta.title')}</Text>
        <Button title={t('home.cta.action')} onPress={goToCatalog} variant="secondary" style={styles.ctaButton} />
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
