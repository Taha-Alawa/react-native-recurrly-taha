import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { colors } from "@/core/theme/tokens";
import EmptyState from "@/core/components/Feedback/EmptyState";
import { formatCurrencyShort } from "@/core/utils/formatters";
import type { SpendingEntry } from "@/features/Insights/utils/insightsCalculations";

export type TopSpendingListProps = {
  entries: SpendingEntry[];
};

/**
 * Where the money actually went, biggest first.
 *
 * One hue for every row: the rows are already named, so colour would be
 * decoration standing in for a label that is right there. The bar length is the
 * only thing carrying data.
 */
const TopSpendingList = ({ entries }: TopSpendingListProps) => {
  const { t } = useTranslation();

  if (!entries.length) {
    return (
      <EmptyState
        message={t("dashboard.noSpending", "No spending recorded in this period.")}
      />
    );
  }

  const widest = Math.max(...entries.map((entry) => entry.total));

  return (
    <View className="breakdown-list">
      {entries.map((entry) => (
        <View key={entry.key} className="breakdown-row">
          <View className="breakdown-head">
            <Text className="breakdown-name" numberOfLines={1}>
              {entry.name}
            </Text>
            <Text className="breakdown-value" numberOfLines={1}>
              {formatCurrencyShort(entry.total)}
            </Text>
          </View>

          <View className="breakdown-track">
            <View
              className="breakdown-fill"
              style={{
                width: `${Math.max(2, (entry.total / widest) * 100)}%`,
                backgroundColor: colors.chartOutcome,
              }}
            />
          </View>

          <Text className="breakdown-caption" numberOfLines={1}>
            {t("dashboard.spendingCaption", {
              share: Math.round(entry.share * 100),
              count: entry.count,
              defaultValue: "{{share}}% of expenses · {{count}} transactions",
            })}
          </Text>
        </View>
      ))}
    </View>
  );
};

export default TopSpendingList;
