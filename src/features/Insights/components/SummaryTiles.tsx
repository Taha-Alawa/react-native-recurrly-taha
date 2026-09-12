import { Text, View } from "react-native";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { colors } from "@/core/theme/tokens";
import { formatCurrencyShort } from "@/core/utils/formatters";
import type { TransactionTotals } from "@/features/Transactions/interfaces/Transaction.interface";

export type SummaryTilesProps = {
  totals: TransactionTotals;
};

/**
 * The four figures the period comes down to. Subscriptions is a slice of
 * outcome, not a fifth pot, so its tile says so — the same wording the
 * Transactions screen uses, because it is the same relationship.
 */
const SummaryTiles = ({ totals }: SummaryTilesProps) => {
  const { t } = useTranslation();
  const saved = totals.net;

  return (
    <View className="summary-grid">
      <View className="summary-row">
        <View className="summary-tile">
          <Text className="summary-label" numberOfLines={1}>
            {t("dashboard.income", "Income")}
          </Text>
          <Text
            className="summary-value"
            style={{ color: colors.chartIncome }}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.85}
          >
            {formatCurrencyShort(totals.income)}
          </Text>
        </View>

        <View className="summary-tile">
          <Text className="summary-label" numberOfLines={1}>
            {t("dashboard.outcome", "Expenses")}
          </Text>
          <Text
            className="summary-value"
            style={{ color: colors.chartOutcome }}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.85}
          >
            {formatCurrencyShort(totals.outcome)}
          </Text>
        </View>
      </View>

      <View className="summary-row">
        <View className="summary-tile">
          <Text className="summary-label" numberOfLines={1}>
            {t("dashboard.subscriptions", "Subscriptions")}
          </Text>
          <Text
            className="summary-value summary-value-neutral"
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.85}
          >
            {formatCurrencyShort(totals.subscriptions)}
          </Text>
          <Text className="summary-caption" numberOfLines={1}>
            {t("dashboard.ofOutcome", "of expenses")}
          </Text>
        </View>

        <View className="summary-tile">
          <Text className="summary-label" numberOfLines={1}>
            {saved >= 0
              ? t("dashboard.saved", "Saved")
              : t("dashboard.overspent", "Overspent")}
          </Text>
          <Text
            className={clsx(
              "summary-value",
              saved >= 0 ? "summary-value-good" : "summary-value-bad",
            )}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.85}
          >
            {formatCurrencyShort(Math.abs(saved))}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default SummaryTiles;
