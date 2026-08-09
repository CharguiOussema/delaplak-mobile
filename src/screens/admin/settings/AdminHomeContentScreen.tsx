import React, { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import * as ImagePicker from 'expo-image-picker';
import { useAccess, useApp, useTheme } from '../../../hooks';
import { AccessControl } from '../../../components/AccessControl';
import { Button, ErrorState, Input, LoadingState, Screen } from '../../../components/ui';
import { siteSettingsService } from '../../../services/SiteSettingsService';
import { queryKeys } from '../../../services/QueryClientManager';
import { getErrorMessage } from '../../../utils/errorHandling';
import { pickI18nText } from '../../../utils/format';
import { spacing, radius, typography } from '../../../theme/theme';
import type { DecorItem, I18nText, SiteSettings, StrengthItem } from '../../../models';

const EMPTY_I18N: I18nText = { en: '', fr: '', ar: '' };

/** Three stacked language inputs for one i18n text field — the mobile equivalent of the
 * web app's I18nFieldGroup, but plain stacked inputs (this codebase's admin-form convention)
 * instead of tabs. */
function I18nInputGroup({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string;
  value: I18nText;
  onChange: (value: I18nText) => void;
  multiline?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldGroupLabel}>{label}</Text>
      <Input
        label={`${t('admin.settings.langEn')}`}
        value={value.en}
        onChangeText={(en) => onChange({ ...value, en })}
        multiline={multiline}
      />
      <Input
        label={`${t('admin.settings.langFr')}`}
        value={value.fr}
        onChangeText={(fr) => onChange({ ...value, fr })}
        multiline={multiline}
      />
      <Input
        label={`${t('admin.settings.langAr')}`}
        value={value.ar}
        onChangeText={(ar) => onChange({ ...value, ar })}
        multiline={multiline}
      />
    </View>
  );
}

export default function AdminHomeContentScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { language } = useApp();
  const { canWriteSiteSettings } = useAccess();
  const queryClient = useQueryClient();

  const settingsQuery = useQuery([queryKeys.SITE_SETTINGS], () => siteSettingsService.get());

  const [hero, setHero] = useState({
    eyebrow: EMPTY_I18N,
    titleLine1: EMPTY_I18N,
    titleAccent: EMPTY_I18N,
    intro: EMPTY_I18N,
    ctaPrimaryLabel: EMPTY_I18N,
    ctaSecondaryLabel: EMPTY_I18N,
  });
  const [strengthsSection, setStrengthsSection] = useState({ eyebrow: EMPTY_I18N, title: EMPTY_I18N });
  const [decorsSection, setDecorsSection] = useState({ eyebrow: EMPTY_I18N, title: EMPTY_I18N, discoverLabel: EMPTY_I18N });
  const [cta, setCta] = useState({ title: EMPTY_I18N, actionLabel: EMPTY_I18N });

  const [strengthModal, setStrengthModal] = useState<{ item: StrengthItem | null } | null>(null);
  const [strengthDraft, setStrengthDraft] = useState<I18nText>(EMPTY_I18N);
  const [decorModal, setDecorModal] = useState<{ item: DecorItem | null } | null>(null);
  const [decorDraft, setDecorDraft] = useState<I18nText>(EMPTY_I18N);

  useEffect(() => {
    if (settingsQuery.data) {
      const s = settingsQuery.data;
      setHero({
        eyebrow: s.hero.eyebrow,
        titleLine1: s.hero.titleLine1,
        titleAccent: s.hero.titleAccent,
        intro: s.hero.intro,
        ctaPrimaryLabel: s.hero.ctaPrimaryLabel,
        ctaSecondaryLabel: s.hero.ctaSecondaryLabel,
      });
      setStrengthsSection(s.strengthsSection);
      setDecorsSection(s.decorsSection);
      setCta(s.cta);
    }
  }, [settingsQuery.data]);

  const setSettings = (updated: SiteSettings) => queryClient.setQueryData([queryKeys.SITE_SETTINGS], updated);

  const saveText = useMutation(() => siteSettingsService.update({ hero, strengthsSection, decorsSection, cta }), {
    onSuccess: (updated) => { setSettings(updated); },
  });

  const uploadHeroMain = useMutation((image: ImagePicker.ImagePickerAsset) =>
    siteSettingsService.setHeroMainImage({ uri: image.uri, name: image.fileName ?? 'hero-main.jpg', type: image.mimeType ?? 'image/jpeg' }),
  );
  const uploadHeroAccent = useMutation((image: ImagePicker.ImagePickerAsset) =>
    siteSettingsService.setHeroAccentImage({ uri: image.uri, name: image.fileName ?? 'hero-accent.jpg', type: image.mimeType ?? 'image/jpeg' }),
  );

  const addStrength = useMutation((text: I18nText) => siteSettingsService.addStrength(text));
  const updateStrength = useMutation(({ id, text }: { id: string; text: I18nText }) => siteSettingsService.updateStrength(id, text));
  const removeStrength = useMutation((id: string) => siteSettingsService.removeStrength(id));

  const addDecor = useMutation((title: I18nText) => siteSettingsService.addDecor(title));
  const updateDecor = useMutation(({ id, title }: { id: string; title: I18nText }) => siteSettingsService.updateDecor(id, title));
  const removeDecor = useMutation((id: string) => siteSettingsService.removeDecor(id));
  const uploadDecorImage = useMutation(({ id, image }: { id: string; image: ImagePicker.ImagePickerAsset }) =>
    siteSettingsService.setDecorImage(id, { uri: image.uri, name: image.fileName ?? 'decor.jpg', type: image.mimeType ?? 'image/jpeg' }),
  );

  const pickImage = async (): Promise<ImagePicker.ImagePickerAsset | null> => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return null;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    return result.canceled ? null : result.assets[0];
  };

  const handleUploadHeroMain = async () => {
    const image = await pickImage();
    if (!image) return;
    uploadHeroMain.mutate(image, { onSuccess: (updated) => { setSettings(updated); }, onError: (err) => Alert.alert(t('common.error'), getErrorMessage(err)) });
  };
  const handleUploadHeroAccent = async () => {
    const image = await pickImage();
    if (!image) return;
    uploadHeroAccent.mutate(image, { onSuccess: (updated) => { setSettings(updated); }, onError: (err) => Alert.alert(t('common.error'), getErrorMessage(err)) });
  };
  const handleUploadDecorImage = async (id: string) => {
    const image = await pickImage();
    if (!image) return;
    uploadDecorImage.mutate({ id, image }, { onSuccess: (updated) => { setSettings(updated); }, onError: (err) => Alert.alert(t('common.error'), getErrorMessage(err)) });
  };

  const openAddStrength = () => {
    setStrengthDraft(EMPTY_I18N);
    setStrengthModal({ item: null });
  };
  const openEditStrength = (item: StrengthItem) => {
    setStrengthDraft(item.text);
    setStrengthModal({ item });
  };
  const submitStrengthModal = () => {
    if (strengthModal?.item) {
      updateStrength.mutate(
        { id: strengthModal.item._id, text: strengthDraft },
        { onSuccess: (updated) => { setSettings(updated); setStrengthModal(null); }, onError: (err) => Alert.alert(t('common.error'), getErrorMessage(err)) },
      );
    } else {
      addStrength.mutate(strengthDraft, {
        onSuccess: (updated) => { setSettings(updated); setStrengthModal(null); },
        onError: (err) => Alert.alert(t('common.error'), getErrorMessage(err)),
      });
    }
  };
  const confirmRemoveStrength = (item: StrengthItem) => {
    Alert.alert(t('admin.settings.deleteStrengthConfirm'), '', [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () => removeStrength.mutate(item._id, { onSuccess: (updated) => { setSettings(updated); } }),
      },
    ]);
  };

  const openAddDecor = () => {
    setDecorDraft(EMPTY_I18N);
    setDecorModal({ item: null });
  };
  const openEditDecor = (item: DecorItem) => {
    setDecorDraft(item.title);
    setDecorModal({ item });
  };
  const submitDecorModal = () => {
    if (decorModal?.item) {
      updateDecor.mutate(
        { id: decorModal.item._id, title: decorDraft },
        { onSuccess: (updated) => { setSettings(updated); setDecorModal(null); }, onError: (err) => Alert.alert(t('common.error'), getErrorMessage(err)) },
      );
    } else {
      addDecor.mutate(decorDraft, {
        onSuccess: (updated) => { setSettings(updated); setDecorModal(null); },
        onError: (err) => Alert.alert(t('common.error'), getErrorMessage(err)),
      });
    }
  };
  const confirmRemoveDecor = (item: DecorItem) => {
    Alert.alert(t('admin.settings.deleteDecorConfirm'), '', [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () => removeDecor.mutate(item._id, { onSuccess: (updated) => { setSettings(updated); } }),
      },
    ]);
  };

  if (settingsQuery.isLoading) return <LoadingState />;
  if (settingsQuery.isError) {
    return <ErrorState message={getErrorMessage(settingsQuery.error)} onRetry={() => settingsQuery.refetch()} />;
  }
  const settings = settingsQuery.data as SiteSettings;

  return (
    <AccessControl allowed={canWriteSiteSettings}>
      <Screen scroll>
        <Text style={[styles.title, { color: theme.colors.text }]}>{t('admin.settings.homeContent')}</Text>

        <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>{t('admin.settings.heroSection')}</Text>
        <I18nInputGroup label={t('admin.settings.heroEyebrow')} value={hero.eyebrow} onChange={(v) => setHero((h) => ({ ...h, eyebrow: v }))} />
        <I18nInputGroup
          label={t('admin.settings.heroTitleLine1')}
          value={hero.titleLine1}
          onChange={(v) => setHero((h) => ({ ...h, titleLine1: v }))}
        />
        <I18nInputGroup
          label={t('admin.settings.heroTitleAccent')}
          value={hero.titleAccent}
          onChange={(v) => setHero((h) => ({ ...h, titleAccent: v }))}
        />
        <I18nInputGroup label={t('admin.settings.heroIntro')} value={hero.intro} onChange={(v) => setHero((h) => ({ ...h, intro: v }))} multiline />
        <I18nInputGroup
          label={t('admin.settings.heroCtaPrimary')}
          value={hero.ctaPrimaryLabel}
          onChange={(v) => setHero((h) => ({ ...h, ctaPrimaryLabel: v }))}
        />
        <I18nInputGroup
          label={t('admin.settings.heroCtaSecondary')}
          value={hero.ctaSecondaryLabel}
          onChange={(v) => setHero((h) => ({ ...h, ctaSecondaryLabel: v }))}
        />

        <View style={styles.imageRow}>
          <View style={styles.imageCol}>
            <Text style={styles.fieldGroupLabel}>{t('admin.settings.heroMainImage')}</Text>
            {settings.hero.mainImage ? (
              <Image source={{ uri: siteSettingsService.resolveImageUrl(settings.hero.mainImage) }} style={styles.imagePreview} />
            ) : null}
            <Button title={t('admin.settings.uploadImage')} variant="outline" onPress={handleUploadHeroMain} loading={uploadHeroMain.isLoading} />
          </View>
          <View style={styles.imageCol}>
            <Text style={styles.fieldGroupLabel}>{t('admin.settings.heroAccentImage')}</Text>
            {settings.hero.accentImage ? (
              <Image source={{ uri: siteSettingsService.resolveImageUrl(settings.hero.accentImage) }} style={styles.imagePreview} />
            ) : null}
            <Button title={t('admin.settings.uploadImage')} variant="outline" onPress={handleUploadHeroAccent} loading={uploadHeroAccent.isLoading} />
          </View>
        </View>

        <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>{t('admin.settings.strengthsSection')}</Text>
        <I18nInputGroup
          label={t('admin.settings.strengthsEyebrow')}
          value={strengthsSection.eyebrow}
          onChange={(v) => setStrengthsSection((s) => ({ ...s, eyebrow: v }))}
        />
        <I18nInputGroup
          label={t('admin.settings.strengthsTitle')}
          value={strengthsSection.title}
          onChange={(v) => setStrengthsSection((s) => ({ ...s, title: v }))}
        />

        <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>{t('admin.settings.decorsSection')}</Text>
        <I18nInputGroup
          label={t('admin.settings.decorsEyebrow')}
          value={decorsSection.eyebrow}
          onChange={(v) => setDecorsSection((s) => ({ ...s, eyebrow: v }))}
        />
        <I18nInputGroup
          label={t('admin.settings.decorsTitle')}
          value={decorsSection.title}
          onChange={(v) => setDecorsSection((s) => ({ ...s, title: v }))}
        />
        <I18nInputGroup
          label={t('admin.settings.decorsDiscoverLabel')}
          value={decorsSection.discoverLabel}
          onChange={(v) => setDecorsSection((s) => ({ ...s, discoverLabel: v }))}
        />

        <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>{t('admin.settings.ctaSection')}</Text>
        <I18nInputGroup label={t('admin.settings.ctaTitle')} value={cta.title} onChange={(v) => setCta((c) => ({ ...c, title: v }))} />
        <I18nInputGroup
          label={t('admin.settings.ctaActionLabel')}
          value={cta.actionLabel}
          onChange={(v) => setCta((c) => ({ ...c, actionLabel: v }))}
        />

        <Button title={t('admin.settings.saveSection')} onPress={() => saveText.mutate()} loading={saveText.isLoading} fullWidth style={styles.saveButton} />
        {saveText.isError ? <Text style={[styles.error, { color: theme.colors.danger }]}>{getErrorMessage(saveText.error)}</Text> : null}

        <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>{t('admin.settings.strengthsItems')}</Text>
        {settings.strengths.map((item) => (
          <View key={item._id} style={[styles.itemRow, { borderColor: theme.colors.border }]}>
            <Text style={[styles.itemText, { color: theme.colors.text }]} numberOfLines={2}>
              {pickI18nText(item.text, language)}
            </Text>
            <Pressable onPress={() => openEditStrength(item)}>
              <Text style={{ color: theme.colors.primary }}>{t('common.edit')}</Text>
            </Pressable>
            <Pressable onPress={() => confirmRemoveStrength(item)}>
              <Text style={{ color: theme.colors.danger }}>{t('common.delete')}</Text>
            </Pressable>
          </View>
        ))}
        <Button title={t('admin.settings.addStrength')} variant="outline" onPress={openAddStrength} style={styles.addButton} />

        <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>{t('admin.settings.decorsItems')}</Text>
        {settings.decors.map((item) => (
          <View key={item._id} style={[styles.decorItemRow, { borderColor: theme.colors.border }]}>
            {item.image ? (
              <Image source={{ uri: siteSettingsService.resolveImageUrl(item.image) }} style={styles.decorItemImage} />
            ) : (
              <View style={[styles.decorItemImage, { backgroundColor: theme.colors.surfaceAlt }]} />
            )}
            <View style={styles.decorItemBody}>
              <Text style={[styles.itemText, { color: theme.colors.text }]} numberOfLines={1}>
                {pickI18nText(item.title, language)}
              </Text>
              <View style={styles.decorItemActions}>
                <Pressable onPress={() => openEditDecor(item)}>
                  <Text style={{ color: theme.colors.primary }}>{t('common.edit')}</Text>
                </Pressable>
                <Pressable onPress={() => handleUploadDecorImage(item._id)}>
                  <Text style={{ color: theme.colors.primary }}>{t('admin.settings.uploadImage')}</Text>
                </Pressable>
                <Pressable onPress={() => confirmRemoveDecor(item)}>
                  <Text style={{ color: theme.colors.danger }}>{t('common.delete')}</Text>
                </Pressable>
              </View>
            </View>
          </View>
        ))}
        <Button title={t('admin.settings.addDecor')} variant="outline" onPress={openAddDecor} style={styles.addButton} />
      </Screen>

      <Modal visible={!!strengthModal} transparent animationType="fade" onRequestClose={() => setStrengthModal(null)}>
        <View style={styles.overlay}>
          <ScrollView contentContainerStyle={[styles.modalCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.title, { color: theme.colors.text, fontSize: 18 }]}>
              {strengthModal?.item ? t('admin.settings.editStrength') : t('admin.settings.addStrength')}
            </Text>
            <I18nInputGroup label={t('admin.settings.strengthText')} value={strengthDraft} onChange={setStrengthDraft} />
            <View style={styles.modalActions}>
              <Button title={t('common.cancel')} variant='ghost' onPress={() => setStrengthModal(null)} style={styles.modalActionButton} />
              <Button
                title={t('common.save')}
                onPress={submitStrengthModal}
                loading={addStrength.isLoading || updateStrength.isLoading}
                style={styles.modalActionButton}
              />
            </View>
          </ScrollView>
        </View>
      </Modal>

      <Modal visible={!!decorModal} transparent animationType="fade" onRequestClose={() => setDecorModal(null)}>
        <View style={styles.overlay}>
          <ScrollView contentContainerStyle={[styles.modalCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.title, { color: theme.colors.text, fontSize: 18 }]}>
              {decorModal?.item ? t('admin.settings.editDecor') : t('admin.settings.addDecor')}
            </Text>
            <I18nInputGroup label={t('admin.settings.decorTitle')} value={decorDraft} onChange={setDecorDraft} />
            <View style={styles.modalActions}>
              <Button title={t('common.cancel')} variant='ghost' onPress={() => setDecorModal(null)} style={styles.modalActionButton} />
              <Button
                title={t('common.save')}
                onPress={submitDecorModal}
                loading={addDecor.isLoading || updateDecor.isLoading}
                style={styles.modalActionButton}
              />
            </View>
          </ScrollView>
        </View>
      </Modal>
    </AccessControl>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h1, marginBottom: spacing.lg },
  sectionHeading: { ...typography.h3, marginTop: spacing.lg, marginBottom: spacing.sm },
  fieldGroup: { marginBottom: spacing.sm },
  fieldGroupLabel: { ...typography.small, fontWeight: '600', marginBottom: spacing.xs },
  imageRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  imageCol: { flex: 1, gap: spacing.xs },
  imagePreview: { width: '100%', aspectRatio: 16 / 9, borderRadius: radius.md, marginBottom: spacing.xs },
  saveButton: { marginTop: spacing.md },
  error: { ...typography.small, marginTop: spacing.sm },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  itemText: { ...typography.body, flex: 1 },
  addButton: { marginBottom: spacing.md },
  decorItemRow: {
    flexDirection: 'row',
    gap: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  decorItemImage: { width: 64, height: 64, borderRadius: radius.md },
  decorItemBody: { flex: 1, gap: spacing.xs, justifyContent: 'center' },
  decorItemActions: { flexDirection: 'row', gap: spacing.md },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  modalCard: { width: '100%', borderRadius: 16, padding: spacing.lg },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm, marginTop: spacing.md },
  modalActionButton: { flexShrink: 0 },
});
