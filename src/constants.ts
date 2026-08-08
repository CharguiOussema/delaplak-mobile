import { Platform } from 'react-native';

/**
 * API base URL resolution.
 *
 * - EXPO_PUBLIC_API_URL (if set) always wins.
 * - Otherwise default to localhost for iOS simulator / web.
 * - Android emulator cannot reach the host machine via `localhost` — it must use the
 *   special alias `10.0.2.2`, which maps back to the host's `localhost`. A physical
 *   Android/iOS device on the same Wi-Fi network needs the host machine's LAN IP instead
 *   (set EXPO_PUBLIC_API_URL explicitly in that case, e.g. http://192.168.1.23:3001).
 */
const DEFAULT_PORT = 3001;

function resolveDefaultApiUrl(): string {
  if (Platform.OS === 'android') {
    return `http://10.0.2.2:${DEFAULT_PORT}`;
  }
  return `http://localhost:${DEFAULT_PORT}`;
}

export const API_URL: string = process.env.EXPO_PUBLIC_API_URL || resolveDefaultApiUrl();

export const isDevelopment = __DEV__;
export const isProduction = !__DEV__;

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'delaplak.accessToken',
  REFRESH_TOKEN: 'delaplak.refreshToken',
  LANGUAGE: 'delaplak.language',
  GUEST_CART: 'delaplak.guestCart',
} as const;
