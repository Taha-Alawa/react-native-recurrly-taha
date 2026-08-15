import dayjs from "dayjs";
import type { DateRange } from "@/core/components/Inputs/DateRangePicker";
import type { Subscription } from "@/features/Subscriptions/interfaces/Subscription.interface";
import { isYearly } from "@/features/Subscriptions/utils/subscriptionFormatters";

export type WeekdayTotal = {
  key: string;
  label: string;
  total: number;
  isToday: boolean;
};

const isActive = (subscription: Subscription) =>
  subscription.status !== "cancelled";

/** Spend per weekday for the current Monday-first week. */
export const buildWeekTotals = (
  subscriptions: Subscription[],
  weekdayLabels: string[],
): WeekdayTotal[] => {
  const startOfWeek = dayjs()
    .subtract((dayjs().day() + 6) % 7, "day")
    .startOf("day");

  return Array.from({ length: 7 }).map((_, index) => {
    const date = startOfWeek.add(index, "day");

    const total = subscriptions
      .filter(isActive)
      .filter((subscription) =>
        subscription.renewalDate
          ? dayjs(subscription.renewalDate).isSame(date, "day")
          : false,
      )
      .reduce((sum, subscription) => sum + subscription.price, 0);

    return {
      key: date.format("YYYY-MM-DD"),
      label: weekdayLabels[index],
      total,
      isToday: date.isSame(dayjs(), "day"),
    };
  });
};

/** Yearly plans are amortised so the figure is comparable month to month. */
export const calculateMonthlyExpenses = (subscriptions: Subscription[]): number =>
  subscriptions
    .filter(isActive)
    .reduce(
      (sum, subscription) =>
        sum +
        (isYearly(subscription) ? subscription.price / 12 : subscription.price),
      0,
    );

export const buildHistory = (subscriptions: Subscription[]): Subscription[] =>
  [...subscriptions]
    .filter((subscription) => subscription.startDate)
    .sort(
      (a, b) => dayjs(b.startDate).valueOf() - dayjs(a.startDate).valueOf(),
    );

export const filterHistoryByRange = (
  history: Subscription[],
  range: DateRange | null,
): Subscription[] => {
  if (!range) return history;

  const rangeStart = dayjs(range.startDate);
  const rangeEnd = dayjs(range.endDate);

  return history.filter((subscription) => {
    const startedAt = dayjs(subscription.startDate);
    return (
      startedAt.isValid() &&
      !startedAt.isBefore(rangeStart) &&
      !startedAt.isAfter(rangeEnd)
    );
  });
};
