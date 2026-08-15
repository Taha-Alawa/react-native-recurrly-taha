import { Image, Pressable, Text, View } from "react-native";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { formatCurrency, formatDate } from "@/core/utils/formatters";
import {
  formatMaskedPaymentMethod,
  formatRenewalCycle,
  formatStatusLabel,
} from "@/features/Subscriptions/utils/subscriptionFormatters";
import type { Subscription } from "@/features/Subscriptions/interfaces/Subscription.interface";

export type SubscriptionCardProps = {
  subscription: Subscription;
  expanded: boolean;
  onPress: () => void;
  onCancelPress?: () => void;
  isCancelling?: boolean;
  variant?: "detailed" | "manage";
};

const SubscriptionCard = ({
  subscription,
  expanded,
  onPress,
  onCancelPress,
  isCancelling = false,
  variant = "detailed",
}: SubscriptionCardProps) => {
  const { t } = useTranslation();
  const {
    name,
    price,
    currency,
    icon,
    billing,
    color,
    category,
    plan,
    renewalDate,
    paymentMethod,
    startDate,
    status,
  } = subscription;

  const fallback = t("common.notProvided", "Not provided");
  const isManageVariant = variant === "manage";
  const categoryLabel = category?.trim()
    ? t(`categories.${category.trim()}`, { defaultValue: category.trim() })
    : "";

  const subtitle = isManageVariant
    ? plan?.trim() || categoryLabel || (renewalDate ? formatDate(renewalDate) : "")
    : categoryLabel || plan?.trim() || (renewalDate ? formatDate(renewalDate) : "");

  const detailRows = isManageVariant
    ? []
    : [
        { key: "payment", label: t("subscriptions.payment", "Payment:"), value: paymentMethod?.trim() || fallback },
        { key: "category", label: t("subscriptions.category", "Category:"), value: categoryLabel || plan?.trim() || fallback },
        { key: "started", label: t("subscriptions.started", "Started:"), value: startDate ? formatDate(startDate) : fallback },
        { key: "renewal", label: t("subscriptions.renewalDate", "Renewal Date:"), value: renewalDate ? formatDate(renewalDate) : fallback },
        { key: "status", label: t("subscriptions.status", "Status:"), value: status ? formatStatusLabel(status) : fallback },
      ];

  return (
    <Pressable
      onPress={onPress}
      className={clsx("sub-card", expanded ? "sub-card-expanded" : "bg-card")}
      style={!expanded && color ? { backgroundColor: color } : {}}
    >
      <View className="sub-head">
        <View className="sub-main">
          <Image className="sub-icon" source={icon} />
          <View className="sub-copy">
            <Text className="sub-title" numberOfLines={1}>
              {name}
            </Text>
            <Text className="sub-meta" numberOfLines={1} ellipsizeMode="tail">
              {subtitle}
            </Text>
          </View>
        </View>
        <View className="sub-price-box">
          <Text className="sub-price" numberOfLines={1}>
            {formatCurrency(price, currency)}
          </Text>
          <Text className="sub-billing" numberOfLines={1}>
            {isManageVariant ? formatRenewalCycle(renewalDate) : billing}
          </Text>
        </View>
      </View>

      {expanded && (
        <View className="sub-body">
          {isManageVariant ? (
            <View className="sub-details">
              <View className="sub-manage-row">
                <View className="sub-row-copy">
                  <Text className="sub-label">
                    {t("subscriptions.paymentInfo", "Payment info:")}
                  </Text>
                  <Text className="sub-value" numberOfLines={1} ellipsizeMode="tail">
                    {formatMaskedPaymentMethod(paymentMethod)}
                  </Text>
                </View>
                <Pressable className="list-action" hitSlop={8}>
                  <Text className="list-action-text">
                    {t("subscriptions.manage", "Manage")}
                  </Text>
                </Pressable>
              </View>

              <View className="sub-manage-row">
                <View className="sub-row-copy">
                  <Text className="sub-label">
                    {t("subscriptions.planDetails", "Plan details:")}
                  </Text>
                  <Text className="sub-value" numberOfLines={1} ellipsizeMode="tail">
                    {plan?.trim() || fallback}
                  </Text>
                </View>
                <Pressable className="list-action" hitSlop={8}>
                  <Text className="list-action-text">
                    {t("subscriptions.change", "Change")}
                  </Text>
                </Pressable>
              </View>

              <Pressable
                className={clsx("sub-cancel", isCancelling && "sub-cancel-disabled")}
                onPress={onCancelPress}
                disabled={isCancelling}
              >
                <Text className="sub-cancel-text">
                  {isCancelling
                    ? t("subscriptions.cancelling", "Cancelling…")
                    : t("subscriptions.cancelSubscription", "Cancel Subscription")}
                </Text>
              </Pressable>
            </View>
          ) : (
            <View className="sub-details">
              {detailRows.map((row) => (
                <View key={row.key} className="sub-row">
                  <View className="sub-row-copy">
                    <Text className="sub-label">{row.label}</Text>
                    <Text className="sub-value" numberOfLines={1} ellipsizeMode="tail">
                      {row.value}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </Pressable>
  );
};

export default SubscriptionCard;
