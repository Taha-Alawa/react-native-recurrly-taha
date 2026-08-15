import { FlatList, Image, Pressable, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import { Text } from "react-native";
import { useTranslation } from "react-i18next";
import ListHeading from "@/core/components/Navigation/ListHeading";
import EmptyState from "@/core/components/Feedback/EmptyState";
import { icons } from "@/core/constants/icons";
import images from "@/core/constants/images";
import useHome from "@/features/Home/hooks/useHome";
import BalanceCard from "@/features/Balance/components/Balance/BalanceCard";
import BalanceDialog from "@/features/Balance/components/Balance/BalanceDialog";
import SubscriptionCard from "@/features/Subscriptions/components/Subscription/SubscriptionCard";
import SubscriptionDialog from "@/features/Subscriptions/components/Subscription/SubscriptionDialog";
import UpcomingSubscriptionCard from "@/features/Subscriptions/components/Upcoming/UpcomingSubscriptionCard";

const SafeAreaView = styled(RNSafeAreaView);

const Home = () => {
  const { t } = useTranslation();
  const {
    displayName,
    avatarUri,
    balanceAmount,
    nextRenewalDate,
    onEditBalance,
    refreshBalance,
    subscriptions,
    upcomingSubscriptions,
    expandedId,
    onToggleExpand,
    onCreatePress,
    refreshSubscriptions,
    onViewAllSubscriptions,
  } = useHome();

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <FlatList
        data={subscriptions}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            <View className="home-header">
              <View className="home-user">
                <Image
                  source={avatarUri ? { uri: avatarUri } : images.avatar}
                  className="home-avatar"
                />
                <Text className="home-user-name" numberOfLines={1}>
                  {displayName}
                </Text>
              </View>

              <Pressable onPress={onCreatePress} hitSlop={8}>
                <Image source={icons.add} className="home-add-icon" />
              </Pressable>
            </View>

            <BalanceCard
              amount={balanceAmount}
              nextRenewalDate={nextRenewalDate}
              onPress={onEditBalance}
            />

            <View>
              <ListHeading title={t("home.upcoming", "Upcoming")} showAction={false} />
              <FlatList
                data={upcomingSubscriptions}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <UpcomingSubscriptionCard subscription={item} />
                )}
                horizontal
                showsHorizontalScrollIndicator={false}
                ItemSeparatorComponent={() => <View className="w-4" />}
                ListEmptyComponent={
                  <EmptyState message={t("home.noUpcoming", "No upcoming renewals yet.")} />
                }
              />
            </View>

            <ListHeading
              title={t("home.allSubscriptions", "All Subscriptions")}
              onActionPress={onViewAllSubscriptions}
            />
          </>
        }
        renderItem={({ item }) => (
          <SubscriptionCard
            subscription={item}
            expanded={expandedId === item.id}
            onPress={() => onToggleExpand(item)}
          />
        )}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState message={t("home.noSubscriptions", "No subscriptions yet.")} />
        }
        extraData={expandedId}
        ItemSeparatorComponent={() => <View className="h-4" />}
        contentContainerClassName="pb-30"
      />

      <SubscriptionDialog onRefresh={refreshSubscriptions} />
      <BalanceDialog onRefresh={refreshBalance} />
    </SafeAreaView>
  );
};

export default Home;
