import { icons, type IconKey } from "@/core/constants/icons";
import type {
  Subscription,
  SubscriptionDocument,
} from "@/features/Subscriptions/interfaces/Subscription.interface";

const FALLBACK_ICON: IconKey = "wallet";

export const resolveIcon = (iconKey?: string) =>
  icons[(iconKey as IconKey) in icons ? (iconKey as IconKey) : FALLBACK_ICON];

/** Server document -> UI entity. */
export const toSubscription = (
  id: string,
  document: SubscriptionDocument,
): Subscription => ({
  ...document,
  id,
  icon: resolveIcon(document.iconKey),
});

/** UI entity -> server document. Strips everything Firestore cannot store. */
export const toSubscriptionDocument = (
  subscription: Subscription,
): SubscriptionDocument => {
  const { id, icon, ...document } = subscription;
  void id;
  void icon;

  // Firestore rejects `undefined`; omit those keys entirely.
  return Object.fromEntries(
    Object.entries(document).filter(([, value]) => value !== undefined),
  ) as unknown as SubscriptionDocument;
};
