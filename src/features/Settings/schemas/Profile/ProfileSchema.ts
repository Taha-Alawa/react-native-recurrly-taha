import i18n from "@/core/i18n";
import { validators, type ValidationSchema } from "@/core/utils/validation";

export type ProfileFormValues = {
  displayName: string;
  /** Local URI of a newly picked image, or "" when unchanged. */
  avatarUri: string;
};

export const PROFILE_DEFAULT_VALUES: ProfileFormValues = {
  displayName: "",
  avatarUri: "",
};

export const ProfileSchema = (): ValidationSchema<ProfileFormValues> => ({
  displayName: [
    validators.required(
      i18n.t("modal.profile.errors.nameRequired", "Enter a username."),
    ),
    validators.minLength(
      2,
      i18n.t("modal.profile.errors.nameTooShort", "Username must be at least 2 characters."),
    ),
  ],
});
