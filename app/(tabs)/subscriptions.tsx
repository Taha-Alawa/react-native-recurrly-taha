import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
const SafeAreaView = styled(RNSafeAreaView)

const Subscriptions = () => {
  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <Text className="text-primary">Suabscriptions Screen</Text>
    </SafeAreaView>
  );
}

export default Subscriptions;
