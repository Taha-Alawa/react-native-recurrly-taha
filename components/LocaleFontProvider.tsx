import { PropsWithChildren } from "react";
import { VariableContextProvider } from "nativewind";
import { useTranslation } from "react-i18next";

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

const LocaleFontProvider = ({ children }: PropsWithChildren) => {
  const { i18n } = useTranslation();
  const fontVars =
    FONT_VARS_BY_LANGUAGE[i18n.language as keyof typeof FONT_VARS_BY_LANGUAGE] ??
    FONT_VARS_BY_LANGUAGE.en;

  return (
    <VariableContextProvider value={fontVars}>
      {children}
    </VariableContextProvider>
  );
};

export default LocaleFontProvider;
