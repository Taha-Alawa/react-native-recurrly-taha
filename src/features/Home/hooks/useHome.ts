import { useCallback, useMemo } from "react";
import { useRouter } from "expo-router";
import authStore from "@/core/store/authStore";
import { getDisplayName } from "@/core/utils/formatters";
import useBalance from "@/features/Balance/hooks/Balance/useBalance";
import useSubscriptions from "@/features/Subscriptions/hooks/Subscription/useSubscriptions";
import { getNextRenewalDate } from "@/features/Subscriptions/utils/subscriptionFormatters";

/**
 * Composition hook for the dashboard.
 *
 * Home is a composition feature: it owns no entity of its own, it arranges the
 * public hooks of Balance and Subscriptions. This is the same allowance §1
 * grants layouts for embedded widgets — see ARCHITECTURE.md for the deviation
 * note.
 */
export const useHome = () => {
  const user = authStore.useStore();
  const router = useRouter();

  const balance = useBalance();
  const subscriptions = useSubscriptions();

  const refreshAll = useCallback(async () => {
    await Promise.all([balance.fetchBalance(), subscriptions.fetchSubscriptions()]);
  }, [balance, subscriptions]);

  const nextRenewalDate = useMemo(
    () => getNextRenewalDate(subscriptions.subscriptions),
    [subscriptions.subscriptions],
  );

  return {
    user,
    displayName: getDisplayName(user),
    avatarUri: user.photoURL,

    balanceAmount: balance.amount,
    nextRenewalDate,
    onEditBalance: balance.handleEditPress,
    refreshBalance: balance.fetchBalance,

    subscriptions: subscriptions.subscriptions,
    upcomingSubscriptions: subscriptions.upcomingSubscriptions,
    expandedId: subscriptions.expandedId,
    onToggleExpand: subscriptions.handleToggleExpand,
    onCreatePress: subscriptions.handleCreatePress,
    refreshSubscriptions: subscriptions.fetchSubscriptions,

    onViewAllSubscriptions: () => router.push("/subscriptions"),
    refreshAll,
  };
};

export default useHome;
