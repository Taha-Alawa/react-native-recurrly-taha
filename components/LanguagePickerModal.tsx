import { Modal, Pressable, Text, View } from "react-native";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { LANGUAGE_NAMES, SUPPORTED_LANGUAGES } from "@/lib/i18n";
import { useLanguageSwitcher } from "@/hooks/useLanguageSwitcher";

const LanguagePickerModal = ({ visible, onClose }: LanguagePickerModalProps) => {
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage } = useLanguageSwitcher();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View className="modal-overlay">
        <View className="modal-container">
          <View className="modal-header">
            <Text className="modal-title">{t("settings.chooseLanguage")}</Text>
            <Pressable className="modal-close" onPress={onClose} hitSlop={8}>
              <Text className="modal-close-text">✕</Text>
            </Pressable>
          </View>

          <View className="modal-body">
            <View className="picker-row">
              {SUPPORTED_LANGUAGES.map((language) => (
                <Pressable
                  key={language}
                  className={clsx(
                    "picker-option",
                    currentLanguage === language && "picker-option-active",
                  )}
                  onPress={async () => {
                    await changeLanguage(language);
                    onClose();
                  }}
                >
                  <Text
                    className={clsx(
                      "picker-option-text",
                      currentLanguage === language &&
                        "picker-option-text-active",
                    )}
                  >
                    {LANGUAGE_NAMES[language]}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default LanguagePickerModal;
