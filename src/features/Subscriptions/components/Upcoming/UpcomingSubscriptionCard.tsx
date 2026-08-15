import { Image, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { formatCurrency } from "@/core/utils/formatters";
import type { UpcomingSubscription } from "@/features/Subscriptions/interfaces/Subscription.interface";

export type UpcomingSubscriptionCardProps = {
  subscription: UpcomingSubscription;
};

const UpcomingSubscriptionCard = ({
  subscription,
}: UpcomingSubscriptionCardProps) => {
  const { t } = useTranslation();
  const { name, price, currency, daysLeft, icon } = subscription;

  return (
    <View className="upcoming-card">
      <View className="upcoming-row">
        <Image source={icon} className="upcoming-icon" />
        {/* min-w-0 + flex-1 lets this column shrink instead of overflowing the
            card — Arabic renders these strings far wider than English. */}
        <View className="upcoming-copy">
          <Text className="upcoming-price" numberOfLines={1}>
            {formatCurrency(price, currency)}
          </Text>
          <Text className="upcoming-meta" numberOfLines={1}>
            {daysLeft > 1
              ? t("home.daysLeft", { count: daysLeft })
              : t("home.lastDay", "Last day")}
          </Text>
        </View>
      </View>

      <Text className="upcoming-name" numberOfLines={1}>
        {name}
      </Text>
    </View>
  );
};

export default UpcomingSubscriptionCard;
