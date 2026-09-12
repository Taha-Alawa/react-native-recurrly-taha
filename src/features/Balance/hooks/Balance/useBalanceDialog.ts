import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { usePostHog } from "posthog-react-native";
import useDialog from "@/core/hooks/useDialog";
import feedbackService from "@/core/services/feedbackService";
import BalanceService from "@/features/Balance/services/BalanceService";
import balanceCache from "@/features/Balance/hooks/Balance/balanceCache";
import { UPDATE_BALANCE_DIALOG } from "@/features/Balance/hooks/Balance/useBalance";
import transactionCache from "@/features/Transactions/hooks/Transaction/transactionCache";
import { sumNet } from "@/features/Transactions/utils/transactionCalculations";
import type { BalanceFormValues } from "@/features/Balance/schemas/Balance/BalanceSchema";

type BalanceDialogPayload = { data: { startingAmount: number } };

export type UseBalanceDialogOptions = {
  onRefresh: () => void | Promise<void>;
};

export const useBalanceDialog = ({ onRefresh }: UseBalanceDialogOptions) => {
  const { t } = useTranslation();
  const posthog = usePostHog();
  const { isOpen, payload, close } = useDialog<BalanceDialogPayload>(
    UPDATE_BALANCE_DIALOG,
  );
  const { items } = transactionCache.useStore();

  const startingAmount =
    payload?.data?.startingAmount ?? balanceCache.getState().amount;

  const transactionsNet = useMemo(() => sumNet(items), [items]);
  const currentAmount = startingAmount + transactionsNet;

  const handleUpdate = useCallback(
    async (values: BalanceFormValues) => {
      const amount = Number(Number(values.amount.replace(",", ".")).toFixed(2));

      const result = await BalanceService.set(amount);
      if (!result.success) return;

      posthog.capture("balance_updated", {
        previous_balance: startingAmount,
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
    [close, onRefresh, posthog, startingAmount, t],
  );

  return {
    isOpen,
    startingAmount,
    currentAmount,
    transactionsNet,
    title: t("modal.updateBalance.title", "Update Balance"),
    onSubmit: handleUpdate,
    close,
  };
};

export default useBalanceDialog;
