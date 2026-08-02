import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import * as SecureStore from "expo-secure-store";
import { I18nManager, Platform } from "react-native";
import dayjs from "dayjs";
import "dayjs/locale/ar";
import "dayjs/locale/en";
import en from "./locales/en.json";
import ar from "./locales/ar.json";

export const SUPPORTED_LANGUAGES = ["en", "ar"] as const;
export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

// Each language's own name, in its own script — never translated into the
// current UI language, so a picker always reads correctly to someone who
// doesn't yet read the active language.
export const LANGUAGE_NAMES: Record<AppLanguage, string> = {
  en: "English",
  ar: "العربية",
};

const RTL_LANGUAGES: AppLanguage[] = ["ar"];
const LANGUAGE_STORAGE_KEY = "app_language";

const isRTLLanguage = (language: AppLanguage) =>
  RTL_LANGUAGES.includes(language);

const getStoredLanguage = async (): Promise<AppLanguage | null> => {
  if (Platform.OS === "web") return null;
  try {
    const stored = await SecureStore.getItemAsync(LANGUAGE_STORAGE_KEY);
    return (SUPPORTED_LANGUAGES as readonly string[]).includes(stored ?? "")
      ? (stored as AppLanguage)
      : null;
  } catch {
    return null;
  }
};

const detectDeviceLanguage = (): AppLanguage => {
  const deviceLanguageCode = Localization.getLocales()[0]?.languageCode;
  return deviceLanguageCode === "ar" ? "ar" : "en";
};

export const initI18n = async (): Promise<AppLanguage> => {
  const language = (await getStoredLanguage()) ?? detectDeviceLanguage();

  await i18n.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      ar: { translation: ar },
    },
    lng: language,
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  });

  dayjs.locale(language);
  I18nManager.allowRTL(true);

  const shouldBeRTL = isRTLLanguage(language);
  if (I18nManager.isRTL !== shouldBeRTL) {
    I18nManager.forceRTL(shouldBeRTL);
  }

  return language;
};

export const setAppLanguage = async (
  language: AppLanguage,
): Promise<{ layoutDirectionChanged: boolean }> => {
  await i18n.changeLanguage(language);
  dayjs.locale(language);

  try {
    if (Platform.OS !== "web") {
      await SecureStore.setItemAsync(LANGUAGE_STORAGE_KEY, language);
    }
  } catch {
    // Ignore persistence failures — the in-memory language change still applies.
  }

  const shouldBeRTL = isRTLLanguage(language);
  const layoutDirectionChanged = I18nManager.isRTL !== shouldBeRTL;
  if (layoutDirectionChanged) {
    I18nManager.forceRTL(shouldBeRTL);
  }

  return { layoutDirectionChanged };
};

export default i18n;
