import { FlatList, Image, Pressable, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import { useUser } from "@clerk/clerk-expo";
import { useTranslation } from "react-i18next";
import images from "@/constants/images";
import { HOME_BALANCE, UPCOMING_SUBSCRIPTIONS } from "@/constants/data";
import { icons } from "@/constants/icons";
import { formatCurrency, getDisplayName } from "@/lib/utils";
import dayjs from "dayjs";
import ListHeading from "@/components/ListHeading";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import SubscriptionCard from "@/components/SubscriptionCard";
import CreateSubscriptionModal from "@/components/CreateSubscriptionModal";
import { useState } from "react";
import { usePostHog } from "posthog-react-native";
import { useSubscriptions } from "@/context/SubscriptionsContext";

const SafeAreaView = styled(RNSafeAreaView);

export default function Index() {
  const { user } = useUser();
  const { t } = useTranslation();
  const posthog = usePostHog();
  const { subscriptions, addSubscription } = useSubscriptions();
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);
  const [isCreateModalVisible, setCreateModalVisible] = useState(false);

  const handleCreateSubscription = (subscription: Subscription) => {
    addSubscription(subscription);
    posthog.capture("subscription_created", {
      subscription_id: subscription.id,
      subscription_name: subscription.name,
      subscription_category: subscription.category ?? null,
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <FlatList
        ListHeaderComponent={() => (
          <>
            <View className="home-header">
              <View className="home-user">
                <Image
                  source={user?.imageUrl ? { uri: user.imageUrl } : images.avatar}
                  className="home-avatar"
                />
                <Text className="home-user-name">{getDisplayName(user)}</Text>
              </View>

              <Pressable
                onPress={() => setCreateModalVisible(true)}
                hitSlop={8}
              >
                <Image source={icons.add} className="home-add-icon" />
              </Pressable>
            </View>

            <View className="home-balance-card">
              <View className="home-balance-top-row">
                <Text className="home-balance-label">
                  {t("home.balanceLabel")}
                </Text>
                <View className="home-balance-badge">
                  <View className="home-balance-badge-dot" />
                </View>
              </View>
              <Text className="home-balance-amount">
                {formatCurrency(HOME_BALANCE.amount)}
              </Text>
              <View className="home-balance-bottom-row">
                <View className="home-balance-bottom-dot" />
                <Text className="home-balance-date">
                  {t("home.nextRenewal")} ·{" "}
                  {dayjs(HOME_BALANCE.nextRenewalDate).format("MMM D")}
                </Text>
              </View>
            </View>

            <View>
              <ListHeading title={t("home.upcoming")} />
              <FlatList
                data={UPCOMING_SUBSCRIPTIONS}
                renderItem={({ item }) => (
                  <UpcomingSubscriptionCard {...item} />
                )}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                ListEmptyComponent={() => (
                  <Text className="home-empty-state">
                    {t("home.noUpcoming")}
                  </Text>
                )}
              />
            </View>

            <ListHeading title={t("home.allSubscriptions")} />
          </>
        )}
        data={subscriptions}
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={expandedSubscriptionId === item.id}
            onPress={() => {
              const isExpanding = expandedSubscriptionId !== item.id;
              setExpandedSubscriptionId(isExpanding ? item.id : null);
              if (isExpanding) {
                posthog.capture("subscription_expanded", {
                  subscription_id: item.id,
                  subscription_name: item.name,
                });
              }
            }}
          />
        )}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <Text className="home-empty-state">{t("home.noSubscriptions")}</Text>
        )}
        extraData={expandedSubscriptionId}
        ItemSeparatorComponent={() => <View className="h-4" />}
        contentContainerClassName="pb-30"
      />

      <CreateSubscriptionModal
        visible={isCreateModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onCreate={handleCreateSubscription}
      />
    </SafeAreaView>
  );
}
