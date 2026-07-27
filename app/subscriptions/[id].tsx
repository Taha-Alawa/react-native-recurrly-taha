import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { Link, useLocalSearchParams } from 'expo-router';
import { usePostHog } from 'posthog-react-native';

const SubscriptionsDetails = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const posthog = usePostHog();

  useEffect(() => {
    posthog.capture("subscription_details_viewed", {
      subscription_id: id,
    });
  }, [id, posthog]);

  return (
    <View>
      <Text>Subscription Details: {id}</Text>
      <Link href="/" className="text-primary">
        Back back to home
      </Link>
    </View>
  );
}
export default SubscriptionsDetails;
