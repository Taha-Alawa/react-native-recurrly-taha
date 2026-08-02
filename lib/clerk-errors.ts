import i18n from "@/lib/i18n";

const KNOWN_CODES = [
  "form_identifier_not_found",
  "form_password_incorrect",
  "form_identifier_exists",
  "form_password_pwned",
  "form_password_length_too_short",
  "form_param_format_invalid",
  "form_code_incorrect",
  "verification_expired",
  "too_many_requests",
] as const;

export const getAuthErrorMessage = (error: unknown): string => {
  const clerkError = error as {
    errors?: { code?: string; message?: string; longMessage?: string }[];
  };

  const firstError = clerkError?.errors?.[0];
  const code = firstError?.code;
  if (code && (KNOWN_CODES as readonly string[]).includes(code)) {
    return i18n.t(`auth.clerkErrors.${code}`);
  }
  if (firstError?.longMessage) {
    return firstError.longMessage;
  }
  if (firstError?.message) {
    return firstError.message;
  }

  return i18n.t("auth.clerkErrors.default");
};
