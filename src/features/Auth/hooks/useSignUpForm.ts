import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { usePostHog } from "posthog-react-native";
import useForm from "@/core/hooks/useForm";
import AuthService from "@/features/Auth/services/AuthService";
import { getAuthErrorMessage } from "@/features/Auth/utils/firebaseErrors";
import {
  SIGN_UP_DEFAULT_VALUES,
  SignUpSchema,
  type SignUpFormValues,
} from "@/features/Auth/schemas/SignUp/SignUpSchema";

export const useSignUpForm = () => {
  const { i18n } = useTranslation();
  const posthog = usePostHog();

  const [formError, setFormError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const schema = useMemo(() => SignUpSchema(), [i18n.language]);

  const onSubmit = useCallback(
    async (values: SignUpFormValues) => {
      setFormError("");

      try {
        const credential = await AuthService.signUp(
          values.email.trim(),
          values.password,
        );

        // Firebase signs the new user in immediately, so the root guard sends
        // them straight into the app — nothing to navigate here.
        posthog.identify(credential.user.uid, {
          email: credential.user.email,
          $set_once: { sign_up_date: new Date().toISOString() },
        });
        posthog.capture("user_signed_up");
      } catch (error) {
        const message = getAuthErrorMessage(error);
        setFormError(message);
        posthog.capture("sign_up_failed", { reason: message });
      }
    },
    [posthog],
  );

  const form = useForm<SignUpFormValues>({
    schema,
    defaultValues: SIGN_UP_DEFAULT_VALUES,
    onSubmit,
  });

  return {
    ...form,
    formError,
    showPassword,
    toggleShowPassword: () => setShowPassword((value) => !value),
  };
};

export default useSignUpForm;
