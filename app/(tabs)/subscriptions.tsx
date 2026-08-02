import React, { useMemo, useState } from 'react';
import { FlatList, Text, TextInput, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import { useTranslation } from 'react-i18next';
import SubscriptionCard from '@/components/SubscriptionCard';
import ScreenHeader from '@/components/ScreenHeader';
import { colors } from '@/constants/theme';
import { useSubscriptions } from '@/context/SubscriptionsContext';
const SafeAreaView = styled(RNSafeAreaView)

const Subscriptions = () => {
  const { t } = useTranslation();
  const { subscriptions, cancelSubscription } = useSubscriptions();
  const [query, setQuery] = useState('');
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const filteredSubscriptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return subscriptions;

    return subscriptions.filter((subscription) =>
      [subscription.name, subscription.category, subscription.plan]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(normalizedQuery))
    );
  }, [query, subscriptions]);

  const handleCancelSubscription = (id: string) => {
    setCancellingId(id);
    cancelSubscription(id);
    setExpandedSubscriptionId((current) => (current === id ? null : current));
    setCancellingId(null);
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <ScreenHeader title={t('subscriptions.title')} />

      <TextInput
        className="search-input"
        placeholder={t('subscriptions.searchPlaceholder')}
        placeholderTextColor={colors.mutedForeground}
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
            variant="manage"
            expanded={expandedSubscriptionId === item.id}
            onPress={() => {
              setExpandedSubscriptionId(
                expandedSubscriptionId === item.id ? null : item.id
              );
            }}
            onCancelPress={() => handleCancelSubscription(item.id)}
            isCancelling={cancellingId === item.id}
          />
        )}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        ListEmptyComponent={() => (
          <Text className="home-empty-state">{t('subscriptions.noResults')}</Text>
        )}
        extraData={expandedSubscriptionId}
        ItemSeparatorComponent={() => <View className="h-4" />}
        contentContainerClassName="pb-30"
      />
    </SafeAreaView>
  );
}

export default Subscriptions;
