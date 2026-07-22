import React from 'react';
import { View, Text } from 'react-native';
import { Link, useLocalSearchParams } from 'expo-router';

const SubscriptionsDetails = () => {
  const { id } = useLocalSearchParams<{ id: string }>();

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
