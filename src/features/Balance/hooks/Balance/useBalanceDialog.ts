import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { usePostHog } from "posthog-react-native";
import useDialog from "@/core/hooks/useDialog";
import feedbackService from "@/core/services/feedbackService";
import BalanceService from "@/features/Balance/services/BalanceService";
import balanceCache from "@/features/Balance/hooks/Balance/balanceCache";
import { UPDATE_BALANCE_DIALOG } from "@/features/Balance/hooks/Balance/useBalance";
import type { BalanceFormValues } from "@/features/Balance/schemas/Balance/BalanceSchema";

type BalanceDialogPayload = { data: { amount: number } };

export type UseBalanceDialogOptions = {
  onRefresh: () => void | Promise<void>;
};

export const useBalanceDialog = ({ onRefresh }: UseBalanceDialogOptions) => {
  const { t } = useTranslation();
  const posthog = usePostHog();
  const { isOpen, payload, close } = useDialog<BalanceDialogPayload>(
    UPDATE_BALANCE_DIALOG,
  );

  const currentAmount = payload?.data?.amount ?? balanceCache.getState().amount;

  const handleUpdate = useCallback(
    async (values: BalanceFormValues) => {
      const amount = Number(
        Number(values.amount.replace(",", ".")).toFixed(2),
      );

      const result = await BalanceService.set(amount);
      if (!result.success) return;

      posthog.capture("balance_updated", {
        previous_balance: currentAmount,
        new_balance: amount,
      });
      feedbackService.show(
        "success",
        t("modal.updateBalance.success", "Balance updated."),
      );

      balanceCache.setState({ amount });
      close();
      await onRefresh();
    },
    [close, currentAmount, onRefresh, posthog, t],
  );

  return {
    isOpen,
    currentAmount,
    title: t("modal.updateBalance.title", "Update Balance"),
    onSubmit: handleUpdate,
    close,
  };
};

export default useBalanceDialog;
