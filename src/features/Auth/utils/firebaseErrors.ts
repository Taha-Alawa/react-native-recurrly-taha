import i18n from "@/core/i18n";

/**
 * Firebase auth error codes we have written copy for. Anything else falls back
 * to a generic message for the user — but never silently: the real code is
 * logged in development and appended to the message so a failure is always
 * diagnosable instead of a flat "something went wrong".
 */
const KNOWN_CODES = [
  "auth/invalid-email",
  "auth/user-disabled",
  "auth/user-not-found",
  "auth/wrong-password",
  "auth/invalid-credential",
  "auth/email-already-in-use",
  "auth/weak-password",
  "auth/too-many-requests",
  "auth/network-request-failed",
  "auth/requires-recent-login",
  "auth/operation-not-allowed",
  "auth/invalid-api-key",
  "auth/api-key-not-valid",
  "auth/app-not-authorized",
  "auth/internal-error",
] as const;

/** Extra guidance for failures that are a project setup problem, not a user one. */
const SETUP_HINTS: Record<string, string> = {
  "auth/operation-not-allowed":
    "Enable Email/Password in Firebase console > Authentication > Sign-in method.",
  "auth/invalid-api-key":
    "EXPO_PUBLIC_FIREBASE_API_KEY is wrong. Re-copy it from Firebase console > Project settings.",
  "auth/api-key-not-valid":
    "EXPO_PUBLIC_FIREBASE_API_KEY is wrong. Re-copy it from Firebase console > Project settings.",
  "auth/network-request-failed":
    "The device could not reach Firebase — check connectivity, or that the bundler was restarted after editing .env.",
};

export const getAuthErrorMessage = (error: unknown): string => {
  const code = (error as { code?: string })?.code;
  const rawMessage = (error as { message?: string })?.message;

  if (__DEV__) {
    console.error(
      `[auth] ${code ?? "no-code"}: ${rawMessage ?? String(error)}` +
        (code && SETUP_HINTS[code] ? `\n  -> ${SETUP_HINTS[code]}` : ""),
    );
  }

  // Not a Firebase error at all — these are our own configuration failures
  // (e.g. "Firebase is not configured"), and their message is the useful part.
  if (!code) {
    return rawMessage || i18n.t("auth.firebaseErrors.default", "Something went wrong. Please try again.");
  }

  if ((KNOWN_CODES as readonly string[]).includes(code)) {
    // Dots are i18next's nesting separator, so the codes are stored flattened.
    return i18n.t(`auth.firebaseErrors.${code.replace("auth/", "")}`);
  }

  const generic = i18n.t("auth.firebaseErrors.default", "Something went wrong. Please try again.");
  // Surfacing the code in development turns an opaque failure into a one-line fix.
  return __DEV__ ? `${generic} (${code})` : generic;
};
