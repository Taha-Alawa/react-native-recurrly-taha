import { useCallback } from "react";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { usePostHog } from "posthog-react-native";
import dialogStore from "@/core/store/dialogStore";
import useDialog from "@/core/hooks/useDialog";
import feedbackService from "@/core/services/feedbackService";
import SubscriptionService from "@/features/Subscriptions/services/SubscriptionService";
import subscriptionCache from "@/features/Subscriptions/hooks/Subscription/subscriptionCache";
import { advanceRenewalDate } from "@/features/Subscriptions/utils/subscriptionFormatters";
import type { Subscription } from "@/features/Subscriptions/interfaces/Subscription.interface";
import TransactionService from "@/features/Transactions/services/TransactionService";
import transactionCache from "@/features/Transactions/hooks/Transaction/transactionCache";
import { toTransaction } from "@/features/Transactions/utils/transactionMappers";
import type { Transaction } from "@/features/Transactions/interfaces/Transaction.interface";

export const PAY_SUBSCRIPTION_DIALOG = "paySubscription";

export type PaySubscriptionPayload = {
  disabled: boolean;
  data: Subscription;
  /** Where the renewal moves to once paid — shown in the confirm sheet. */
  nextRenewalDate: string;
};

export type UseSubscriptionPaymentOptions = {
  onRefresh: () => void | Promise<void>;
};

const buildPaymentTransaction = (subscription: Subscription): Transaction =>
  toTransaction(`subscription-${subscription.id}-${Date.now()}`, {
    type: "outcome",
    name: subscription.name,
    amount: subscription.price,
    currency: subscription.currency ?? "USD",
    date: new Date().toISOString(),
    origin: "subscription",
    subscriptionId: subscription.id,
    iconKey: subscription.iconKey,
    createdAt: new Date().toISOString(),
  });

/**
 * Paying a subscription, which is one action across two features: it writes a
 * transaction and it moves the subscription's renewal date on by a cycle.
 *
 * It lives in Transactions rather than Subscriptions so the dependency points
 * one way — Transactions knows about subscriptions, Subscriptions stays unaware
 * of transactions. Screens that show both compose this alongside the two list
 * hooks, the way Home already composes Balance and Subscriptions.
 */
export const useSubscriptionPayment = ({
  onRefresh,
}: UseSubscriptionPaymentOptions) => {
  const { t } = useTranslation();
  const posthog = usePostHog();
  const { isOpen, payload, close } = useDialog<PaySubscriptionPayload>(
    PAY_SUBSCRIPTION_DIALOG,
  );

  /** Opens the confirm sheet unlocked, carrying the row (architecture §5). */
  const handlePayPress = useCallback((subscription: Subscription) => {
    dialogStore.open<PaySubscriptionPayload>(PAY_SUBSCRIPTION_DIALOG, "update", {
      disabled: false,
      data: subscription,
      nextRenewalDate: advanceRenewalDate(subscription),
    });
  }, []);

  const handleConfirmPay = useCallback(
    async (subscription: Subscription) => {
      const nextRenewalDate = advanceRenewalDate(subscription);

      dialogStore.open<PaySubscriptionPayload>(PAY_SUBSCRIPTION_DIALOG, "update", {
        disabled: true,
        data: subscription,
        nextRenewalDate,
      });

      // Record the money first. If moving the renewal date then fails the user
      // is out of pocket and still sees the subscription as due, which is
      // recoverable; the reverse would quietly lose the payment.
      const transaction = buildPaymentTransaction(subscription);
      const paid = await TransactionService.create(transaction);

      if (!paid.success) {
        dialogStore.close(PAY_SUBSCRIPTION_DIALOG);
        return;
      }

      transactionCache.patchItems((items) => [transaction, ...items]);

      const renewed = { ...subscription, renewalDate: nextRenewalDate };
      const result = await SubscriptionService.update(renewed);
      dialogStore.close(PAY_SUBSCRIPTION_DIALOG);

      if (result.success) {
        subscriptionCache.patchItems((items) =>
          items.map((item) => (item.id === renewed.id ? renewed : item)),
        );
      }

      posthog.capture("subscription_paid", {
        subscription_id: subscription.id,
        subscription_name: subscription.name,
        subscription_price: subscription.price,
        transaction_id: transaction.id,
        next_renewal_date: nextRenewalDate,
      });

      feedbackService.show(
        "success",
        t("transactions.paySuccess", {
          name: subscription.name,
          date: dayjs(nextRenewalDate).format("MMM D"),
          defaultValue: "{{name}} paid. Next renewal {{date}}.",
        }),
      );

      await onRefresh();
    },
    [onRefresh, posthog, t],
  );

  return {
    isPayDialogOpen: isOpen,
    payPayload: payload,
    closePayDialog: close,
    handlePayPress,
    handleConfirmPay,
  };
};

export default useSubscriptionPayment;
