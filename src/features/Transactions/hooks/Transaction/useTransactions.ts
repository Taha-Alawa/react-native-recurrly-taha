import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { usePostHog } from "posthog-react-native";
import type { ScreenMenuAction } from "@/core/components/Navigation/ScreenMenuSheet";
import dialogStore from "@/core/store/dialogStore";
import feedbackService from "@/core/services/feedbackService";
import TransactionService from "@/features/Transactions/services/TransactionService";
import transactionCache from "@/features/Transactions/hooks/Transaction/transactionCache";
import useTransactionsCache from "@/features/Transactions/hooks/Transaction/useTransactionsCache";
import {
  ADD_TRANSACTION_DIALOG,
  type TransactionDialogPayload,
} from "@/features/Transactions/hooks/Transaction/useTransactionDialog";
import {
  buildMonthWindow,
  calculateTotals,
  filterByWindow,
  sortByDateDesc,
} from "@/features/Transactions/utils/transactionCalculations";
import type {
  Transaction,
  TransactionType,
} from "@/features/Transactions/interfaces/Transaction.interface";

export const DELETE_TRANSACTION_DIALOG = "deleteTransaction";

export type DeleteTransactionPayload = {
  disabled: boolean;
  data: Transaction;
};

/**
 * List hook for the transaction entity (architecture §4.3a).
 *
 * Owns the month the screen is looking at, the rows and totals for it, and every
 * row action. The screen destructures this and renders.
 */
export const useTransactions = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const posthog = usePostHog();
  const { transactions, isLoading, fetchTransactions } = useTransactionsCache();

  const [monthOffset, setMonthOffset] = useState(0);
  const [isMenuOpen, setMenuOpen] = useState(false);

  /* --------------------------------------------------------------- derived */

  const month = useMemo(() => buildMonthWindow(monthOffset), [monthOffset]);

  const monthTransactions = useMemo(
    () => sortByDateDesc(filterByWindow(transactions, month)),
    [transactions, month],
  );

  const totals = useMemo(
    () => calculateTotals(monthTransactions),
    [monthTransactions],
  );

  /* ------------------------------------------------------------ navigation */

  const goToPreviousMonth = useCallback(
    () => setMonthOffset((offset) => offset - 1),
    [],
  );

  /** Forward stops at the current month — there is nothing after today. */
  const goToNextMonth = useCallback(
    () => setMonthOffset((offset) => Math.min(0, offset + 1)),
    [],
  );

  const goToCurrentMonth = useCallback(() => setMonthOffset(0), []);

  /* --------------------------------------------------------------- actions */

  const handleAddPress = useCallback((type: TransactionType) => {
    dialogStore.open<TransactionDialogPayload>(ADD_TRANSACTION_DIALOG, "add", {
      type,
    });
  }, []);

  const handleDeletePress = useCallback((transaction: Transaction) => {
    dialogStore.open<DeleteTransactionPayload>(
      DELETE_TRANSACTION_DIALOG,
      "delete",
      { disabled: false, data: transaction },
    );
  }, []);

  /** Re-opens locked while the request runs, then closes and refetches. */
  const handleConfirmDelete = useCallback(
    async (transaction: Transaction) => {
      dialogStore.open<DeleteTransactionPayload>(
        DELETE_TRANSACTION_DIALOG,
        "delete",
        { disabled: true, data: transaction },
      );

      const result = await TransactionService.remove(transaction.id);
      dialogStore.close(DELETE_TRANSACTION_DIALOG);

      if (!result.success) return;

      // Drop it from the cache first: the balance is derived from these rows,
      // so waiting for the refetch would leave a stale figure on screen.
      transactionCache.patchItems((items) =>
        items.filter((item) => item.id !== transaction.id),
      );

      posthog.capture("transaction_deleted", {
        transaction_id: transaction.id,
        transaction_type: transaction.type,
        transaction_origin: transaction.origin,
      });
      feedbackService.show(
        "success",
        t("transactions.deleteSuccess", "Transaction deleted."),
      );

      await fetchTransactions();
    },
    [fetchTransactions, posthog, t],
  );

  /* ------------------------------------------------------------ screen menu */

  const menuActions: ScreenMenuAction[] = useMemo(
    () => [
      {
        key: "add-income",
        label: t("transactions.menu.addIncome", "Add income"),
        onPress: () => handleAddPress("income"),
      },
      {
        key: "add-outcome",
        label: t("transactions.menu.addOutcome", "Add expense"),
        onPress: () => handleAddPress("outcome"),
      },
      {
        key: "this-month",
        label: t("transactions.menu.thisMonth", "Jump to this month"),
        onPress: goToCurrentMonth,
        disabled: month.isCurrent,
      },
      {
        key: "go-to-insights",
        label: t("transactions.menu.goToInsights", "View dashboard"),
        onPress: () => router.push("/insights"),
      },
    ],
    [goToCurrentMonth, handleAddPress, month.isCurrent, router, t],
  );

  return {
    transactions,
    monthTransactions,
    totals,
    month,
    isLoading,
    fetchTransactions,
    goToPreviousMonth,
    goToNextMonth,
    goToCurrentMonth,
    handleAddPress,
    handleDeletePress,
    handleConfirmDelete,
    isMenuOpen,
    openMenu: () => setMenuOpen(true),
    closeMenu: () => setMenuOpen(false),
    menuActions,
  };
};

export default useTransactions;
