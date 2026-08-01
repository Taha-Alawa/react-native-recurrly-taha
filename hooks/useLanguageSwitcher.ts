import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { setAppLanguage, type AppLanguage } from "@/lib/i18n";

export const useLanguageSwitcher = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = async (language: AppLanguage) => {
    if (language === i18n.language) return;

    const { layoutDirectionChanged } = await setAppLanguage(language);

    if (layoutDirectionChanged) {
      Alert.alert(t("settings.restartTitle"), t("settings.restartMessage"), [
        { text: t("common.ok") },
      ]);
    }
  };

  return {
    currentLanguage: i18n.language as AppLanguage,
    changeLanguage,
  };
};
