import dayjs from "dayjs";
import i18n from "@/lib/i18n";

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

export const formatSubscriptionDateTime = (value?: string): string => {
  if (!value) return i18n.t("common.notProvided");
  const parsedDate = dayjs(value);
  return parsedDate.isValid()
    ? parsedDate.format("MM/DD/YYYY")
    : i18n.t("common.notProvided");
};

export const formatStatusLabel = (value?: string): string => {
  if (!value) return i18n.t("common.unknown");
  const key = `common.status.${value.toLowerCase()}`;
  const translated = i18n.t(key);
  if (translated !== key) return translated;
  return value.charAt(0).toUpperCase() + value.slice(1);
};

export const formatMaskedPaymentMethod = (value?: string): string => {
  if (!value) return i18n.t("common.notProvided");
  const lastFourDigits = value.match(/\d{4}(?!.*\d)/)?.[0];
  return lastFourDigits ? `*****${lastFourDigits}` : value;
};

export const formatRenewalCycle = (renewalDate?: string): string => {
  if (!renewalDate) return i18n.t("common.notProvided");
  const target = dayjs(renewalDate);
  if (!target.isValid()) return i18n.t("common.notProvided");

  const now = dayjs();
  if (target.isBefore(now, "day")) return i18n.t("common.overdue");

  const months = target.diff(now, "month");
  if (months <= 0) return i18n.t("common.thisMonth");
  return i18n.t("common.month", { count: months });
};

type DisplayNameUser = {
  firstName?: string | null;
  lastName?: string | null;
  primaryEmailAddress?: { emailAddress?: string | null } | null;
} | null | undefined;

export const getDisplayName = (user: DisplayNameUser, fallback?: string): string => {
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(" ");
  if (name) return name;

  const email = user?.primaryEmailAddress?.emailAddress;
  if (email) {
    const localPart = email.split("@")[0];
    return localPart.charAt(0).toUpperCase() + localPart.slice(1);
  }

  return fallback ?? i18n.t("common.guestFallback");
};
