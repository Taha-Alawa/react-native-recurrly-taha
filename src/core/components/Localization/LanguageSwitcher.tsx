import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import LanguageDialog from "@/core/components/Localization/LanguageDialog";
import useLanguageSwitcher from "@/core/hooks/useLanguageSwitcher";
import { LANGUAGE_NAMES } from "@/core/i18n/languages";

/** Compact pill + picker, for screens with no settings row to hang it off. */
const LanguageSwitcher = () => {
  const { currentLanguage } = useLanguageSwitcher();
  const [isOpen, setOpen] = useState(false);

  return (
    <>
      <View className="auth-lang-row">
        <Pressable
          className="auth-lang-toggle"
          onPress={() => setOpen(true)}
          hitSlop={8}
        >
          <Text className="auth-lang-toggle-text">
            {LANGUAGE_NAMES[currentLanguage]}
          </Text>
        </Pressable>
      </View>

      <LanguageDialog visible={isOpen} onClose={() => setOpen(false)} />
    </>
  );
};

export default LanguageSwitcher;
