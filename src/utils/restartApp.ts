import { Platform } from 'react-native';
import * as Updates from 'expo-updates';

/**
 * I18nManager.forceRTL() only takes effect after a full JS reload. `Updates.reloadAsync()`
 * does that in a built app; in Expo Go / dev client it may reject (no OTA runtime available),
 * in which case there is nothing we can do programmatically — the developer/user must
 * manually reload (shake menu -> Reload, or restart the packager) for RTL to apply.
 */
export async function restartApp(): Promise<void> {
  if (Platform.OS === 'web') {
    // window.location.reload is the web equivalent; RTL there is handled by the browser via dir=.
    if (typeof window !== 'undefined') window.location.reload();
    return;
  }
  try {
    await Updates.reloadAsync();
  } catch (error) {
    console.warn('[restartApp] Updates.reloadAsync() unavailable (likely running in Expo Go/dev client).', error);
  }
}
