export const SUPPORTED_LANGUAGES = ["en", "ar"] as const;
export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

/**
 * Each language's own name, in its own script — never translated into the
 * current UI language, so a picker always reads correctly to someone who
 * doesn't yet read the active language.
 */
export const LANGUAGE_NAMES: Record<AppLanguage, string> = {
  en: "English",
  ar: "العربية",
};

export const RTL_LANGUAGES: AppLanguage[] = ["ar"];

export const isRTLLanguage = (language: AppLanguage) =>
  RTL_LANGUAGES.includes(language);

export const isSupportedLanguage = (value: string | null): value is AppLanguage =>
  (SUPPORTED_LANGUAGES as readonly string[]).includes(value ?? "");
