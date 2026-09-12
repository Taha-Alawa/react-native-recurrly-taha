import dayjs from "dayjs";
import i18n from "@/core/i18n";
import type {
  BillingCycle,
  Subscription,
  UpcomingSubscription,
} from "@/features/Subscriptions/interfaces/Subscription.interface";

/** Domain-specific formatting — anything that knows what a Subscription is. */

/**
 * How close a renewal has to be before it can be paid from the Upcoming rail.
 * Anything already due or overdue is payable regardless.
 */
export const PAYABLE_WITHIN_DAYS = 3;

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

export const getBillingCycle = (
  subscription: Pick<Subscription, "billing" | "frequency">,
): BillingCycle => (isYearly(subscription) ? "Yearly" : "Monthly");

/**
 * The renewal date one cycle on from the current one.
 *
 * Counted from the existing renewal date rather than from today, so a
 * subscription paid late keeps its original billing day instead of drifting
 * forward by however long the user took to pay it. A payment covers exactly one
 * cycle: a subscription several cycles overdue stays payable until it is caught
 * up, which is the truth of the matter.
 */
export const advanceRenewalDate = (subscription: Subscription): string => {
  const current = dayjs(subscription.renewalDate);
  const base = current.isValid() ? current : dayjs();

  return base
    .add(1, isYearly(subscription) ? "year" : "month")
    .toISOString();
};

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
 *
 * Overdue renewals are included rather than filtered out: a renewal the user
 * has not paid is the one they most need to see, and hiding it would leave no
 * way to record the payment. They sort first, with a negative `daysLeft`.
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
      if (daysLeft > withinDays) return [];

      return [
        {
          id: subscription.id,
          icon: subscription.icon,
          iconKey: subscription.iconKey,
          name: subscription.name,
          price: subscription.price,
          currency: subscription.currency,
          daysLeft,
          isOverdue: daysLeft < 0,
          isPayable: daysLeft <= PAYABLE_WITHIN_DAYS,
        },
      ];
    })
    .sort((a, b) => a.daysLeft - b.daysLeft);
};
