import dayjs, { type Dayjs } from "dayjs";
import type {
  Transaction,
  TransactionTotals,
} from "@/features/Transactions/interfaces/Transaction.interface";

/**
 * One calendar month.
 *
 * Calendar months rather than a rolling thirty days: a month is the unit
 * salaries, rent and subscriptions already run on, so its totals line up with
 * the bills they describe. A rolling window would cut across those and report a
 * figure that matches no statement the user will ever see.
 */
export interface MonthWindow {
  /** 0 = the current month, negative = further back. */
  offset: number;
  start: Dayjs;
  end: Dayjs;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  /** "September 2026". */
  label: string;
}

export const buildMonthWindow = (offset: number): MonthWindow => {
  const anchor = dayjs().add(offset, "month");
  const start = anchor.startOf("month");
  const end = anchor.endOf("month");

  return {
    offset,
    start,
    end,
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    isCurrent: offset === 0,
    label: anchor.format("MMMM YYYY"),
  };
};

export const filterByWindow = (
  transactions: Transaction[],
  window: MonthWindow,
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
