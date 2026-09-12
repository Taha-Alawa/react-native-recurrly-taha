import { Image, Pressable, Text, View } from "react-native";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { iconTint } from "@/core/constants/icons";
import { formatCurrency } from "@/core/utils/formatters";
import type { UpcomingSubscription } from "@/features/Subscriptions/interfaces/Subscription.interface";

export type UpcomingSubscriptionCardProps = {
  subscription: UpcomingSubscription;
  onPay?: (subscription: UpcomingSubscription) => void;
};

const UpcomingSubscriptionCard = ({
  subscription,
  onPay,
}: UpcomingSubscriptionCardProps) => {
  const { t } = useTranslation();
  const { name, price, currency, daysLeft, icon, iconKey, isOverdue, isPayable } =
    subscription;

  const timing = isOverdue
    ? t("home.overdueDays", {
        count: Math.abs(daysLeft),
        defaultValue: "{{count}} days overdue",
      })
    : daysLeft > 1
      ? t("home.daysLeft", { count: daysLeft })
      : t("home.lastDay", "Last day");

  return (
    <View className={clsx("upcoming-card", isOverdue && "upcoming-card-overdue")}>
      <View className="upcoming-row">
        <Image
          source={icon}
          className="upcoming-icon"
          style={{ tintColor: iconTint(iconKey) }}
        />
        {/* min-w-0 + flex-1 lets this column shrink instead of overflowing the
            card — Arabic renders these strings far wider than English. */}
        <View className="upcoming-copy">
          <Text className="upcoming-price" numberOfLines={1}>
            {formatCurrency(price, currency)}
          </Text>
          <Text
            className={clsx(
              "upcoming-meta",
              isOverdue && "upcoming-meta-overdue",
            )}
            numberOfLines={1}
          >
            {timing}
          </Text>
        </View>
      </View>

      <Text className="upcoming-name" numberOfLines={1}>
        {name}
      </Text>

      {onPay && isPayable && (
        <Pressable
          className="upcoming-pay"
          onPress={() => onPay(subscription)}
          accessibilityRole="button"
          accessibilityLabel={t("home.payAccessibility", {
            name,
            defaultValue: "Pay {{name}}",
          })}
        >
          <Text className="upcoming-pay-text">{t("home.pay", "Pay")}</Text>
        </Pressable>
      )}
    </View>
  );
};

export default UpcomingSubscriptionCard;
