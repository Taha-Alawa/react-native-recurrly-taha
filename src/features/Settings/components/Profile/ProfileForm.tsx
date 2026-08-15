import { useTranslation } from "react-i18next";
import TextField from "@/core/components/Form/TextField";
import AvatarField from "@/core/components/Form/AvatarField";
import SubmitButton from "@/core/components/Form/SubmitButton";
import images from "@/core/constants/images";
import useProfileForm from "@/features/Settings/hooks/Profile/useProfileForm";
import type { ProfileFormValues } from "@/features/Settings/schemas/Profile/ProfileSchema";

export type ProfileFormProps = {
  onSubmit: (values: ProfileFormValues) => void | Promise<void>;
  onRemoveAvatar: () => void | Promise<void>;
};

const ProfileForm = ({ onSubmit, onRemoveAvatar }: ProfileFormProps) => {
  const { t } = useTranslation();
  const {
    values,
    errors,
    submitting,
    setField,
    handleSubmit,
    previewUri,
    savedPhotoURL,
  } = useProfileForm({ onSubmit });

  return (
    <>
      <AvatarField
        label={t("modal.profile.avatarLabel", "Profile picture")}
        value={previewUri}
        fallback={images.avatar}
        onChange={(uri) => setField("avatarUri", uri)}
        onClear={
          savedPhotoURL || values.avatarUri
            ? () => {
                setField("avatarUri", "");
                if (savedPhotoURL) void onRemoveAvatar();
              }
            : undefined
        }
        disabled={submitting}
      />

      <TextField
        label={t("modal.profile.nameLabel", "Username")}
        placeholder={t("modal.profile.namePlaceholder", "How should we call you?")}
        value={values.displayName}
        onChangeText={(value) => setField("displayName", value)}
        error={errors.displayName}
        editable={!submitting}
        autoCapitalize="words"
        autoCorrect={false}
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
      />

      <SubmitButton
        label={t("modal.profile.submit", "Save Profile")}
        busyLabel={t("modal.profile.submitting", "Saving…")}
        busy={submitting}
        onPress={handleSubmit}
      />
    </>
  );
};

export default ProfileForm;
