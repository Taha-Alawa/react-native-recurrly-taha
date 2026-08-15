import { useEffect } from "react";
import { Text, View } from "react-native";
import { Link, useLocalSearchParams } from "expo-router";
import { usePostHog } from "posthog-react-native";
import { useTranslation } from "react-i18next";

const SubscriptionDetail = () => {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const posthog = usePostHog();

  useEffect(() => {
    posthog.capture("subscription_details_viewed", { subscription_id: id });
  }, [id, posthog]);

  return (
    <View className="flex-1 bg-background p-5">
      <Text className="screen-title">
        {t("subscriptionDetail.title", { id })}
      </Text>
      <Link href="/" className="auth-link">
        {t("subscriptionDetail.backToHome", "Back to home")}
      </Link>
    </View>
  );
};

export default SubscriptionDetail;
