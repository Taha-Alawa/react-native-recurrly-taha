import { Text, View } from "react-native";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { formatCurrencyShort } from "@/core/utils/formatters";
import type {
  PeriodAverages,
  PeriodWindow,
} from "@/features/Insights/utils/insightsCalculations";

export type AveragesCardProps = {
  averages: PeriodAverages;
  period: PeriodWindow;
};

/**
 * Rates and extremes, which the totals above cannot show.
 *
 * Averages divide by the buckets that have actually begun, not by twelve — in
 * March, dividing a year's income by twelve would report a third of the real
 * monthly figure and make every month look like a disaster.
 */
const AveragesCard = ({ averages, period }: AveragesCardProps) => {
  const { t } = useTranslation();
  const isYear = period.mode === "year";

  const perLabel = isYear
    ? t("dashboard.perMonth", "per month")
    : t("dashboard.perWeek", "per week");

  return (
    <View className="stat-card">
      <View className="stat-hero">
        <View className="min-w-0 flex-1">
          <Text className="stat-hero-label" numberOfLines={1}>
            {t("dashboard.savingsRate", "Savings rate")}
          </Text>
          <Text className="stat-hero-caption" numberOfLines={1}>
            {averages.savingsRate === null
              ? t("dashboard.noIncome", "No income recorded")
              : t("dashboard.ofIncomeKept", "of income kept")}
          </Text>
        </View>

        <Text
          className={clsx(
            "stat-hero-value",
            averages.savingsRate !== null &&
              (averages.savingsRate >= 0
                ? "summary-value-good"
                : "summary-value-bad"),
          )}
          numberOfLines={1}
        >
          {averages.savingsRate === null
            ? "—"
            : `${Math.round(averages.savingsRate)}%`}
        </Text>
      </View>

      <View className="stat-rows">
        <View className="stat-row">
          <Text className="stat-row-label" numberOfLines={1}>
            {t("dashboard.avgIncome", "Average income")}
          </Text>
          <Text className="stat-row-value" numberOfLines={1}>
            {formatCurrencyShort(averages.averageIncome)} {perLabel}
          </Text>
        </View>

        <View className="stat-row">
          <Text className="stat-row-label" numberOfLines={1}>
            {t("dashboard.avgOutcome", "Average expenses")}
          </Text>
          <Text className="stat-row-value" numberOfLines={1}>
            {formatCurrencyShort(averages.averageOutcome)} {perLabel}
          </Text>
        </View>

        {averages.best && (
          <View className="stat-row">
            <Text className="stat-row-label" numberOfLines={1}>
              {t("dashboard.bestPeriod", "Best")}
            </Text>
            <Text className="stat-row-value" numberOfLines={2}>
              {averages.best.fullLabel}
              {"  "}
              <Text className="summary-value-good">
                {averages.best.net >= 0 ? "+" : "−"}
                {formatCurrencyShort(Math.abs(averages.best.net))}
              </Text>
            </Text>
          </View>
        )}

        {averages.worst && (
          <View className="stat-row">
            <Text className="stat-row-label" numberOfLines={1}>
              {t("dashboard.worstPeriod", "Worst")}
            </Text>
            <Text className="stat-row-value" numberOfLines={2}>
              {averages.worst.fullLabel}
              {"  "}
              <Text className="summary-value-bad">
                {averages.worst.net >= 0 ? "+" : "−"}
                {formatCurrencyShort(Math.abs(averages.worst.net))}
              </Text>
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default AveragesCard;
