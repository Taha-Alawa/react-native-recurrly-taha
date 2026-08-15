import dayjs from "dayjs";
import i18n from "@/core/i18n";
import type {
  Subscription,
  UpcomingSubscription,
} from "@/features/Subscriptions/interfaces/Subscription.interface";

/** Domain-specific formatting — anything that knows what a Subscription is. */

export const formatStatusLabel = (value?: string): string => {
  if (!value) return i18n.t("common.unknown", "Unknown");
  const key = `common.status.${value.toLowerCase()}`;
  const translated = i18n.t(key);
  if (translated !== key) return translated;
  return value.charAt(0).toUpperCase() + value.slice(1);
};

export const formatMaskedPaymentMethod = (value?: string): string => {
  if (!value) return i18n.t("common.notProvided", "Not provided");
  const lastFourDigits = value.match(/\d{4}(?!.*\d)/)?.[0];
  return lastFourDigits ? `*****${lastFourDigits}` : value;
};

export const formatRenewalCycle = (renewalDate?: string): string => {
  if (!renewalDate) return i18n.t("common.notProvided", "Not provided");
  const target = dayjs(renewalDate);
  if (!target.isValid()) return i18n.t("common.notProvided", "Not provided");

  const now = dayjs();
  if (target.isBefore(now, "day")) return i18n.t("common.overdue", "Overdue");

  const months = target.diff(now, "month");
  if (months <= 0) return i18n.t("common.thisMonth", "This month");
  return i18n.t("common.month", { count: months });
};

export const isYearly = (subscription: Pick<Subscription, "billing" | "frequency">) =>
  subscription.billing === "Yearly" || subscription.frequency === "Yearly";

/** The soonest future renewal across all active subscriptions, if any. */
export const getNextRenewalDate = (
  subscriptions: Subscription[],
): string | undefined => {
  const now = dayjs().startOf("day");

  return subscriptions
    .filter((subscription) => subscription.status !== "cancelled")
    .map((subscription) => subscription.renewalDate)
    .filter((date): date is string => Boolean(date) && dayjs(date).isValid())
    .filter((date) => !dayjs(date).isBefore(now, "day"))
    .sort((a, b) => dayjs(a).valueOf() - dayjs(b).valueOf())[0];
};

/**
 * Upcoming renewals are a projection over the subscription list, not a separate
 * resource — deriving them keeps the rail truthful when a subscription is added
 * or cancelled.
 */
export const deriveUpcoming = (
  subscriptions: Subscription[],
  withinDays = 30,
): UpcomingSubscription[] => {
  const now = dayjs().startOf("day");

  return subscriptions
    .filter((subscription) => subscription.status !== "cancelled")
    .flatMap((subscription) => {
      if (!subscription.renewalDate) return [];

      const renewal = dayjs(subscription.renewalDate).startOf("day");
      if (!renewal.isValid()) return [];

      const daysLeft = renewal.diff(now, "day");
      if (daysLeft < 0 || daysLeft > withinDays) return [];

      return [
        {
          id: subscription.id,
          icon: subscription.icon,
          name: subscription.name,
          price: subscription.price,
          currency: subscription.currency,
          daysLeft,
        },
      ];
    })
    .sort((a, b) => a.daysLeft - b.daysLeft);
};
