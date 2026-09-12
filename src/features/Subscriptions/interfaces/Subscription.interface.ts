import type { ImageSourcePropType } from "react-native";
import type { IconKey } from "@/core/constants/icons";

export type SubscriptionStatus = "active" | "paused" | "cancelled";
export type BillingCycle = "Monthly" | "Yearly";

/**
 * Server shape — exactly what a Firestore document holds.
 *
 * Note `iconKey` rather than `icon`: bundled images are opaque numeric module
 * handles at runtime, so they cannot round-trip through a database. The key is
 * persisted and resolved back to an asset on read.
 */
export interface SubscriptionDocument {
  name: string;
  plan?: string;
  category?: string;
  paymentMethod?: string;
  status: SubscriptionStatus;
  startDate: string;
  price: number;
  currency: string;
  billing: BillingCycle;
  frequency?: BillingCycle;
  renewalDate?: string;
  color?: string;
  iconKey: IconKey;
}

/** Entity the UI consumes — id attached, icon resolved to a bundled asset. */
export interface Subscription extends SubscriptionDocument {
  id: string;
  icon: ImageSourcePropType;
}

/** Projection shown in the home screen's horizontal rail. */
export interface UpcomingSubscription {
  id: string;
  icon: ImageSourcePropType;
  name: string;
  price: number;
  currency?: string;
  /** Negative once the renewal date has passed. */
  daysLeft: number;
  isOverdue: boolean;
  /** Due, overdue, or close enough that the rail offers a Pay button. */
  isPayable: boolean;
}
