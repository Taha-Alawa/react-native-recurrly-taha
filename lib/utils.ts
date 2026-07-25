import dayjs from "dayjs";

export const formatCurrency = (value: number, currency = "USD"): string => {
  try {
    return new Intl.NumberFormat("en-US", {
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
  if (!value) return "Not provided";
  const parsedDate = dayjs(value);
  return parsedDate.isValid() ? parsedDate.format("MM/DD/YYYY") : "Not provided";
};

export const formatStatusLabel = (value?: string): string => {
  if (!value) return "Unknown";
  return value.charAt(0).toUpperCase() + value.slice(1);
};

type DisplayNameUser = {
  firstName?: string | null;
  lastName?: string | null;
  primaryEmailAddress?: { emailAddress?: string | null } | null;
} | null | undefined;

export const getDisplayName = (user: DisplayNameUser, fallback = "there"): string => {
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(" ");
  if (name) return name;
  
  const email = user?.primaryEmailAddress?.emailAddress;
  if (email) {
    const localPart = email.split("@")[0];
    return localPart.charAt(0).toUpperCase() + localPart.slice(1);
  }

  return fallback;
};