import { Image, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { iconTint } from "@/core/constants/icons";
import { colors } from "@/core/theme/tokens";
import EmptyState from "@/core/components/Feedback/EmptyState";
import { formatCurrencyShort } from "@/core/utils/formatters";
import type { SubscriptionCost } from "@/features/Insights/utils/insightsCalculations";

export type SubscriptionCostListProps = {
  costs: SubscriptionCost[];
};

/**
 * Every active subscription ranked by what it costs over a year.
 *
 * Monthly plans are multiplied out so a $20/month plan and a $180/year plan can
 * be compared at all — the headline figure people never work out by hand, and
 * the whole reason this section is worth having.
 */
const SubscriptionCostList = ({ costs }: SubscriptionCostListProps) => {
  const { t } = useTranslation();

  if (!costs.length) {
    return (
      <EmptyState
        message={t("dashboard.noSubscriptions", "No active subscriptions.")}
      />
    );
  }

  const widest = Math.max(...costs.map((cost) => cost.annual));

  return (
    <View className="breakdown-list">
      {costs.map((cost) => (
        <View key={cost.id} className="breakdown-row">
          <View className="breakdown-head">
            <View className="breakdown-identity">
              <Image
                source={cost.icon}
                className="breakdown-icon"
                style={{ tintColor: iconTint(cost.iconKey) }}
              />
              <Text className="breakdown-name" numberOfLines={1}>
                {cost.name}
              </Text>
            </View>

            <Text className="breakdown-value" numberOfLines={1}>
              {formatCurrencyShort(cost.annual)}
            </Text>
          </View>

          <View className="breakdown-track">
            <View
              className="breakdown-fill"
              style={{
                width: `${Math.max(2, (cost.annual / widest) * 100)}%`,
                backgroundColor: colors.accent,
              }}
            />
          </View>

          <Text className="breakdown-caption" numberOfLines={1}>
            {t("dashboard.subscriptionCaption", {
              monthly: formatCurrencyShort(cost.monthly),
              share: Math.round(cost.share * 100),
              defaultValue: "{{monthly}}/mo · {{share}}% of your subscriptions",
            })}
          </Text>
        </View>
      ))}
    </View>
  );
};

export default SubscriptionCostList;
