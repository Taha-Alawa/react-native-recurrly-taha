import i18n from "@/core/i18n";
import { validators, type ValidationSchema } from "@/core/utils/validation";

export type SignInFormValues = {
  email: string;
  password: string;
};

export const SIGN_IN_DEFAULT_VALUES: SignInFormValues = {
  email: "",
  password: "",
};

export const SignInSchema = (): ValidationSchema<SignInFormValues> => ({
  email: [
    validators.required(
      i18n.t("auth.signIn.errors.emailRequired", "Enter your email address."),
    ),
    validators.email(
      i18n.t("auth.signIn.errors.emailInvalid", "Enter a valid email address."),
    ),
  ],
  password: [
    validators.required(
      i18n.t("auth.signIn.errors.passwordRequired", "Enter your password."),
    ),
  ],
});
