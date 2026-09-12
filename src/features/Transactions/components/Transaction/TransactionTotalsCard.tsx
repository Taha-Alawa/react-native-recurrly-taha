import { Text, View } from "react-native";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { formatCurrencyShort } from "@/core/utils/formatters";
import type { TransactionTotals } from "@/features/Transactions/interfaces/Transaction.interface";

export type TransactionTotalsCardProps = {
  totals: TransactionTotals;
};

/**
 * What the selected week came to.
 *
 * The subscriptions tile is a slice of the outcome tile, not a fourth column to
 * add up — it answers "how much of what I spent was not a choice this week".
 * Its caption says so, because three money figures in a row otherwise read as
 * three separate pots.
 */
const TransactionTotalsCard = ({ totals }: TransactionTotalsCardProps) => {
  const { t } = useTranslation();
  const isPositive = totals.net >= 0;

  return (
    <View className="tx-totals-card">
      <View className="tx-totals-head">
        <Text className="tx-totals-title">
          {t("transactions.weekSummary", "This range")}
        </Text>
        <Text
          className={clsx(
            "tx-totals-net",
            isPositive ? "tx-total-value-income" : "tx-total-value-outcome",
          )}
          numberOfLines={1}
        >
          {isPositive ? "+" : "−"}
          {formatCurrencyShort(Math.abs(totals.net))}
        </Text>
      </View>

      <View className="tx-totals-row">
        <View className="tx-total-tile">
          <Text className="tx-total-label" numberOfLines={1}>
            {t("transactions.totalIncome", "Income")}
          </Text>
          <Text
            className="tx-total-value tx-total-value-income"
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.85}
          >
            {formatCurrencyShort(totals.income)}
          </Text>
        </View>

        <View className="tx-total-tile">
          <Text className="tx-total-label" numberOfLines={1}>
            {t("transactions.totalOutcome", "Expenses")}
          </Text>
          <Text
            className="tx-total-value tx-total-value-outcome"
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.85}
          >
            {formatCurrencyShort(totals.outcome)}
          </Text>
        </View>

        <View className="tx-total-tile">
          <Text className="tx-total-label" numberOfLines={1}>
            {t("transactions.totalSubscriptions", "Subs")}
          </Text>
          <Text
            className="tx-total-value tx-total-value-neutral"
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.85}
          >
            {formatCurrencyShort(totals.subscriptions)}
          </Text>
          <Text className="tx-total-caption" numberOfLines={1}>
            {t("transactions.ofOutcome", "of expenses")}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default TransactionTotalsCard;
