import { useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useTranslation } from "react-i18next";

export type AvatarFieldProps = {
  label?: string;
  /** Currently displayed image — a remote URL or a locally picked URI. */
  value: string | null;
  /** Shown when there is no image at all. */
  fallback: number;
  onChange: (uri: string) => void;
  onClear?: () => void;
  disabled?: boolean;
};

/**
 * Circular avatar with a picker. Owns the permission prompt and the picker
 * result shape so no feature has to; it hands back a plain local URI.
 */
const AvatarField = ({
  label,
  value,
  fallback,
  onChange,
  onClear,
  disabled = false,
}: AvatarFieldProps) => {
  const { t } = useTranslation();
  const [error, setError] = useState("");

  const pick = async () => {
    if (disabled) return;
    setError("");

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError(
        t(
          "modal.profile.permissionDenied",
          "Photo access is off. Enable it in your device settings to choose a picture.",
        ),
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (result.canceled) return;

    const uri = result.assets?.[0]?.uri;
    if (uri) onChange(uri);
  };

  return (
    <View className="auth-field">
      {label ? <Text className="auth-label">{label}</Text> : null}

      <View className="avatar-field-row">
        <Pressable onPress={pick} disabled={disabled} hitSlop={8}>
          <Image
            source={value ? { uri: value } : fallback}
            className="avatar-field-image"
          />
          <View className="avatar-field-badge">
            <Text className="avatar-field-badge-text">✎</Text>
          </View>
        </Pressable>

        <View className="avatar-field-actions">
          <Pressable className="list-action" onPress={pick} disabled={disabled}>
            <Text className="list-action-text">
              {t("modal.profile.choosePhoto", "Choose photo")}
            </Text>
          </Pressable>

          {value && onClear ? (
            <Pressable onPress={onClear} disabled={disabled} hitSlop={8}>
              <Text className="avatar-field-remove">
                {t("modal.profile.removePhoto", "Remove")}
              </Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      {error ? <Text className="auth-error">{error}</Text> : null}
    </View>
  );
};

export default AvatarField;
