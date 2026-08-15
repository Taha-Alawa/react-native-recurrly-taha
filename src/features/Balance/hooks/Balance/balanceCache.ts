import { createStore } from "@/core/store/createStore";
import authStore from "@/core/store/authStore";

/**
 * Single cached copy of the balance, shared by every screen that shows it.
 * Starts at zero — the real figure is whatever Firestore holds.
 */
export const balanceCache = createStore<{
  amount: number;
  isLoading: boolean;
  isLoaded: boolean;
}>({
  amount: 0,
  isLoading: false,
  isLoaded: false,
});

/** Re-read from Firestore when the signed-in user changes — see subscriptionCache. */
let lastUserId = authStore.getState().userId;

authStore.subscribe(() => {
  const { userId } = authStore.getState();
  if (userId === lastUserId) return;

  lastUserId = userId;
  balanceCache.setState({ amount: 0, isLoaded: false });
});

export default balanceCache;
