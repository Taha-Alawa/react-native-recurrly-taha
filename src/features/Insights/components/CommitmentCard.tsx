import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { colors } from "@/core/theme/tokens";
import { formatCurrencyShort } from "@/core/utils/formatters";
import type {
  Commitment,
  PeriodWindow,
} from "@/features/Insights/utils/insightsCalculations";

export type CommitmentCardProps = {
  commitment: Commitment;
  period: PeriodWindow;
};

/**
 * What the subscriptions commit you to, against what was actually paid.
 *
 * The two figures come from different places and the card never merges them:
 * "committed" is arithmetic on today's prices, "paid" is recorded transactions.
 * When nothing was recorded the card says the number is a projection rather
 * than letting a confident-looking total imply bills were settled.
 */
const CommitmentCard = ({ commitment, period }: CommitmentCardProps) => {
  const { t } = useTranslation();

  const progress =
    commitment.committed > 0
      ? Math.min(100, (commitment.paid / commitment.committed) * 100)
      : 0;

  return (
    <View className="stat-card">
      <View className="stat-hero">
        <View className="min-w-0 flex-1">
          <Text className="stat-hero-label" numberOfLines={1}>
            {period.mode === "year"
              ? t("dashboard.annualCommitment", "Annual commitment")
              : t("dashboard.monthlyCommitment", "Monthly commitment")}
          </Text>
          <Text className="stat-hero-caption" numberOfLines={1}>
            {t("dashboard.activeCount", {
              count: commitment.activeCount,
              defaultValue: "{{count}} active subscriptions",
            })}
          </Text>
        </View>

        <Text className="stat-hero-value" numberOfLines={1}>
          {formatCurrencyShort(commitment.committed)}
        </Text>
      </View>

      <View className="commitment-track">
        <View
          className="commitment-fill"
          style={{ width: `${progress}%`, backgroundColor: colors.accent }}
        />
      </View>

      <View className="stat-rows">
        <View className="stat-row">
          <Text className="stat-row-label" numberOfLines={1}>
            {t("dashboard.paidSoFar", "Paid in this period")}
          </Text>
          <Text className="stat-row-value" numberOfLines={1}>
            {formatCurrencyShort(commitment.paid)}
          </Text>
        </View>

        <View className="stat-row">
          <Text className="stat-row-label" numberOfLines={1}>
            {t("dashboard.stillToCome", "Still to come")}
          </Text>
          <Text className="stat-row-value" numberOfLines={1}>
            {formatCurrencyShort(commitment.remaining)}
          </Text>
        </View>
      </View>

      {commitment.isProjection && (
        <Text className="stat-note">
          {t(
            "dashboard.projectionNote",
            "No subscription payments recorded here — this is what today's prices would cost, not money that moved.",
          )}
        </Text>
      )}
    </View>
  );
};

export default CommitmentCard;
