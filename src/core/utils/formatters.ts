import dayjs from "dayjs";
import i18n from "@/core/i18n";

/**
 * Generic, domain-agnostic formatting. Anything that knows what a Subscription
 * is belongs in that feature's utils, not here — core must stay reusable.
 */

const numberFormatLocale = () => (i18n.language === "ar" ? "ar-EG" : "en-US");

export const formatCurrency = (value: number, currency = "USD"): string => {
  try {
    return new Intl.NumberFormat(numberFormatLocale(), {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return value.toFixed(2);
  }
};

export const formatDate = (value?: string): string => {
  if (!value) return i18n.t("common.notProvided", "Not provided");
  const parsed = dayjs(value);
  return parsed.isValid()
    ? parsed.format("MM/DD/YYYY")
    : i18n.t("common.notProvided", "Not provided");
};

type DisplayNameUser =
  | { displayName?: string | null; email?: string | null }
  | null
  | undefined;

/**
 * Email/password sign-up leaves `displayName` empty, so fall back to the local
 * part of the address rather than showing a blank header.
 */
export const getDisplayName = (
  user: DisplayNameUser,
  fallback?: string,
): string => {
  const name = user?.displayName?.trim();
  if (name) return name;

  const email = user?.email;
  if (email) {
    const localPart = email.split("@")[0];
    return localPart.charAt(0).toUpperCase() + localPart.slice(1);
  }

  return fallback ?? i18n.t("common.guestFallback", "there");
};
