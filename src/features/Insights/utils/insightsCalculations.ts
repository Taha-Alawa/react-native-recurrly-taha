import dayjs, { type Dayjs } from "dayjs";
import type { Subscription } from "@/features/Subscriptions/interfaces/Subscription.interface";
import { isYearly } from "@/features/Subscriptions/utils/subscriptionFormatters";
import type { Transaction } from "@/features/Transactions/interfaces/Transaction.interface";

/**
 * Everything the dashboard reports, derived from the two collections the app
 * already holds. Nothing here is stored: a figure that disagreed with the
 * transactions it came from would be worse than no figure at all.
 */

export type PeriodMode = "year" | "month";

export interface PeriodWindow {
  mode: PeriodMode;
  /** 0 = the current year/month, negative = further back. */
  offset: number;
  start: Dayjs;
  end: Dayjs;
  isCurrent: boolean;
  /** "2026", or "March 2026" in month mode. */
  label: string;
}

export const buildPeriodWindow = (
  mode: PeriodMode,
  offset: number,
): PeriodWindow => {
  const unit = mode === "year" ? "year" : "month";
  const anchor = dayjs().add(offset, unit);

  return {
    mode,
    offset,
    start: anchor.startOf(unit),
    end: anchor.endOf(unit),
    isCurrent: offset === 0,
    label: mode === "year" ? anchor.format("YYYY") : anchor.format("MMMM YYYY"),
  };
};

export const filterByPeriod = (
  transactions: Transaction[],
  window: PeriodWindow,
): Transaction[] =>
  transactions.filter((transaction) => {
    const movedAt = dayjs(transaction.date);
    return (
      movedAt.isValid() &&
      !movedAt.isBefore(window.start) &&
      !movedAt.isAfter(window.end)
    );
  });

/* -------------------------------------------------------------------------- */
/* Cash flow over the period                                                   */
/* -------------------------------------------------------------------------- */

export interface CashflowBucket {
  key: string;
  /** Short axis label — one letter per month, or a day range. */
  label: string;
  /** Spelled out, shown when the column is selected. */
  fullLabel: string;
  income: number;
  outcome: number;
  net: number;
  /** The bucket containing today. */
  isCurrent: boolean;
  /**
   * Whether the bucket has begun. A year's remaining months are real columns
   * with nothing in them yet — counting them would drag every average down.
   */
  hasElapsed: boolean;
}

type BucketRange = Pick<CashflowBucket, "key" | "label" | "fullLabel"> & {
  start: Dayjs;
  end: Dayjs;
};

/**
 * A year splits into twelve months. A month splits into seven-day blocks rather
 * than days: thirty-one columns of paired bars is unreadable at phone width,
 * and the question at that zoom is which part of the month was expensive.
 */
const buildBucketRanges = (window: PeriodWindow): BucketRange[] => {
  if (window.mode === "year") {
    return Array.from({ length: 12 }, (_, index) => {
      const month = window.start.add(index, "month");

      return {
        key: month.format("YYYY-MM"),
        label: month.format("MMM").charAt(0),
        fullLabel: month.format("MMMM YYYY"),
        start: month.startOf("month"),
        end: month.endOf("month"),
      };
    });
  }

  const daysInMonth = window.start.daysInMonth();
  const ranges: BucketRange[] = [];

  for (let day = 1; day <= daysInMonth; day += 7) {
    const lastDay = Math.min(day + 6, daysInMonth);
    const start = window.start.date(day).startOf("day");
    const end = window.start.date(lastDay).endOf("day");

    ranges.push({
      key: start.format("YYYY-MM-DD"),
      label: `${day}–${lastDay}`,
      fullLabel: `${start.format("MMM D")} – ${end.format("D")}`,
      start,
      end,
    });
  }

  return ranges;
};

export const buildCashflowBuckets = (
  transactions: Transaction[],
  window: PeriodWindow,
): CashflowBucket[] => {
  const now = dayjs();

  return buildBucketRanges(window).map((range) => {
    const inRange = transactions.filter((transaction) => {
      const movedAt = dayjs(transaction.date);
      return (
        movedAt.isValid() &&
        !movedAt.isBefore(range.start) &&
        !movedAt.isAfter(range.end)
      );
    });

    const income = inRange
      .filter((transaction) => transaction.type === "income")
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    const outcome = inRange
      .filter((transaction) => transaction.type === "outcome")
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    return {
      key: range.key,
      label: range.label,
      fullLabel: range.fullLabel,
      income,
      outcome,
      net: income - outcome,
      isCurrent: !now.isBefore(range.start) && !now.isAfter(range.end),
      hasElapsed: !range.start.isAfter(now),
    };
  });
};

/** Scales every bar in the chart. Never zero, so an empty period still draws. */
export const maxBucketValue = (buckets: CashflowBucket[]): number =>
  Math.max(1, ...buckets.map((bucket) => Math.max(bucket.income, bucket.outcome)));

/* -------------------------------------------------------------------------- */
/* Averages                                                                    */
/* -------------------------------------------------------------------------- */

export interface PeriodAverages {
  averageIncome: number;
  averageOutcome: number;
  /** null when no income was recorded — a percentage of nothing says nothing. */
  savingsRate: number | null;
  best: CashflowBucket | null;
  worst: CashflowBucket | null;
  /** How many buckets the averages divide by. */
  elapsedCount: number;
}

export const buildAverages = (buckets: CashflowBucket[]): PeriodAverages => {
  const elapsed = buckets.filter((bucket) => bucket.hasElapsed);
  const divisor = Math.max(1, elapsed.length);

  const income = elapsed.reduce((sum, bucket) => sum + bucket.income, 0);
  const outcome = elapsed.reduce((sum, bucket) => sum + bucket.outcome, 0);

  // Best and worst are only meaningful among buckets where something happened.
  // Without this an untouched month sits at a net of zero and wins "best" over
  // every month the user actually saved in.
  const active = elapsed.filter(
    (bucket) => bucket.income > 0 || bucket.outcome > 0,
  );
  const ranked = [...active].sort((a, b) => b.net - a.net);

  return {
    averageIncome: income / divisor,
    averageOutcome: outcome / divisor,
    savingsRate: income > 0 ? ((income - outcome) / income) * 100 : null,
    best: ranked[0] ?? null,
    worst: ranked.length > 1 ? ranked[ranked.length - 1] : null,
    elapsedCount: elapsed.length,
  };
};

/* -------------------------------------------------------------------------- */
/* Where the money went                                                        */
/* -------------------------------------------------------------------------- */

export interface SpendingEntry {
  key: string;
  name: string;
  total: number;
  count: number;
  /** Fraction of all money out in the period, 0–1. */
  share: number;
}

/**
 * Outcome grouped by name. Subscription payments are included rather than split
 * out — this answers "where did it go", and a subscription is somewhere it went.
 * The subscription sections below answer the separate question of commitment.
 */
export const buildTopSpending = (
  transactions: Transaction[],
  limit = 5,
): SpendingEntry[] => {
  const outcome = transactions.filter(
    (transaction) => transaction.type === "outcome",
  );
  const total = outcome.reduce((sum, transaction) => sum + transaction.amount, 0);

  const grouped = new Map<string, SpendingEntry>();

  outcome.forEach((transaction) => {
    const key = transaction.name.trim().toLowerCase() || "—";
    const existing = grouped.get(key);

    if (existing) {
      existing.total += transaction.amount;
      existing.count += 1;
      return;
    }

    grouped.set(key, {
      key,
      name: transaction.name.trim(),
      total: transaction.amount,
      count: 1,
      share: 0,
    });
  });

  return [...grouped.values()]
    .map((entry) => ({
      ...entry,
      share: total > 0 ? entry.total / total : 0,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
};

/* -------------------------------------------------------------------------- */
/* Subscription commitment                                                     */
/* -------------------------------------------------------------------------- */

export interface SubscriptionCost {
  id: string;
  name: string;
  iconKey: Subscription["iconKey"];
  icon: Subscription["icon"];
  category?: string;
  annual: number;
  monthly: number;
  /** Fraction of the total annual commitment, 0–1. */
  share: number;
}

const isActive = (subscription: Subscription) =>
  subscription.status !== "cancelled";

/** Yearly plans stay as they are; monthly ones are multiplied out to compare. */
export const buildSubscriptionCosts = (
  subscriptions: Subscription[],
): SubscriptionCost[] => {
  const active = subscriptions.filter(isActive);
  const total = active.reduce(
    (sum, subscription) =>
      sum + (isYearly(subscription) ? subscription.price : subscription.price * 12),
    0,
  );

  return active
    .map((subscription) => {
      const annual = isYearly(subscription)
        ? subscription.price
        : subscription.price * 12;

      return {
        id: subscription.id,
        name: subscription.name,
        iconKey: subscription.iconKey,
        icon: subscription.icon,
        category: subscription.category,
        annual,
        monthly: annual / 12,
        share: total > 0 ? annual / total : 0,
      };
    })
    .sort((a, b) => b.annual - a.annual);
};

export interface CategoryShare {
  key: string;
  category: string;
  total: number;
  /** Fraction of the total annual commitment, 0–1. */
  share: number;
}

export const buildCategoryShares = (costs: SubscriptionCost[]): CategoryShare[] => {
  const total = costs.reduce((sum, cost) => sum + cost.annual, 0);
  const grouped = new Map<string, CategoryShare>();

  costs.forEach((cost) => {
    const category = cost.category?.trim() || "Other";
    const existing = grouped.get(category);

    if (existing) {
      existing.total += cost.annual;
      return;
    }

    grouped.set(category, { key: category, category, total: cost.annual, share: 0 });
  });

  return [...grouped.values()]
    .map((entry) => ({
      ...entry,
      share: total > 0 ? entry.total / total : 0,
    }))
    .sort((a, b) => b.total - a.total);
};

export interface Commitment {
  /** Every active subscription, multiplied out to a year. */
  annual: number;
  monthly: number;
  activeCount: number;
  /** What the selected period commits to — a year of it, or a month. */
  committed: number;
  /** Subscription payments actually recorded in the period. */
  paid: number;
  remaining: number;
  /**
   * True when the period holds no recorded payments at all. The committed
   * figure is then a projection from today's prices, not money that moved, and
   * the card says so rather than implying a bill was settled.
   */
  isProjection: boolean;
}

export const buildCommitment = (
  costs: SubscriptionCost[],
  periodTransactions: Transaction[],
  window: PeriodWindow,
): Commitment => {
  const annual = costs.reduce((sum, cost) => sum + cost.annual, 0);
  const monthly = annual / 12;
  const committed = window.mode === "year" ? annual : monthly;

  const paid = periodTransactions
    .filter(
      (transaction) =>
        transaction.type === "outcome" && transaction.origin === "subscription",
    )
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  return {
    annual,
    monthly,
    activeCount: costs.length,
    committed,
    paid,
    remaining: Math.max(0, committed - paid),
    isProjection: paid === 0 && committed > 0,
  };
};
