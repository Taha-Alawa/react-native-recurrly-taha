import dayjs, { type Dayjs } from "dayjs";
import type {
  Transaction,
  TransactionTotals,
} from "@/features/Transactions/interfaces/Transaction.interface";

export const WEEK_LENGTH = 7;

/**
 * A seven-day window anchored on today, not on a calendar week.
 *
 * Offset 0 is "today and the past six days"; offset -1 is the seven days
 * before that, and so on. Anchoring on today means the default view always
 * ends on the current day rather than on a Sunday the user has not reached.
 */
export interface WeekWindow {
  /** 0 = the current window, negative = further back. */
  offset: number;
  start: Dayjs;
  end: Dayjs;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export const buildWeekWindow = (offset: number): WeekWindow => {
  const end = dayjs()
    .add(offset * WEEK_LENGTH, "day")
    .endOf("day");
  const start = end.subtract(WEEK_LENGTH - 1, "day").startOf("day");

  return {
    offset,
    start,
    end,
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    isCurrent: offset === 0,
  };
};

export const filterByWindow = (
  transactions: Transaction[],
  window: WeekWindow,
): Transaction[] =>
  transactions.filter((transaction) => {
    const movedAt = dayjs(transaction.date);
    return (
      movedAt.isValid() &&
      !movedAt.isBefore(window.start) &&
      !movedAt.isAfter(window.end)
    );
  });

export const sortByDateDesc = (transactions: Transaction[]): Transaction[] =>
  [...transactions].sort(
    (a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf(),
  );

/**
 * Subscription payments are counted inside `outcome` and reported again in
 * `subscriptions`: one is the whole, the other names the part of it that was
 * not discretionary. Adding them together would double-count.
 */
export const calculateTotals = (
  transactions: Transaction[],
): TransactionTotals => {
  const totals = transactions.reduce<Omit<TransactionTotals, "net">>(
    (accumulator, transaction) => {
      if (transaction.type === "income") {
        return { ...accumulator, income: accumulator.income + transaction.amount };
      }

      return {
        ...accumulator,
        outcome: accumulator.outcome + transaction.amount,
        subscriptions:
          accumulator.subscriptions +
          (transaction.origin === "subscription" ? transaction.amount : 0),
      };
    },
    { income: 0, outcome: 0, subscriptions: 0 },
  );

  return { ...totals, net: totals.income - totals.outcome };
};

/**
 * Signed sum over every transaction — the amount the starting balance has
 * moved by since it was set. Balance reads this; nothing else should need it.
 */
export const sumNet = (transactions: Transaction[]): number =>
  transactions.reduce(
    (sum, transaction) =>
      sum +
      (transaction.type === "income" ? transaction.amount : -transaction.amount),
    0,
  );
