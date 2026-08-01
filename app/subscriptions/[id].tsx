import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { Link, useLocalSearchParams } from 'expo-router';
import { usePostHog } from 'posthog-react-native';
import { useTranslation } from 'react-i18next';

const SubscriptionsDetails = () => {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const posthog = usePostHog();

  useEffect(() => {
    posthog.capture("subscription_details_viewed", {
      subscription_id: id,
    });
  }, [id, posthog]);

  return (
    <View>
      <Text>{t('subscriptionDetail.title', { id })}</Text>
      <Link href="/" className="text-primary">
        {t('subscriptionDetail.backToHome')}
      </Link>
    </View>
  );
}
export default SubscriptionsDetails;
