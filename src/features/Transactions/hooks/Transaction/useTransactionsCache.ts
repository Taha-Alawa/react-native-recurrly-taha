import { useCallback, useEffect } from "react";
import TransactionService from "@/features/Transactions/services/TransactionService";
import transactionCache from "@/features/Transactions/hooks/Transaction/transactionCache";

/**
 * Guards the initial load only. Home mounts this hook twice — once directly and
 * once through Balance — and both effects run in the same commit, before either
 * has flipped `isLoaded`. Without this the app opens on two identical reads.
 * An explicit `fetchTransactions()` is never blocked: a refresh means refresh.
 */
let isAutoLoading = false;

/**
 * The fetch-once primitive underneath every consumer of the transaction list.
 *
 * Split out of `useTransactions` because Balance needs the rows but none of
 * the screen state that hook also owns — week navigation, a router, analytics.
 */
export const useTransactionsCache = () => {
  const { items, isLoading, isLoaded } = transactionCache.useStore();

  const fetchTransactions = useCallback(async () => {
    transactionCache.setLoading(true);
    const result = await TransactionService.list();

    if (result.success) {
      transactionCache.setItems(result.data);
      return;
    }

    transactionCache.setLoading(false);
  }, []);

  useEffect(() => {
    if (isLoaded || isAutoLoading) return;

    isAutoLoading = true;
    void fetchTransactions().finally(() => {
      isAutoLoading = false;
    });
  }, [isLoaded, fetchTransactions]);

  return { transactions: items, isLoading, fetchTransactions };
};

export default useTransactionsCache;
