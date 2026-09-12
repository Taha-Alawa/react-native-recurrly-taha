import { useCallback, useEffect, useMemo } from "react";
import dialogStore from "@/core/store/dialogStore";
import BalanceService from "@/features/Balance/services/BalanceService";
import balanceCache from "@/features/Balance/hooks/Balance/balanceCache";
import useTransactionsCache from "@/features/Transactions/hooks/Transaction/useTransactionsCache";
import { sumNet } from "@/features/Transactions/utils/transactionCalculations";

export const UPDATE_BALANCE_DIALOG = "updateBalance";

export const useBalance = () => {
  const {
    amount: startingAmount,
    isLoading,
    isLoaded,
  } = balanceCache.useStore();
  const { transactions, fetchTransactions } = useTransactionsCache();

  const transactionsNet = useMemo(() => sumNet(transactions), [transactions]);
  const amount = startingAmount + transactionsNet;

  const fetchBalance = useCallback(async () => {
    balanceCache.setState({ isLoading: true });
    const result = await BalanceService.get();

    balanceCache.setState(
      result.success
        ? { amount: result.data, isLoading: false, isLoaded: true }
        : { isLoading: false },
    );
  }, []);

  useEffect(() => {
    if (!isLoaded) void fetchBalance();
  }, [isLoaded, fetchBalance]);

  const refreshBalance = useCallback(async () => {
    await Promise.all([fetchBalance(), fetchTransactions()]);
  }, [fetchBalance, fetchTransactions]);

  const handleEditPress = useCallback(() => {
    dialogStore.open(UPDATE_BALANCE_DIALOG, "update", {
      data: { startingAmount },
    });
  }, [startingAmount]);

  return {
    amount,
    startingAmount,
    transactionsNet,
    isLoading,
    fetchBalance,
    refreshBalance,
    handleEditPress,
  };
};

export default useBalance;
