import { useCallback, useEffect } from "react";
import dialogStore from "@/core/store/dialogStore";
import BalanceService from "@/features/Balance/services/BalanceService";
import balanceCache from "@/features/Balance/hooks/Balance/balanceCache";

export const UPDATE_BALANCE_DIALOG = "updateBalance";

/** List-hook equivalent for a single-value resource (architecture §4.3a). */
export const useBalance = () => {
  const { amount, isLoading, isLoaded } = balanceCache.useStore();

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

  const handleEditPress = useCallback(() => {
    dialogStore.open(UPDATE_BALANCE_DIALOG, "update", { data: { amount } });
  }, [amount]);

  return { amount, isLoading, fetchBalance, handleEditPress };
};

export default useBalance;
