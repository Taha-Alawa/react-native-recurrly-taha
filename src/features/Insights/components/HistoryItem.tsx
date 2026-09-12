import { Image, Text, View } from "react-native";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { iconTint } from "@/core/constants/icons";
import { colors } from "@/core/theme/tokens";
import { formatCurrency } from "@/core/utils/formatters";
import { isYearly } from "@/features/Subscriptions/utils/subscriptionFormatters";
import type { Subscription } from "@/features/Subscriptions/interfaces/Subscription.interface";

export type HistoryItemProps = {
  subscription: Subscription;
};

const HistoryItem = ({ subscription }: HistoryItemProps) => {
  const { t } = useTranslation();

  return (
    <View className="insights-history-item">
      <View
        className="insights-history-icon-wrap"
        style={{ backgroundColor: subscription.color ?? colors.muted }}
      >
        <Image
          source={subscription.icon}
          className="insights-history-icon"
          style={{ tintColor: iconTint(subscription.iconKey) }}
        />
      </View>

      <View className="insights-history-copy">
        <Text className="insights-history-name" numberOfLines={1}>
          {subscription.name}
        </Text>
        <Text className="insights-history-date" numberOfLines={1}>
          {dayjs(subscription.startDate).format("MMM D, HH:mm")}
        </Text>
      </View>

      <View className="insights-history-price-box">
        <Text className="insights-history-price" numberOfLines={1}>
          {formatCurrency(subscription.price, subscription.currency)}
        </Text>
        <Text className="insights-history-period" numberOfLines={1}>
          {isYearly(subscription)
            ? t("insights.perYear", "per year")
            : t("insights.perMonth", "per month")}
        </Text>
      </View>
    </View>
  );
};

export default HistoryItem;
