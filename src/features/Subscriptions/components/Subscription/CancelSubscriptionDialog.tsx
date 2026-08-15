import { useTranslation } from "react-i18next";
import ConfirmDialog from "@/core/components/Dialog/ConfirmDialog";
import useDialog from "@/core/hooks/useDialog";
import {
  CANCEL_SUBSCRIPTION_DIALOG,
  type CancelDialogPayload,
} from "@/features/Subscriptions/hooks/Subscription/useSubscriptions";
import type { Subscription } from "@/features/Subscriptions/interfaces/Subscription.interface";

export type CancelSubscriptionDialogProps = {
  onConfirm: (subscription: Subscription) => void | Promise<void>;
};

/**
 * The delete-flow confirm sheet (architecture §5). `disabled` arrives in the
 * payload — the list hook re-opens this dialog locked while the request is in
 * flight, so the buttons cannot be double-fired.
 */
const CancelSubscriptionDialog = ({ onConfirm }: CancelSubscriptionDialogProps) => {
  const { t } = useTranslation();
  const { isOpen, payload, close } = useDialog<CancelDialogPayload>(
    CANCEL_SUBSCRIPTION_DIALOG,
  );

  const subscription = payload?.data ?? null;

  return (
    <ConfirmDialog
      visible={isOpen}
      title={t("subscriptions.cancelSubscription", "Cancel Subscription")}
      message={t("subscriptions.cancelConfirm", {
        name: subscription?.name ?? "",
        defaultValue: "Cancel {{name}}? This cannot be undone.",
      })}
      glyph="!"
      tone="danger"
      disabled={payload?.disabled ?? false}
      confirmLabel={t("subscriptions.cancelSubscription", "Cancel Subscription")}
      cancelLabel={t("common.keep", "Keep it")}
      onConfirm={() => subscription && onConfirm(subscription)}
      onClose={close}
    />
  );
};

export default CancelSubscriptionDialog;
