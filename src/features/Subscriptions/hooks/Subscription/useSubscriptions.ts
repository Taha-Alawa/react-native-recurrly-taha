import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { usePostHog } from "posthog-react-native";
import type { ScreenMenuAction } from "@/core/components/Navigation/ScreenMenuSheet";
import dialogStore from "@/core/store/dialogStore";
import feedbackService from "@/core/services/feedbackService";
import SubscriptionService from "@/features/Subscriptions/services/SubscriptionService";
import subscriptionCache from "@/features/Subscriptions/hooks/Subscription/subscriptionCache";
import { deriveUpcoming } from "@/features/Subscriptions/utils/subscriptionFormatters";
import type { Subscription } from "@/features/Subscriptions/interfaces/Subscription.interface";

export const CANCEL_SUBSCRIPTION_DIALOG = "deleteSubscription";

export type CancelDialogPayload = {
  disabled: boolean;
  data: Subscription;
};

/**
 * List hook for the subscription entity (architecture §4.3a).
 *
 * Owns row state, the client-side filter, loading, the fetch, every row action
 * handler, and the cancel-confirmation flow. Screens destructure this and
 * render — they hold no state and make no decisions of their own.
 */
export const useSubscriptions = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const posthog = usePostHog();
  const { items, isLoading, isLoaded } = subscriptionCache.useStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [hideCancelled, setHideCancelled] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);

  /* ---------------------------------------------------------------- fetch */

  const fetchSubscriptions = useCallback(async () => {
    subscriptionCache.setLoading(true);
    const result = await SubscriptionService.list();

    if (result.success) {
      subscriptionCache.setItems(result.data);
      return;
    }

    subscriptionCache.setLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoaded) void fetchSubscriptions();
  }, [isLoaded, fetchSubscriptions]);

  /* --------------------------------------------------------------- derived */

  const filteredSubscriptions = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();

    return items
      .filter((item) => !hideCancelled || item.status !== "cancelled")
      .filter((item) => {
        if (!normalized) return true;
        return [item.name, item.category, item.plan]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(normalized));
      });
  }, [items, searchQuery, hideCancelled]);

  const upcomingSubscriptions = useMemo(() => deriveUpcoming(items), [items]);

  /* --------------------------------------------------------------- actions */

  const handleToggleExpand = useCallback(
    (subscription: Subscription) => {
      const isExpanding = expandedId !== subscription.id;
      setExpandedId(isExpanding ? subscription.id : null);

      if (isExpanding) {
        posthog.capture("subscription_expanded", {
          subscription_id: subscription.id,
          subscription_name: subscription.name,
        });
      }
    },
    [expandedId, posthog],
  );

  const handleCreatePress = useCallback(() => {
    dialogStore.open("addSubscription", "add");
  }, []);

  /** Opens the confirm sheet unlocked, carrying the row (architecture §5). */
  const handleCancelPress = useCallback((subscription: Subscription) => {
    dialogStore.open<CancelDialogPayload>(
      CANCEL_SUBSCRIPTION_DIALOG,
      "delete",
      { disabled: false, data: subscription },
    );
  }, []);

  /** Re-opens locked while the request runs, then closes and refetches. */
  const handleConfirmCancel = useCallback(
    async (subscription: Subscription) => {
      dialogStore.open<CancelDialogPayload>(
        CANCEL_SUBSCRIPTION_DIALOG,
        "delete",
        { disabled: true, data: subscription },
      );

      const result = await SubscriptionService.cancel(subscription.id);
      dialogStore.close(CANCEL_SUBSCRIPTION_DIALOG);

      if (!result.success) return;

      // Reflect the new status before the refetch lands.
      subscriptionCache.patchItems((items) =>
        items.map((item) =>
          item.id === subscription.id
            ? { ...item, status: "cancelled" as const }
            : item,
        ),
      );

      setExpandedId((current) =>
        current === subscription.id ? null : current,
      );
      posthog.capture("subscription_cancelled", {
        subscription_id: subscription.id,
        subscription_name: subscription.name,
      });
      feedbackService.show(
        "success",
        t("subscriptions.cancelSuccess", "Subscription cancelled."),
      );

      await fetchSubscriptions();
    },
    [fetchSubscriptions, posthog, t],
  );

  const toggleHideCancelled = useCallback(() => {
    setHideCancelled((current) => !current);
  }, []);

  /* ------------------------------------------------------------ screen menu */

  const menuActions: ScreenMenuAction[] = useMemo(
    () => [
      {
        key: "add-subscription",
        label: t("subscriptions.menu.addSubscription", "Add subscription"),
        onPress: handleCreatePress,
      },
      {
        key: "toggle-cancelled",
        label: hideCancelled
          ? t("subscriptions.menu.showCancelled", "Show cancelled")
          : t("subscriptions.menu.hideCancelled", "Hide cancelled"),
        onPress: toggleHideCancelled,
      },
      {
        key: "go-to-insights",
        label: t("subscriptions.menu.goToInsights", "View dashboard"),
        onPress: () => router.push("/insights"),
      },
    ],
    [handleCreatePress, hideCancelled, router, t, toggleHideCancelled],
  );

  return {
    subscriptions: items,
    filteredSubscriptions,
    upcomingSubscriptions,
    isLoading,
    searchQuery,
    setSearchQuery,
    expandedId,
    hideCancelled,
    toggleHideCancelled,
    fetchSubscriptions,
    handleToggleExpand,
    handleCreatePress,
    handleCancelPress,
    handleConfirmCancel,
    isMenuOpen,
    openMenu: () => setMenuOpen(true),
    closeMenu: () => setMenuOpen(false),
    menuActions,
  };
};

export default useSubscriptions;
