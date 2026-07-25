const FRIENDLY_MESSAGES: Record<string, string> = {
  form_identifier_not_found: "We couldn't find an account with that email.",
  form_password_incorrect: "That password doesn't match. Please try again.",
  form_identifier_exists:
    "An account with that email already exists. Try signing in instead.",
  form_password_pwned:
    "That password has appeared in a data breach. Please choose a different one.",
  form_password_length_too_short: "Password must be at least 8 characters.",
  form_param_format_invalid: "Enter a valid email address.",
  form_code_incorrect: "That code isn't right. Please check and try again.",
  verification_expired: "That code has expired. Request a new one below.",
  too_many_requests: "Too many attempts. Please wait a moment and try again.",
};

export const getAuthErrorMessage = (error: unknown): string => {
  const clerkError = error as {
    errors?: { code?: string; message?: string; longMessage?: string }[];
  };

  const firstError = clerkError?.errors?.[0];
  if (firstError?.code && FRIENDLY_MESSAGES[firstError.code]) {
    return FRIENDLY_MESSAGES[firstError.code];
  }
  if (firstError?.longMessage) {
    return firstError.longMessage;
  }
  if (firstError?.message) {
    return firstError.message;
  }

  return "Something went wrong. Please try again.";
};
