import i18n from "@/core/i18n";
import { validators, type ValidationSchema } from "@/core/utils/validation";

export type SignUpFormValues = {
  email: string;
  password: string;
  confirmPassword: string;
};

export const SIGN_UP_DEFAULT_VALUES: SignUpFormValues = {
  email: "",
  password: "",
  confirmPassword: "",
};

export const SignUpSchema = (): ValidationSchema<SignUpFormValues> => ({
  email: [
    validators.required(
      i18n.t("auth.signUp.errors.emailRequired", "Enter your email address."),
    ),
    validators.email(
      i18n.t("auth.signUp.errors.emailInvalid", "Enter a valid email address."),
    ),
  ],
  password: [
    validators.required(
      i18n.t("auth.signUp.errors.passwordRequired", "Create a password."),
    ),
    validators.minLength(
      8,
      i18n.t(
        "auth.signUp.errors.passwordTooShort",
        "Password must be at least 8 characters.",
      ),
    ),
  ],
  confirmPassword: [
    validators.matchesField(
      "password",
      i18n.t("auth.signUp.errors.passwordMismatch", "Passwords don't match."),
    ),
  ],
});
