import {
  formatCurrency,
  formatMaskedPaymentMethod,
  formatRenewalCycle,
  formatStatusLabel,
  formatSubscriptionDateTime,
} from '@/lib/utils';
import clsx from 'clsx';
import { View, Image, Text, Pressable } from 'react-native';

const SubscriptionCard = ({
  name,
  price,
  currency,
  icon,
  billing,
  color,
  category,
  plan,
  renewalDate,
  onPress,
  expanded,
  paymentMethod,
  startDate,
  status,
  onCancelPress,
  isCancelling,
  variant = 'detailed',
}: SubscriptionCardProps) => {
  const fallback = 'Not provided';
  const isManageVariant = variant === 'manage';

  return (
    <Pressable
        onPress={onPress}
        className={clsx("sub-card", expanded ? 'sub-card-expanded' : 'bg-card')}
        style={!expanded &&color ? { backgroundColor: color } : {}}
      >
      <View className="sub-head">
        <View className="sub-main">
          <Image className="sub-icon" source={icon} />
          <View className="sub-copy">
            <Text className="sub-title" numberOfLines={1}>
              {name}
            </Text>
            <Text className="sub-meta" numberOfLines={1} ellipsizeMode="tail">
              {isManageVariant
                ? plan?.trim() || category?.trim() ||
                  (renewalDate ? formatSubscriptionDateTime(renewalDate) : "")
                : category?.trim() || plan?.trim() ||
                  (renewalDate ? formatSubscriptionDateTime(renewalDate) : "")}
            </Text>
          </View>
        </View>
        <View className="sub-price-box">
          <Text className="sub-price">{formatCurrency(price, currency)}</Text>
          <Text className="sub-billing">
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
                  <Text className="sub-label">Payment info:</Text>
                  <Text className="sub-value" numberOfLines={1} ellipsizeMode="tail">
                    {formatMaskedPaymentMethod(paymentMethod)}
                  </Text>
                </View>
                <Pressable className="list-action" hitSlop={8}>
                  <Text className="list-action-text">Manage</Text>
                </Pressable>
              </View>
              <View className="sub-manage-row">
                <View className="sub-row-copy">
                  <Text className="sub-label">Plan details:</Text>
                  <Text className="sub-value" numberOfLines={1} ellipsizeMode="tail">
                    {plan?.trim() || fallback}
                  </Text>
                </View>
                <Pressable className="list-action" hitSlop={8}>
                  <Text className="list-action-text">Change</Text>
                </Pressable>
              </View>

              <Pressable
                className={clsx('sub-cancel', isCancelling && 'sub-cancel-disabled')}
                onPress={onCancelPress}
                disabled={isCancelling}
              >
                <Text className="sub-cancel-text">
                  {isCancelling ? 'Cancelling…' : 'Cancel Subscription'}
                </Text>
              </Pressable>
            </View>
          ) : (
            <View className="sub-details">
              <View className="sub-row">
                <View className="sub-row-copy">
                  <Text className="sub-label">Payment:</Text>
                  <Text className="sub-value" numberOfLines={1} ellipsizeMode="tail">
                    {paymentMethod?.trim() || fallback}
                  </Text>
                </View>
              </View>
              <View className="sub-row">
                <View className="sub-row-copy">
                  <Text className="sub-label">Category:</Text>
                  <Text className="sub-value" numberOfLines={1} ellipsizeMode="tail">
                    {category?.trim() || plan?.trim() || fallback}
                  </Text>
                </View>
              </View>
              <View className="sub-row">
                <View className="sub-row-copy">
                  <Text className="sub-label">Started:</Text>
                  <Text className="sub-value" numberOfLines={1} ellipsizeMode="tail">
                    {startDate ? formatSubscriptionDateTime(startDate) : fallback}
                  </Text>
                </View>
              </View>
              <View className="sub-row">
                <View className="sub-row-copy">
                  <Text className="sub-label">Renewal Date:</Text>
                  <Text className="sub-value" numberOfLines={1} ellipsizeMode="tail">
                    {renewalDate ? formatSubscriptionDateTime(renewalDate) : fallback}
                  </Text>
                </View>
              </View>
              <View className="sub-row">
                <View className="sub-row-copy">
                  <Text className="sub-label">Status:</Text>
                  <Text className="sub-value" numberOfLines={1} ellipsizeMode="tail">
                    {status ? formatStatusLabel(status) : fallback}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>
      )}
    </Pressable>
  );
}

export default SubscriptionCard;
