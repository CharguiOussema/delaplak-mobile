import React, { createContext, useEffect, useState, type ReactNode } from 'react';
import { I18nManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import { useTranslation } from 'react-i18next';
import { STORAGE_KEYS } from '../constants';
import { restartApp } from '../utils/restartApp';

export type Language = 'en' | 'fr' | 'ar';

const RTL_LANGUAGES: Language[] = ['ar'];

interface AppContextType {
  language: Language;
  /** Persists the language immediately. If it flips the RTL/LTR direction, returns true and
   *  surfaces `restartPromptVisible` so the UI can prompt the user to restart. */
  setLanguage: (language: Language) => Promise<void>;
  isRTL: boolean;
  isLoading: boolean;
  restartPromptVisible: boolean;
  confirmRestart: () => void;
  dismissRestartPrompt: () => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

function resolveDeviceLanguage(): Language {
  const code = Localization.getLocales()?.[0]?.languageCode;
  if (code === 'fr' || code === 'ar') return code;
  return 'en';
}

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const [language, setLanguageState] = useState<Language>('en');
  const [isLoading, setIsLoading] = useState(true);
  const [restartPromptVisible, setRestartPromptVisible] = useState(false);

  // Bootstrap persisted prefs (falls back to device locale for language on first launch).
  useEffect(() => {
    (async () => {
      try {
        const storedLanguage = await AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE);
        const resolvedLanguage = (storedLanguage as Language) || resolveDeviceLanguage();

        setLanguageState(resolvedLanguage);
        await i18n.changeLanguage(resolvedLanguage);

        // Align native RTL flag with the resolved language on cold start (no reload needed
        // here since the app hasn't finished mounting its first frame in the new direction
        // yet — a restart prompt is only needed when the user changes it mid-session).
        const shouldBeRTL = RTL_LANGUAGES.includes(resolvedLanguage);
        if (I18nManager.isRTL !== shouldBeRTL) {
          I18nManager.allowRTL(true);
          I18nManager.forceRTL(shouldBeRTL);
        }
      } finally {
        setIsLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLanguage = async (nextLanguage: Language) => {
    const wasRTL = RTL_LANGUAGES.includes(language);
    const willBeRTL = RTL_LANGUAGES.includes(nextLanguage);

    setLanguageState(nextLanguage);
    await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, nextLanguage);
    await i18n.changeLanguage(nextLanguage);

    if (wasRTL !== willBeRTL) {
      I18nManager.allowRTL(true);
      I18nManager.forceRTL(willBeRTL);
      // I18nManager.forceRTL only takes effect after a JS reload (known RN platform
      // limitation) — surface a "restart required" prompt instead of pretending it's live.
      setRestartPromptVisible(true);
    }
  };

  const confirmRestart = () => {
    setRestartPromptVisible(false);
    restartApp();
  };

  const dismissRestartPrompt = () => setRestartPromptVisible(false);

  const value: AppContextType = {
    language,
    setLanguage,
    isRTL: I18nManager.isRTL,
    isLoading,
    restartPromptVisible,
    confirmRestart,
    dismissRestartPrompt,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
