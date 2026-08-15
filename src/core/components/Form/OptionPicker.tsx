import { Pressable, Text, View } from "react-native";
import clsx from "clsx";

export type PickerOption<TValue extends string> = {
  value: TValue;
  label: string;
};

export type OptionPickerProps<TValue extends string> = {
  label?: string;
  options: PickerOption<TValue>[];
  value: TValue;
  onChange: (value: TValue) => void;
  disabled?: boolean;
};

/** Segmented row of mutually exclusive choices (frequency, language, …). */
const OptionPicker = <TValue extends string>({
  label,
  options,
  value,
  onChange,
  disabled = false,
}: OptionPickerProps<TValue>) => (
  <View className="auth-field">
    {label ? <Text className="auth-label">{label}</Text> : null}

    <View className="picker-row">
      {options.map((option) => {
        const isActive = option.value === value;

        return (
          <Pressable
            key={option.value}
            className={clsx(
              "picker-option",
              isActive && "picker-option-active",
              disabled && "opacity-50",
            )}
            onPress={() => onChange(option.value)}
            disabled={disabled}
          >
            <Text
              className={clsx(
                "picker-option-text",
                isActive && "picker-option-text-active",
              )}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  </View>
);

export default OptionPicker;
