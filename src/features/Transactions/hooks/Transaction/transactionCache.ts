import { createResourceStore } from "@/core/store/createResourceStore";
import authStore from "@/core/store/authStore";
import type { Transaction } from "@/features/Transactions/interfaces/Transaction.interface";

/**
 * The single cached copy of the user's transactions. The Transactions screen
 * reads it for the week view, and Balance reads it to derive the current
 * balance — so a payment recorded anywhere moves the balance everywhere.
 */
export const transactionCache = createResourceStore<Transaction>();

/** Re-read when the signed-in user changes — see subscriptionCache. */
let lastUserId = authStore.getState().userId;

authStore.subscribe(() => {
  const { userId } = authStore.getState();
  if (userId === lastUserId) return;

  lastUserId = userId;
  transactionCache.reset();
});

export default transactionCache;
