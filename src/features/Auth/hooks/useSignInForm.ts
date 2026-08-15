import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { usePostHog } from "posthog-react-native";
import useForm from "@/core/hooks/useForm";
import AuthService from "@/features/Auth/services/AuthService";
import { getAuthErrorMessage } from "@/features/Auth/utils/firebaseErrors";
import {
  SIGN_IN_DEFAULT_VALUES,
  SignInSchema,
  type SignInFormValues,
} from "@/features/Auth/schemas/SignIn/SignInSchema";

export const useSignInForm = () => {
  const { i18n } = useTranslation();
  const posthog = usePostHog();

  const [formError, setFormError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const schema = useMemo(() => SignInSchema(), [i18n.language]);

  const onSubmit = useCallback(
    async (values: SignInFormValues) => {
      setFormError("");

      try {
        const credential = await AuthService.signIn(
          values.email.trim(),
          values.password,
        );

        // Routing is driven by the session store, which the root layout's
        // onAuthStateChanged subscription updates — nothing to navigate here.
        posthog.identify(credential.user.uid, {
          email: credential.user.email,
          $set_once: { first_sign_in_date: new Date().toISOString() },
        });
        posthog.capture("user_signed_in");
      } catch (error) {
        const message = getAuthErrorMessage(error);
        setFormError(message);
        posthog.capture("sign_in_failed", { reason: message });
      }
    },
    [posthog],
  );

  const form = useForm<SignInFormValues>({
    schema,
    defaultValues: SIGN_IN_DEFAULT_VALUES,
    onSubmit,
  });

  return {
    ...form,
    formError,
    showPassword,
    toggleShowPassword: () => setShowPassword((value) => !value),
  };
};

export default useSignInForm;
