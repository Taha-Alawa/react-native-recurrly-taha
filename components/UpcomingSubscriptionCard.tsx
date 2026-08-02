import { formatCurrency } from "@/lib/utils";
import { Image, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

const UpcomingSubscriptionCard = ({
  name,
  price,
  daysLeft,
  icon,
  currency,
}: UpcomingSubscription) => {
  const { t } = useTranslation();

  return (
    <View className="upcoming-card">
      <View className="upcoming-row">
        <Image source={icon} className="upcoming-icon" />
        <View>
          <Text className="upcoming-price">
            {formatCurrency(price, currency)}
          </Text>
          <Text className="upcoming-meta">
            {daysLeft > 1
              ? t("home.daysLeft", { count: daysLeft })
              : t("home.lastDay")}
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
