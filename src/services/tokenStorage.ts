import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants';

// expo-secure-store (Keychain/Keystore-backed) is the right place for tokens on iOS/Android,
// as opposed to AsyncStorage which is used elsewhere in this app only for non-sensitive prefs
// (language). SecureStore has no web implementation (no OS keychain in a browser), so the web
// build falls back to AsyncStorage there — same trust boundary as any web app's localStorage.
const isWeb = Platform.OS === 'web';

const getItem = (key: string): Promise<string | null> =>
  isWeb ? AsyncStorage.getItem(key) : SecureStore.getItemAsync(key);

const setItem = (key: string, value: string): Promise<void> =>
  isWeb ? AsyncStorage.setItem(key, value) : SecureStore.setItemAsync(key, value);

const deleteItem = (key: string): Promise<void> =>
  isWeb ? AsyncStorage.removeItem(key) : SecureStore.deleteItemAsync(key);

class TokenStorage {
  getAccessToken(): Promise<string | null> {
    return getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  getRefreshToken(): Promise<string | null> {
    return getItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    await Promise.all([
      setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken),
      setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken),
    ]);
  }

  setAccessToken(accessToken: string): Promise<void> {
    return setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
  }

  async clear(): Promise<void> {
    await Promise.all([
      deleteItem(STORAGE_KEYS.ACCESS_TOKEN),
      deleteItem(STORAGE_KEYS.REFRESH_TOKEN),
    ]);
  }
}

export const tokenStorage = new TokenStorage();
