import type { ReactNode } from "react";
import { Text, TextInput, View, type TextInputProps } from "react-native";
import clsx from "clsx";
import { colors } from "@/core/theme/tokens";

export type TextFieldProps = Omit<TextInputProps, "className"> & {
  label: string;
  error?: string;
  /** Rendered beside the input — e.g. a show/hide password toggle. */
  trailing?: ReactNode;
  /** Read-only rendering, driven by a `read` dialog type (architecture §7). */
  readOnly?: boolean;
};

/**
 * Label + input + inline error, the shape every form field in the app used to
 * re-declare by hand. Presentation only: it neither validates nor submits.
 */
const TextField = ({
  label,
  error,
  trailing,
  readOnly = false,
  editable,
  ...inputProps
}: TextFieldProps) => (
  <View className="auth-field">
    <Text className="auth-label">{label}</Text>

    <View className="field-row">
      <TextInput
        className={clsx(
          "auth-input",
          "flex-1",
          error && "auth-input-error",
          readOnly && "auth-input-readonly",
        )}
        placeholderTextColor={colors.mutedForeground}
        editable={readOnly ? false : editable}
        {...inputProps}
      />
      {trailing}
    </View>

    {error ? <Text className="auth-error">{error}</Text> : null}
  </View>
);

export default TextField;
