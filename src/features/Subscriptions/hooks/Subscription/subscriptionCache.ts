import { createResourceStore } from "@/core/store/createResourceStore";
import authStore from "@/core/store/authStore";
import type { Subscription } from "@/features/Subscriptions/interfaces/Subscription.interface";

/**
 * The single cached copy of the user's subscriptions. Home, Subscriptions and
 * Insights all read it, so a mutation on one screen is visible on the others
 * without any cross-feature imports.
 */
export const subscriptionCache = createResourceStore<Subscription>();

/**
 * Reset whenever the signed-in user changes — on sign-in so the list hook's
 * `!isLoaded` guard fires and pulls that user's rows, and on sign-out so one
 * account's data can never be shown to the next.
 */
let lastUserId = authStore.getState().userId;

authStore.subscribe(() => {
  const { userId } = authStore.getState();
  if (userId === lastUserId) return;

  lastUserId = userId;
  subscriptionCache.reset();
});

export default subscriptionCache;
