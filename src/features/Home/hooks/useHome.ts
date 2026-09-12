import { useCallback } from "react";
import { useRouter } from "expo-router";
import authStore from "@/core/store/authStore";
import { getDisplayName } from "@/core/utils/formatters";
import useBalance from "@/features/Balance/hooks/Balance/useBalance";
import useSubscriptions from "@/features/Subscriptions/hooks/Subscription/useSubscriptions";
import useTransactionsCache from "@/features/Transactions/hooks/Transaction/useTransactionsCache";
import useSubscriptionPayment from "@/features/Transactions/hooks/Transaction/useSubscriptionPayment";
import type { UpcomingSubscription } from "@/features/Subscriptions/interfaces/Subscription.interface";

/**
 * Composition hook for the dashboard.
 *
 * Home is a composition feature: it owns no entity of its own, it arranges the
 * public hooks of Balance, Subscriptions and Transactions. This is the same
 * allowance §1 grants layouts for embedded widgets — see ARCHITECTURE.md for
 * the deviation note.
 */
export const useHome = () => {
  const user = authStore.useStore();
  const router = useRouter();

  const balance = useBalance();
  const subscriptions = useSubscriptions();
  const { fetchTransactions } = useTransactionsCache();

  const refreshAll = useCallback(async () => {
    await Promise.all([
      balance.fetchBalance(),
      subscriptions.fetchSubscriptions(),
      fetchTransactions(),
    ]);
  }, [balance, fetchTransactions, subscriptions]);

  const payment = useSubscriptionPayment({ onRefresh: refreshAll });

  /**
   * The rail renders the projection, but paying needs the full subscription —
   * the renewal date has to move on by that row's own billing cycle.
   */
  const handlePayPress = useCallback(
    (upcoming: UpcomingSubscription) => {
      const subscription = subscriptions.subscriptions.find(
        (item) => item.id === upcoming.id,
      );
      if (subscription) payment.handlePayPress(subscription);
    },
    [payment, subscriptions.subscriptions],
  );

  return {
    user,
    displayName: getDisplayName(user),
    avatarUri: user.photoURL,

    balanceAmount: balance.amount,

    subscriptions: subscriptions.subscriptions,
    upcomingSubscriptions: subscriptions.upcomingSubscriptions,
    expandedId: subscriptions.expandedId,
    onToggleExpand: subscriptions.handleToggleExpand,
    onCreatePress: subscriptions.handleCreatePress,
    refreshSubscriptions: subscriptions.fetchSubscriptions,

    onPayPress: handlePayPress,
    isPayDialogOpen: payment.isPayDialogOpen,
    payPayload: payment.payPayload,
    onConfirmPay: payment.handleConfirmPay,
    closePayDialog: payment.closePayDialog,

    onViewAllSubscriptions: () => router.push("/subscriptions"),
    onViewTransactions: () => router.push("/transactions"),
    refreshAll,
  };
};

export default useHome;
