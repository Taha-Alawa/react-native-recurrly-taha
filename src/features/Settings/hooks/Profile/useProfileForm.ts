import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import useForm from "@/core/hooks/useForm";
import authStore from "@/core/store/authStore";
import {
  PROFILE_DEFAULT_VALUES,
  ProfileSchema,
  type ProfileFormValues,
} from "@/features/Settings/schemas/Profile/ProfileSchema";

export type UseProfileFormOptions = {
  onSubmit: (values: ProfileFormValues) => void | Promise<void>;
};

export const useProfileForm = ({ onSubmit }: UseProfileFormOptions) => {
  const { i18n } = useTranslation();
  const { displayName, photoURL } = authStore.useStore();

  const schema = useMemo(() => ProfileSchema(), [i18n.language]);

  const form = useForm<ProfileFormValues>({
    schema,
    defaultValues: PROFILE_DEFAULT_VALUES,
    onSubmit,
  });

  const { reset } = form;

  // Hydrate from the live session so the sheet opens showing the current name.
  useEffect(() => {
    reset({ displayName: displayName ?? "", avatarUri: "" });
  }, [displayName, reset]);

  /** What the avatar circle should render: a fresh pick wins over the saved one. */
  const previewUri = form.values.avatarUri || photoURL;

  return { ...form, previewUri, savedPhotoURL: photoURL };
};

export default useProfileForm;
