import { useTranslation } from "react-i18next";
import DialogShell from "@/core/components/Dialog/DialogShell";
import OptionPicker from "@/core/components/Form/OptionPicker";
import useLanguageSwitcher from "@/core/hooks/useLanguageSwitcher";
import { LANGUAGE_NAMES, SUPPORTED_LANGUAGES, type AppLanguage } from "@/core/i18n/languages";

export type LanguageDialogProps = {
  visible: boolean;
  onClose: () => void;
};

const LanguageDialog = ({ visible, onClose }: LanguageDialogProps) => {
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage } = useLanguageSwitcher();

  return (
    <DialogShell
      visible={visible}
      title={t("settings.chooseLanguage", "Choose language")}
      onClose={onClose}
      dismissOnBackdropPress
    >
      <OptionPicker<AppLanguage>
        options={SUPPORTED_LANGUAGES.map((language) => ({
          value: language,
          // Never translated — a picker must read correctly to someone who
          // does not yet read the active language.
          label: LANGUAGE_NAMES[language],
        }))}
        value={currentLanguage}
        onChange={async (language) => {
          await changeLanguage(language);
          onClose();
        }}
      />
    </DialogShell>
  );
};

export default LanguageDialog;
