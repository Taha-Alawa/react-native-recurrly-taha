import { Pressable, Text, View } from "react-native";
import clsx from "clsx";
import type { PickerOption } from "@/core/components/Form/OptionPicker";

export type ChipPickerProps<TValue extends string> = {
  label?: string;
  options: PickerOption<TValue>[];
  value: TValue;
  onChange: (value: TValue) => void;
  disabled?: boolean;
};

/** Wrapping chip row, for choice sets too long for a segmented picker. */
const ChipPicker = <TValue extends string>({
  label,
  options,
  value,
  onChange,
  disabled = false,
}: ChipPickerProps<TValue>) => (
  <View className="auth-field">
    {label ? <Text className="auth-label">{label}</Text> : null}

    <View className="category-scroll">
      {options.map((option) => {
        const isActive = option.value === value;

        return (
          <Pressable
            key={option.value}
            className={clsx(
              "category-chip",
              isActive && "category-chip-active",
              disabled && "opacity-50",
            )}
            onPress={() => onChange(option.value)}
            disabled={disabled}
          >
            <Text
              className={clsx(
                "category-chip-text",
                isActive && "category-chip-text-active",
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

export default ChipPicker;
