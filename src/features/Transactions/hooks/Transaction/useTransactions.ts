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
  buildWeekWindow,
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
 * Owns the week the screen is looking at, the rows and totals for it, and every
 * row action. The screen destructures this and renders.
 */
export const useTransactions = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const posthog = usePostHog();
  const { transactions, isLoading, fetchTransactions } = useTransactionsCache();

  const [weekOffset, setWeekOffset] = useState(0);
  const [isMenuOpen, setMenuOpen] = useState(false);

  /* --------------------------------------------------------------- derived */

  const week = useMemo(() => buildWeekWindow(weekOffset), [weekOffset]);

  const weekTransactions = useMemo(
    () => sortByDateDesc(filterByWindow(transactions, week)),
    [transactions, week],
  );

  const totals = useMemo(
    () => calculateTotals(weekTransactions),
    [weekTransactions],
  );

  /* ------------------------------------------------------------ navigation */

  const goToPreviousWeek = useCallback(
    () => setWeekOffset((offset) => offset - 1),
    [],
  );

  /** Forward stops at the current window — there is nothing after today. */
  const goToNextWeek = useCallback(
    () => setWeekOffset((offset) => Math.min(0, offset + 1)),
    [],
  );

  const goToCurrentWeek = useCallback(() => setWeekOffset(0), []);

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
        key: "this-week",
        label: t("transactions.menu.thisWeek", "Jump to this week"),
        onPress: goToCurrentWeek,
        disabled: week.isCurrent,
      },
      {
        key: "go-to-insights",
        label: t("transactions.menu.goToInsights", "View dashboard"),
        onPress: () => router.push("/insights"),
      },
    ],
    [goToCurrentWeek, handleAddPress, router, t, week.isCurrent],
  );

  return {
    transactions,
    weekTransactions,
    totals,
    week,
    isLoading,
    fetchTransactions,
    goToPreviousWeek,
    goToNextWeek,
    goToCurrentWeek,
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
