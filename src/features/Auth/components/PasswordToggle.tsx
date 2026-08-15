import { Pressable, Text } from "react-native";
import { useTranslation } from "react-i18next";

export type PasswordToggleProps = {
  visible: boolean;
  onToggle: () => void;
};

const PasswordToggle = ({ visible, onToggle }: PasswordToggleProps) => {
  const { t } = useTranslation();

  return (
    <Pressable className="password-toggle" onPress={onToggle} hitSlop={8}>
      <Text className="password-toggle-text">
        {visible ? t("auth.signIn.hide", "Hide") : t("auth.signIn.show", "Show")}
      </Text>
    </Pressable>
  );
};

export default PasswordToggle;
