import { createContext, useContext, useMemo, type PropsWithChildren } from "react";
import { VariableContextProvider } from "nativewind";
import { useTranslation } from "react-i18next";
import {
  getDirectionConfig,
  type DirectionConfig,
} from "@/core/theme/direction";

/**
 * Per-language font faces, published as NativeWind variables so every
 * `font-sans-*` utility resolves to the right face without a single component
 * knowing which language is active.
 */
const FONT_VARS_BY_LANGUAGE = {
  en: {
    "--font-sans": "sans-regular",
    "--font-sans-light": "sans-light",
    "--font-sans-medium": "sans-medium",
    "--font-sans-semibold": "sans-semibold",
    "--font-sans-bold": "sans-bold",
    "--font-sans-extrabold": "sans-extrabold",
  },
  ar: {
    "--font-sans": "sans-regular-ar",
    "--font-sans-light": "sans-light-ar",
    "--font-sans-medium": "sans-medium-ar",
    "--font-sans-semibold": "sans-semibold-ar",
    "--font-sans-bold": "sans-bold-ar",
    "--font-sans-extrabold": "sans-extrabold-ar",
  },
} as const;

const DirectionContext = createContext<DirectionConfig>(
  getDirectionConfig("en"),
);

/** Direction tokens for the active language (architecture §10). */
export const useDirection = () => useContext(DirectionContext);

/**
 * Bootstraps language-dependent presentation in one place: font faces and
 * direction tokens. Physical layout mirroring is handled by React Native's own
 * I18nManager, which is the platform equivalent of the web's `dir` attribute.
 */
const LocalizationProvider = ({ children }: PropsWithChildren) => {
  const { i18n } = useTranslation();
  const language = i18n.language;

  const fontVars =
    FONT_VARS_BY_LANGUAGE[language as keyof typeof FONT_VARS_BY_LANGUAGE] ??
    FONT_VARS_BY_LANGUAGE.en;

  const direction = useMemo(() => getDirectionConfig(language), [language]);

  return (
    <VariableContextProvider value={fontVars}>
      <DirectionContext.Provider value={direction}>
        {children}
      </DirectionContext.Provider>
    </VariableContextProvider>
  );
};

export default LocalizationProvider;
