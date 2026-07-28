import React, { useMemo, useState } from 'react';
import { FlatList, Text, TextInput, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import SubscriptionCard from '@/components/SubscriptionCard';
import { useSubscriptions } from '@/context/SubscriptionsContext';
const SafeAreaView = styled(RNSafeAreaView)

const Subscriptions = () => {
  const { subscriptions } = useSubscriptions();
  const [query, setQuery] = useState('');
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);

  const filteredSubscriptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return subscriptions;

    return subscriptions.filter((subscription) =>
      [subscription.name, subscription.category, subscription.plan]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(normalizedQuery))
    );
  }, [query, subscriptions]);

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <Text className="list-title mb-4">Subscriptions</Text>

      <TextInput
        className="search-input"
        placeholder="Search subscriptions..."
        placeholderTextColor="rgba(0,0,0,0.4)"
        value={query}
        onChangeText={setQuery}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />

      <FlatList
        data={filteredSubscriptions}
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={expandedSubscriptionId === item.id}
            onPress={() => {
              setExpandedSubscriptionId(
                expandedSubscriptionId === item.id ? null : item.id
              );
            }}
          />
        )}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        ListEmptyComponent={() => (
          <Text className="home-empty-state">No subscriptions found.</Text>
        )}
        extraData={expandedSubscriptionId}
        ItemSeparatorComponent={() => <View className="h-4" />}
        contentContainerClassName="pb-30"
      />
    </SafeAreaView>
  );
}

export default Subscriptions;
