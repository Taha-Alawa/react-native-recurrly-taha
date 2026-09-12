import type { ImageSourcePropType } from "react-native";
import type { IconKey } from "@/core/constants/icons";

/** Money in, or money out. The sign lives here, never in `amount`. */
export type TransactionType = "income" | "outcome";

/**
 * How the row came to exist. A subscription payment is an outcome like any
 * other, but the totals card reports it separately, so the two are told apart
 * by origin rather than by guessing from the name.
 */
export type TransactionOrigin = "manual" | "subscription";

/** Server shape — exactly what a Firestore document holds. */
export interface TransactionDocument {
  type: TransactionType;
  /** Where it came from ("Salary") or what it went on ("Supermarket"). */
  name: string;
  /** Always positive; `type` carries the direction. */
  amount: number;
  currency: string;
  /** When the money moved — not when the row was written. */
  date: string;
  origin: TransactionOrigin;
  /** Set only when `origin` is "subscription". */
  subscriptionId?: string;
  iconKey: IconKey;
  createdAt: string;
}

/** Entity the UI consumes — id attached, icon resolved to a bundled asset. */
export interface Transaction extends TransactionDocument {
  id: string;
  icon: ImageSourcePropType;
}

/** Everything the totals card reports, over one date window. */
export interface TransactionTotals {
  income: number;
  /** All money out, subscription payments included. */
  outcome: number;
  /** The subscription-paid portion of `outcome`. */
  subscriptions: number;
  /** income − outcome. Negative when the window was a net spend. */
  net: number;
}
