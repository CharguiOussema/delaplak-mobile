import React, { useCallback, useEffect, useState } from 'react';
import { Animated, Image, Modal, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../hooks';
import { Button } from '../ui/Button';
import { spacing, radius, typography } from '../../theme/theme';
import { useDragResize } from './useDragResize';

interface RoomPreviewModalProps {
  visible: boolean;
  onClose: () => void;
  productImageUrl: string;
}

const OVERLAY_SIZE = 160;

/**
 * Client-only visual preview: pick a photo of the client's own space as a background,
 * then drag/pinch the product image over it. The background photo lives only in local
 * state (the picker's local asset URI) — it is never uploaded or persisted server-side.
 */
export const RoomPreviewModal: React.FC<RoomPreviewModalProps> = ({ visible, onClose, productImageUrl }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [backgroundUri, setBackgroundUri] = useState<string | null>(null);
  const { pan, scale, panHandlers, reset } = useDragResize();

  useEffect(() => {
    if (!visible) {
      setBackgroundUri(null);
      reset();
    }
    // reset() is stable across renders (see useDragResize) — only `visible` should retrigger this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const pickBackground = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (!result.canceled) {
      setBackgroundUri(result.assets[0].uri);
      reset();
    }
  }, [reset]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>{t('product.preview.title')}</Text>
          <Button title={t('common.close')} variant="ghost" size="sm" onPress={onClose} />
        </View>

        {!backgroundUri ? (
          <View style={styles.emptyState}>
            <Text style={[styles.hint, { color: theme.colors.textMuted }]}>{t('product.preview.hint')}</Text>
            <Button title={t('product.preview.choosePhoto')} onPress={pickBackground} />
          </View>
        ) : (
          <>
            <View style={[styles.stage, { backgroundColor: theme.colors.surfaceAlt }]}>
              <Image source={{ uri: backgroundUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
              <Animated.View
                {...panHandlers}
                style={[styles.overlay, { transform: [{ translateX: pan.x }, { translateY: pan.y }, { scale }] }]}
              >
                <Image source={{ uri: productImageUrl }} style={styles.overlayImage} resizeMode="contain" />
              </Animated.View>
            </View>
            <Text style={[styles.gestureHint, { color: theme.colors.textMuted }]}>{t('product.preview.gestureHint')}</Text>
            <View style={styles.actions}>
              <Button title={t('product.preview.changePhoto')} variant="outline" size="sm" onPress={pickBackground} />
              <Button title={t('product.preview.resetPosition')} variant="outline" size="sm" onPress={reset} />
            </View>
            <Text style={[styles.disclaimer, { color: theme.colors.textMuted }]}>{t('product.preview.disclaimer')}</Text>
          </>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  title: { ...typography.h3 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, paddingHorizontal: spacing.xl },
  hint: { ...typography.body, textAlign: 'center' },
  stage: { flex: 1, borderRadius: radius.md, overflow: 'hidden' },
  overlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: OVERLAY_SIZE,
    height: OVERLAY_SIZE,
    marginLeft: -OVERLAY_SIZE / 2,
    marginTop: -OVERLAY_SIZE / 2,
  },
  overlayImage: { width: '100%', height: '100%' },
  gestureHint: { ...typography.tiny, textAlign: 'center', marginTop: spacing.sm },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md, justifyContent: 'center' },
  disclaimer: { ...typography.tiny, textAlign: 'center', marginTop: spacing.sm },
});
