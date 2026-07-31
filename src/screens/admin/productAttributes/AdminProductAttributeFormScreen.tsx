import React, { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useApp, useAccess, useTheme } from '../../../hooks';
import { AccessControl } from '../../../components/AccessControl';
import { Button, ErrorState, Input, LoadingState, Screen } from '../../../components/ui';
import { productAttributeService } from '../../../services/ProductAttributeService';
import { queryKeys } from '../../../services/QueryClientManager';
import { getErrorMessage } from '../../../utils/errorHandling';
import { pickI18nText } from '../../../utils/format';
import { spacing, radius, typography } from '../../../theme/theme';
import type { AttributeOption } from '../../../models';
import type { RootStackScreenProps } from '../../../navigation/types';

export default function AdminProductAttributeFormScreen({ route, navigation }: RootStackScreenProps<'AdminProductAttributeForm'>) {
  const attributeId = route.params?.attributeId;
  const isEdit = !!attributeId;
  const { t } = useTranslation();
  const theme = useTheme();
  const { language } = useApp();
  const { canWriteProductAttributes } = useAccess();
  const queryClient = useQueryClient();

  const attributeQuery = useQuery(
    [queryKeys.PRODUCT_ATTRIBUTES, attributeId],
    () => productAttributeService.getById(attributeId as string),
    { enabled: isEdit },
  );

  const [nameEn, setNameEn] = useState('');
  const [nameFr, setNameFr] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [isAddOptionVisible, setAddOptionVisible] = useState(false);
  const [optionNameEn, setOptionNameEn] = useState('');
  const [optionNameFr, setOptionNameFr] = useState('');
  const [optionNameAr, setOptionNameAr] = useState('');
  const [optionError, setOptionError] = useState<string | null>(null);
  const [renamingOption, setRenamingOption] = useState<AttributeOption | null>(null);

  useEffect(() => {
    if (attributeQuery.data) {
      setNameEn(attributeQuery.data.name.en);
      setNameFr(attributeQuery.data.name.fr);
      setNameAr(attributeQuery.data.name.ar);
    }
  }, [attributeQuery.data]);

  const invalidate = () => {
    queryClient.invalidateQueries(queryKeys.PRODUCT_ATTRIBUTES);
    queryClient.invalidateQueries(queryKeys.PRODUCT_ATTRIBUTE_FILTER);
  };

  const saveMutation = useMutation(
    () => {
      const payload = {
        name: {
          en: nameEn.trim() || undefined,
          fr: nameFr.trim() || undefined,
          ar: nameAr.trim() || undefined,
        },
      };
      return isEdit ? productAttributeService.update(attributeId as string, payload) : productAttributeService.create(payload);
    },
    {
      onSuccess: () => {
        invalidate();
        navigation.goBack();
      },
    },
  );

  const deleteMutation = useMutation(() => productAttributeService.remove(attributeId as string), {
    onSuccess: () => {
      invalidate();
      navigation.goBack();
    },
    onError: (deleteError) => {
      Alert.alert(t('common.error'), getErrorMessage(deleteError));
    },
  });

  const addOptionMutation = useMutation(
    () =>
      productAttributeService.addOption(attributeId as string, {
        en: optionNameEn.trim() || undefined,
        fr: optionNameFr.trim() || undefined,
        ar: optionNameAr.trim() || undefined,
      }),
    {
      onSuccess: () => {
        invalidate();
        queryClient.invalidateQueries([queryKeys.PRODUCT_ATTRIBUTES, attributeId]);
        resetOptionForm();
        setAddOptionVisible(false);
      },
      onError: (addError) => setOptionError(getErrorMessage(addError)),
    },
  );

  const renameOptionMutation = useMutation(
    () =>
      productAttributeService.updateOption(attributeId as string, (renamingOption as AttributeOption)._id, {
        en: optionNameEn.trim() || undefined,
        fr: optionNameFr.trim() || undefined,
        ar: optionNameAr.trim() || undefined,
      }),
    {
      onSuccess: () => {
        invalidate();
        queryClient.invalidateQueries([queryKeys.PRODUCT_ATTRIBUTES, attributeId]);
        resetOptionForm();
        setRenamingOption(null);
      },
      onError: (renameError) => setOptionError(getErrorMessage(renameError)),
    },
  );

  const removeOptionMutation = useMutation(
    (optionId: string) => productAttributeService.removeOption(attributeId as string, optionId),
    {
      onSuccess: () => {
        invalidate();
        queryClient.invalidateQueries([queryKeys.PRODUCT_ATTRIBUTES, attributeId]);
      },
      onError: (removeError) => {
        Alert.alert(t('common.error'), getErrorMessage(removeError));
      },
    },
  );

  const resetOptionForm = () => {
    setOptionNameEn('');
    setOptionNameFr('');
    setOptionNameAr('');
    setOptionError(null);
  };

  const handleSave = () => {
    setError(null);
    if (!nameEn.trim() && !nameFr.trim() && !nameAr.trim()) {
      setError(t('admin.productAttributes.nameRequired'));
      return;
    }
    saveMutation.mutate();
  };

  const handleDelete = () => {
    Alert.alert(t('admin.productAttributes.delete'), t('admin.productAttributes.deleteConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: () => deleteMutation.mutate() },
    ]);
  };

  const handleAddOption = () => {
    setOptionError(null);
    if (!optionNameEn.trim() && !optionNameFr.trim() && !optionNameAr.trim()) {
      setOptionError(t('admin.productAttributes.nameRequired'));
      return;
    }
    addOptionMutation.mutate();
  };

  const openRenameOption = (option: AttributeOption) => {
    setOptionNameEn(option.name.en);
    setOptionNameFr(option.name.fr);
    setOptionNameAr(option.name.ar);
    setOptionError(null);
    setRenamingOption(option);
  };

  const handleRenameOption = () => {
    setOptionError(null);
    if (!optionNameEn.trim() && !optionNameFr.trim() && !optionNameAr.trim()) {
      setOptionError(t('admin.productAttributes.nameRequired'));
      return;
    }
    renameOptionMutation.mutate();
  };

  const handleRemoveOption = (option: AttributeOption) => {
    Alert.alert(t('admin.productAttributes.deleteOption'), t('admin.productAttributes.deleteOptionConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: () => removeOptionMutation.mutate(option._id) },
    ]);
  };

  if (isEdit && attributeQuery.isLoading) return <LoadingState />;
  if (isEdit && attributeQuery.isError) {
    return <ErrorState message={getErrorMessage(attributeQuery.error)} onRetry={() => attributeQuery.refetch()} />;
  }

  const options = attributeQuery.data?.options ?? [];

  return (
    <AccessControl allowed={canWriteProductAttributes}>
      <Screen scroll>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {isEdit ? t('admin.productAttributes.edit') : t('admin.productAttributes.add')}
        </Text>

        <Input label={t('admin.productAttributes.nameEn')} value={nameEn} onChangeText={setNameEn} />
        <Input label={t('admin.productAttributes.nameFr')} value={nameFr} onChangeText={setNameFr} />
        <Input label={t('admin.productAttributes.nameAr')} value={nameAr} onChangeText={setNameAr} />

        {error ? <Text style={[styles.error, { color: theme.colors.danger }]}>{error}</Text> : null}
        {saveMutation.isError ? (
          <Text style={[styles.error, { color: theme.colors.danger }]}>{getErrorMessage(saveMutation.error)}</Text>
        ) : null}

        <Button title={t('common.save')} onPress={handleSave} loading={saveMutation.isLoading} fullWidth style={styles.saveButton} />

        {isEdit ? (
          <>
            <Text style={[styles.label, { color: theme.colors.text }]}>{t('admin.productAttributes.options')}</Text>
            {options.length === 0 ? (
              <Text style={[styles.body, { color: theme.colors.textMuted }]}>{t('admin.productAttributes.noOptions')}</Text>
            ) : (
              <View style={styles.optionsList}>
                {options.map((option) => (
                  <View key={option._id} style={[styles.optionRow, { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.border }]}>
                    <Text style={[styles.optionName, { color: theme.colors.text }]}>{pickI18nText(option.name, language)}</Text>
                    <Pressable onPress={() => openRenameOption(option)} hitSlop={8}>
                      <Text style={[styles.optionAction, { color: theme.colors.primary }]}>{t('common.edit')}</Text>
                    </Pressable>
                    <Pressable onPress={() => handleRemoveOption(option)} hitSlop={8}>
                      <Text style={[styles.optionAction, { color: theme.colors.danger }]}>{t('common.delete')}</Text>
                    </Pressable>
                  </View>
                ))}
              </View>
            )}
            <Button
              title={t('admin.productAttributes.addOption')}
              variant="outline"
              onPress={() => {
                resetOptionForm();
                setAddOptionVisible(true);
              }}
              style={styles.addOptionButton}
            />
          </>
        ) : null}

        {deleteMutation.isError ? (
          <Text style={[styles.error, { color: theme.colors.danger }]}>{getErrorMessage(deleteMutation.error)}</Text>
        ) : null}
        {isEdit ? (
          <Button
            title={t('admin.productAttributes.delete')}
            variant="danger"
            onPress={handleDelete}
            loading={deleteMutation.isLoading}
            fullWidth
            style={styles.deleteButton}
          />
        ) : null}
      </Screen>

      <Modal visible={isAddOptionVisible} transparent animationType="fade" onRequestClose={() => setAddOptionVisible(false)}>
        <View style={styles.overlay}>
          <ScrollView contentContainerStyle={[styles.modalCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.title, { color: theme.colors.text, fontSize: 18 }]}>{t('admin.productAttributes.addOption')}</Text>
            <Input label={t('admin.productAttributes.nameEn')} value={optionNameEn} onChangeText={setOptionNameEn} />
            <Input label={t('admin.productAttributes.nameFr')} value={optionNameFr} onChangeText={setOptionNameFr} />
            <Input label={t('admin.productAttributes.nameAr')} value={optionNameAr} onChangeText={setOptionNameAr} />
            {optionError ? <Text style={[styles.error, { color: theme.colors.danger }]}>{optionError}</Text> : null}
            <View style={styles.modalActions}>
              <Button
                title={t('common.cancel')}
                variant="ghost"
                onPress={() => setAddOptionVisible(false)}
                style={styles.modalActionButton}
              />
              <Button title={t('common.save')} onPress={handleAddOption} loading={addOptionMutation.isLoading} style={styles.modalActionButton} />
            </View>
          </ScrollView>
        </View>
      </Modal>

      <Modal visible={!!renamingOption} transparent animationType="fade" onRequestClose={() => setRenamingOption(null)}>
        <View style={styles.overlay}>
          <ScrollView contentContainerStyle={[styles.modalCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.title, { color: theme.colors.text, fontSize: 18 }]}>{t('admin.productAttributes.editOption')}</Text>
            <Input label={t('admin.productAttributes.nameEn')} value={optionNameEn} onChangeText={setOptionNameEn} />
            <Input label={t('admin.productAttributes.nameFr')} value={optionNameFr} onChangeText={setOptionNameFr} />
            <Input label={t('admin.productAttributes.nameAr')} value={optionNameAr} onChangeText={setOptionNameAr} />
            {optionError ? <Text style={[styles.error, { color: theme.colors.danger }]}>{optionError}</Text> : null}
            <View style={styles.modalActions}>
              <Button title={t('common.cancel')} variant="ghost" onPress={() => setRenamingOption(null)} style={styles.modalActionButton} />
              <Button
                title={t('common.save')}
                onPress={handleRenameOption}
                loading={renameOptionMutation.isLoading}
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
  label: { ...typography.small, fontWeight: '600', marginBottom: spacing.xs, marginTop: spacing.lg },
  body: { ...typography.body, marginBottom: spacing.sm },
  error: { ...typography.small, marginBottom: spacing.sm },
  saveButton: { marginTop: spacing.md },
  deleteButton: { marginTop: spacing.md },
  optionsList: { gap: spacing.sm, marginBottom: spacing.sm },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  optionName: { ...typography.body, flex: 1 },
  optionAction: { ...typography.small, fontWeight: '600' },
  addOptionButton: { marginBottom: spacing.md },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  modalCard: {
    width: '100%',
    borderRadius: 16,
    padding: spacing.lg,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  modalActionButton: { flexShrink: 0 },
});
