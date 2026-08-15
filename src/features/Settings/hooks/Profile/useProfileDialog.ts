import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { usePostHog } from "posthog-react-native";
import useDialog from "@/core/hooks/useDialog";
import feedbackService from "@/core/services/feedbackService";
import authStore from "@/core/store/authStore";
import ProfileService from "@/features/Settings/services/ProfileService";
import { getAuthErrorMessage } from "@/features/Auth/utils/firebaseErrors";
import type { ProfileFormValues } from "@/features/Settings/schemas/Profile/ProfileSchema";

export const UPDATE_PROFILE_DIALOG = "updateProfile";

export const useProfileDialog = () => {
  const { t } = useTranslation();
  const posthog = usePostHog();
  const { isOpen, close } = useDialog(UPDATE_PROFILE_DIALOG);

  const handleSubmit = useCallback(
    async (values: ProfileFormValues) => {
      try {
        // Upload first: if the image fails there is no point renaming, and the
        // user keeps both their old name and old picture rather than half of each.
        if (values.avatarUri) {
          await ProfileService.uploadAvatar(values.avatarUri);
        }

        if (values.displayName.trim() !== (authStore.getState().displayName ?? "")) {
          await ProfileService.updateDisplayName(values.displayName);
        }

        posthog.capture("profile_updated", {
          changed_avatar: Boolean(values.avatarUri),
        });
        feedbackService.show(
          "success",
          t("modal.profile.success", "Profile updated."),
        );
        close();
      } catch (error) {
        feedbackService.show("error", getAuthErrorMessage(error));
      }
    },
    [close, posthog, t],
  );

  const handleRemoveAvatar = useCallback(async () => {
    try {
      await ProfileService.removeAvatar();
    } catch (error) {
      feedbackService.show("error", getAuthErrorMessage(error));
    }
  }, []);

  return {
    isOpen,
    title: t("modal.profile.title", "Edit Profile"),
    onSubmit: handleSubmit,
    onRemoveAvatar: handleRemoveAvatar,
    close,
  };
};

export default useProfileDialog;
