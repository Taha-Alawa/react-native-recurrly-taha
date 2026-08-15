import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { usePostHog } from "posthog-react-native";
import type { DateRange } from "@/core/components/Inputs/DateRangePicker";
import type { ScreenMenuAction } from "@/core/components/Navigation/ScreenMenuSheet";
import useSubscriptions from "@/features/Subscriptions/hooks/Subscription/useSubscriptions";
import {
  buildHistory,
  buildWeekTotals,
  calculateMonthlyExpenses,
  filterHistoryByRange,
} from "@/features/Insights/utils/insightsCalculations";

/**
 * Insights owns no entity — it is a read-only projection over the Subscriptions
 * feature, consumed through that feature's public list hook.
 */
export const useInsights = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const posthog = usePostHog();
  const { subscriptions } = useSubscriptions();

  const [historyRange, setHistoryRange] = useState<DateRange | null>(null);
  const [isRangePickerOpen, setRangePickerOpen] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);

  const weekdayLabels = t("insights.weekdays", {
    returnObjects: true,
  }) as string[];

  const weekDays = useMemo(
    () => buildWeekTotals(subscriptions, weekdayLabels),
    [subscriptions, weekdayLabels],
  );

  const maxWeekTotal = useMemo(
    () => Math.max(1, ...weekDays.map((day) => day.total)),
    [weekDays],
  );

  const monthlyExpenses = useMemo(
    () => calculateMonthlyExpenses(subscriptions),
    [subscriptions],
  );

  const history = useMemo(() => buildHistory(subscriptions), [subscriptions]);

  const filteredHistory = useMemo(
    () => filterHistoryByRange(history, historyRange),
    [history, historyRange],
  );

  const handleApplyRange = useCallback(
    (range: DateRange) => {
      setHistoryRange(range);
      posthog.capture("history_filtered", {
        start_date: range.startDate,
        end_date: range.endDate,
      });
    },
    [posthog],
  );

  const clearRange = useCallback(() => setHistoryRange(null), []);

  const menuActions: ScreenMenuAction[] = useMemo(
    () => [
      {
        key: "filter-history",
        label: t("insights.menu.filterHistory", "Filter history by date"),
        onPress: () => setRangePickerOpen(true),
      },
      {
        key: "clear-filter",
        label: t("insights.menu.clearFilter", "Clear date filter"),
        onPress: clearRange,
        disabled: !historyRange,
      },
      {
        key: "go-to-subscriptions",
        label: t("insights.menu.goToSubscriptions", "View subscriptions"),
        onPress: () => router.push("/subscriptions"),
      },
    ],
    [clearRange, historyRange, router, t],
  );

  return {
    weekDays,
    maxWeekTotal,
    monthlyExpenses,
    filteredHistory,
    historyRange,
    handleApplyRange,
    clearRange,
    isRangePickerOpen,
    openRangePicker: () => setRangePickerOpen(true),
    closeRangePicker: () => setRangePickerOpen(false),
    isMenuOpen,
    openMenu: () => setMenuOpen(true),
    closeMenu: () => setMenuOpen(false),
    menuActions,
  };
};

export default useInsights;
