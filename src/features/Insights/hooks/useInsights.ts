import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { usePostHog } from "posthog-react-native";
import type { ScreenMenuAction } from "@/core/components/Navigation/ScreenMenuSheet";
import useSubscriptions from "@/features/Subscriptions/hooks/Subscription/useSubscriptions";
import useTransactionsCache from "@/features/Transactions/hooks/Transaction/useTransactionsCache";
import { calculateTotals } from "@/features/Transactions/utils/transactionCalculations";
import {
  buildAverages,
  buildCashflowBuckets,
  buildCategoryShares,
  buildCommitment,
  buildPeriodWindow,
  buildSubscriptionCosts,
  buildTopSpending,
  filterByPeriod,
  maxBucketValue,
  type PeriodMode,
} from "@/features/Insights/utils/insightsCalculations";

/**
 * The dashboard owns no entity — it is a read-only projection over the
 * Subscriptions and Transactions features, consumed through their public hooks.
 */
export const useInsights = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const posthog = usePostHog();
  const { subscriptions } = useSubscriptions();
  const { transactions, isLoading } = useTransactionsCache();

  const [mode, setMode] = useState<PeriodMode>("year");
  const [offset, setOffset] = useState(0);
  const [selectedBucketKey, setSelectedBucketKey] = useState<string | null>(null);
  const [isMenuOpen, setMenuOpen] = useState(false);

  /* --------------------------------------------------------------- derived */

  const period = useMemo(() => buildPeriodWindow(mode, offset), [mode, offset]);

  const periodTransactions = useMemo(
    () => filterByPeriod(transactions, period),
    [transactions, period],
  );

  const totals = useMemo(
    () => calculateTotals(periodTransactions),
    [periodTransactions],
  );

  const buckets = useMemo(
    () => buildCashflowBuckets(periodTransactions, period),
    [periodTransactions, period],
  );

  const maxBucket = useMemo(() => maxBucketValue(buckets), [buckets]);
  const averages = useMemo(() => buildAverages(buckets), [buckets]);

  const topSpending = useMemo(
    () => buildTopSpending(periodTransactions),
    [periodTransactions],
  );

  const subscriptionCosts = useMemo(
    () => buildSubscriptionCosts(subscriptions),
    [subscriptions],
  );

  const categoryShares = useMemo(
    () => buildCategoryShares(subscriptionCosts),
    [subscriptionCosts],
  );

  const commitment = useMemo(
    () => buildCommitment(subscriptionCosts, periodTransactions, period),
    [subscriptionCosts, periodTransactions, period],
  );

  /**
   * The chart opens on the bucket containing today when there is one, so the
   * detail line above it says something on arrival instead of asking for a tap.
   */
  const selectedBucket = useMemo(() => {
    if (selectedBucketKey) {
      const chosen = buckets.find((bucket) => bucket.key === selectedBucketKey);
      if (chosen) return chosen;
    }

    return buckets.find((bucket) => bucket.isCurrent) ?? null;
  }, [buckets, selectedBucketKey]);

  /* ------------------------------------------------------------ navigation */

  const changeMode = useCallback(
    (next: PeriodMode) => {
      if (next === mode) return;

      // A year offset means nothing as a month offset — land on the current
      // period rather than 3 months ago because the user was 3 years back.
      setMode(next);
      setOffset(0);
      setSelectedBucketKey(null);
      posthog.capture("dashboard_mode_changed", { mode: next });
    },
    [mode, posthog],
  );

  const goToPrevious = useCallback(() => {
    setOffset((current) => current - 1);
    setSelectedBucketKey(null);
  }, []);

  /** Forward stops at the current period — there is nothing after today. */
  const goToNext = useCallback(() => {
    setOffset((current) => Math.min(0, current + 1));
    setSelectedBucketKey(null);
  }, []);

  const goToCurrent = useCallback(() => {
    setOffset(0);
    setSelectedBucketKey(null);
  }, []);

  const selectBucket = useCallback((key: string) => {
    setSelectedBucketKey((current) => (current === key ? null : key));
  }, []);

  /* ------------------------------------------------------------ screen menu */

  const menuActions: ScreenMenuAction[] = useMemo(
    () => [
      {
        key: "toggle-mode",
        label:
          mode === "year"
            ? t("dashboard.menu.showMonth", "Switch to month view")
            : t("dashboard.menu.showYear", "Switch to year view"),
        onPress: () => changeMode(mode === "year" ? "month" : "year"),
      },
      {
        key: "jump-current",
        label:
          mode === "year"
            ? t("dashboard.menu.thisYear", "Jump to this year")
            : t("dashboard.menu.thisMonth", "Jump to this month"),
        onPress: goToCurrent,
        disabled: period.isCurrent,
      },
      {
        key: "go-to-transactions",
        label: t("dashboard.menu.goToTransactions", "View transactions"),
        onPress: () => router.push("/transactions"),
      },
      {
        key: "go-to-subscriptions",
        label: t("dashboard.menu.goToSubscriptions", "View subscriptions"),
        onPress: () => router.push("/subscriptions"),
      },
    ],
    [changeMode, goToCurrent, mode, period.isCurrent, router, t],
  );

  return {
    period,
    mode,
    changeMode,
    goToPrevious,
    goToNext,
    goToCurrent,

    isLoading,
    totals,
    buckets,
    maxBucket,
    selectedBucket,
    selectBucket,
    averages,
    topSpending,
    subscriptionCosts,
    categoryShares,
    commitment,

    isMenuOpen,
    openMenu: () => setMenuOpen(true),
    closeMenu: () => setMenuOpen(false),
    menuActions,
  };
};

export default useInsights;
