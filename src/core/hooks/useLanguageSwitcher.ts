import { useCallback } from "react";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { setAppLanguage } from "@/core/i18n";
import type { AppLanguage } from "@/core/i18n/languages";

export const useLanguageSwitcher = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = useCallback(
    async (language: AppLanguage) => {
      if (language === i18n.language) return;

      const { layoutDirectionChanged } = await setAppLanguage(language);

      // Flipping RTL only takes full effect after a reload on native.
      if (layoutDirectionChanged) {
        Alert.alert(
          t("settings.restartTitle", "Restart required"),
          t(
            "settings.restartMessage",
            "Restart the app to fully apply the new layout direction.",
          ),
          [{ text: t("common.ok", "OK") }],
        );
      }
    },
    [i18n.language, t],
  );

  return { currentLanguage: i18n.language as AppLanguage, changeLanguage };
};

export default useLanguageSwitcher;
