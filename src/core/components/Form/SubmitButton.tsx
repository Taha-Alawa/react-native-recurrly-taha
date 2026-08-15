import { Pressable, Text } from "react-native";
import clsx from "clsx";

export type SubmitButtonProps = {
  label: string;
  busyLabel?: string;
  busy?: boolean;
  disabled?: boolean;
  onPress: () => void;
  variant?: "primary" | "secondary";
};

const SubmitButton = ({
  label,
  busyLabel,
  busy = false,
  disabled = false,
  onPress,
  variant = "primary",
}: SubmitButtonProps) => {
  const isBlocked = busy || disabled;

  return (
    <Pressable
      className={clsx(
        variant === "primary" ? "auth-button" : "auth-secondary-button",
        isBlocked &&
          (variant === "primary"
            ? "auth-button-disabled"
            : "auth-secondary-button-disabled"),
      )}
      onPress={onPress}
      disabled={isBlocked}
    >
      <Text
        className={
          variant === "primary"
            ? "auth-button-text"
            : "auth-secondary-button-text"
        }
      >
        {busy ? (busyLabel ?? label) : label}
      </Text>
    </Pressable>
  );
};

export default SubmitButton;
