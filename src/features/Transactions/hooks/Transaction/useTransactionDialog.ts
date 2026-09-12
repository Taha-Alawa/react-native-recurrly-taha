import { useCallback } from "react";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { usePostHog } from "posthog-react-native";
import useDialog from "@/core/hooks/useDialog";
import feedbackService from "@/core/services/feedbackService";
import TransactionService from "@/features/Transactions/services/TransactionService";
import transactionCache from "@/features/Transactions/hooks/Transaction/transactionCache";
import { toTransaction } from "@/features/Transactions/utils/transactionMappers";
import type { TransactionFormValues } from "@/features/Transactions/schemas/Transaction/TransactionSchema";
import type {
  Transaction,
  TransactionType,
} from "@/features/Transactions/interfaces/Transaction.interface";

export const ADD_TRANSACTION_DIALOG = "addTransaction";

/** `type` seeds the form, so "Add income" opens on the income side. */
export type TransactionDialogPayload = { type?: TransactionType };

export type UseTransactionDialogOptions = {
  /** Supplied by the screen so the list refetches after a mutation. */
  onRefresh: () => void | Promise<void>;
};

export const buildTransaction = (values: TransactionFormValues): Transaction => {
  const name = values.name.trim();
  const amount = Number(Number(values.amount.replace(",", ".")).toFixed(2));
  const date = values.date ? dayjs(values.date) : dayjs();

  return toTransaction(
    `${values.type}-${name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
    {
      type: values.type,
      name,
      amount,
      currency: "USD",
      date: date.toISOString(),
      origin: "manual",
      iconKey: "wallet",
      createdAt: new Date().toISOString(),
    },
  );
};

/**
 * Dialog hook for the transaction entity (architecture §4.3c). Creating is the
 * only mutation it offers — a recorded transaction is deleted and re-entered
 * rather than edited, so the derived balance always matches the rows.
 */
export const useTransactionDialog = ({
  onRefresh,
}: UseTransactionDialogOptions) => {
  const { t } = useTranslation();
  const posthog = usePostHog();

  const { isOpen, payload, close } = useDialog<TransactionDialogPayload>(
    ADD_TRANSACTION_DIALOG,
  );

  const initialType: TransactionType = payload?.type ?? "outcome";

  const handleCreate = useCallback(
    async (values: TransactionFormValues) => {
      const transaction = buildTransaction(values);
      const result = await TransactionService.create(transaction);
      if (!result.success) return;

      // Patch before refetching so the row — and the balance derived from it —
      // move immediately rather than after a Firestore round-trip.
      transactionCache.patchItems((items) => [transaction, ...items]);

      posthog.capture("transaction_created", {
        transaction_id: transaction.id,
        transaction_type: transaction.type,
        transaction_name: transaction.name,
        transaction_amount: transaction.amount,
        transaction_origin: transaction.origin,
      });

      feedbackService.show(
        "success",
        transaction.type === "income"
          ? t("modal.createTransaction.incomeSuccess", "Income added.")
          : t("modal.createTransaction.outcomeSuccess", "Expense added."),
      );

      close();
      await onRefresh();
    },
    [close, onRefresh, posthog, t],
  );

  const title =
    initialType === "income"
      ? t("modal.createTransaction.incomeTitle", "New Income")
      : t("modal.createTransaction.outcomeTitle", "New Expense");

  return { isOpen, initialType, title, close, onSubmit: handleCreate };
};

export default useTransactionDialog;
