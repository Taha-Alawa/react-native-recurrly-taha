import { useCallback } from "react";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { usePostHog } from "posthog-react-native";
import useDialog from "@/core/hooks/useDialog";
import feedbackService from "@/core/services/feedbackService";
import SubscriptionService from "@/features/Subscriptions/services/SubscriptionService";
import subscriptionCache from "@/features/Subscriptions/hooks/Subscription/subscriptionCache";
import { CATEGORY_COLORS } from "@/features/Subscriptions/constants/subscriptionCategories";
import { toSubscription } from "@/features/Subscriptions/utils/subscriptionMappers";
import type { SubscriptionFormValues } from "@/features/Subscriptions/schemas/Subscription/SubscriptionSchema";
import type { Subscription } from "@/features/Subscriptions/interfaces/Subscription.interface";

export const ADD_SUBSCRIPTION_DIALOG = "addSubscription";
export const UPDATE_SUBSCRIPTION_DIALOG = "updateSubscription";

type SubscriptionDialogPayload = { data?: Subscription };

export type UseSubscriptionDialogOptions = {
  /** Supplied by the screen so the list refetches after a mutation. */
  onRefresh: () => void | Promise<void>;
};

const buildSubscription = (
  values: SubscriptionFormValues,
  existing?: Subscription | null,
): Subscription => {
  const name = values.name.trim();
  const price = Number(values.price.replace(",", "."));
  const startDate = existing?.startDate ? dayjs(existing.startDate) : dayjs();
  const renewalDate =
    values.frequency === "Yearly"
      ? startDate.add(1, "year")
      : startDate.add(1, "month");

  return toSubscription(
    existing?.id ??
      `${name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
    {
      iconKey: existing?.iconKey ?? "wallet",
      name,
      category: values.category,
      plan: existing?.plan,
      paymentMethod: existing?.paymentMethod,
      status: existing?.status ?? "active",
      startDate: startDate.toISOString(),
      price,
      currency: existing?.currency ?? "USD",
      billing: values.frequency,
      frequency: values.frequency,
      renewalDate: renewalDate.toISOString(),
      color: CATEGORY_COLORS[values.category] ?? CATEGORY_COLORS.Other,
    },
  );
};

/**
 * Dialog hook for the subscription entity (architecture §4.3c). Derives open
 * state from the global store and owns the create/update/close handlers — each
 * calls the service, emits feedback, closes, and refreshes the list.
 */
export const useSubscriptionDialog = ({
  onRefresh,
}: UseSubscriptionDialogOptions) => {
  const { t } = useTranslation();
  const posthog = usePostHog();

  const { isOpen, type, payload, close } = useDialog<SubscriptionDialogPayload>(
    ADD_SUBSCRIPTION_DIALOG,
    UPDATE_SUBSCRIPTION_DIALOG,
  );

  const data = payload?.data ?? null;

  const handleCreate = useCallback(
    async (values: SubscriptionFormValues) => {
      const subscription = buildSubscription(values);
      const result = await SubscriptionService.create(subscription);
      if (!result.success) return;

      // Patch the cache before refetching so the row appears immediately,
      // rather than after a Firestore round-trip the user has to wait out.
      subscriptionCache.patchItems((items) => [subscription, ...items]);

      posthog.capture("subscription_created", {
        subscription_id: subscription.id,
        subscription_name: subscription.name,
        subscription_category: subscription.category ?? null,
        subscription_price: subscription.price,
        subscription_frequency: subscription.frequency ?? null,
      });

      feedbackService.show(
        "success",
        t("modal.createSubscription.success", "Subscription added."),
      );
      close();
      await onRefresh();
    },
    [close, onRefresh, posthog, t],
  );

  const handleUpdate = useCallback(
    async (values: SubscriptionFormValues) => {
      if (!data) return;

      const subscription = buildSubscription(values, data);
      const result = await SubscriptionService.update(subscription);
      if (!result.success) return;

      subscriptionCache.patchItems((items) =>
        items.map((item) => (item.id === subscription.id ? subscription : item)),
      );

      feedbackService.show(
        "success",
        t("modal.updateSubscription.success", "Subscription updated."),
      );
      close();
      await onRefresh();
    },
    [close, data, onRefresh, t],
  );

  const title =
    type === "update"
      ? t("modal.updateSubscription.title", "Edit Subscription")
      : t("modal.createSubscription.title", "New Subscription");

  return {
    isOpen,
    type,
    data,
    title,
    close,
    onSubmit: type === "update" ? handleUpdate : handleCreate,
  };
};

export default useSubscriptionDialog;
