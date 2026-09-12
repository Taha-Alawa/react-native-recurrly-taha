import { FlatList, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import { useTranslation } from "react-i18next";
import ScreenHeader from "@/core/components/Navigation/ScreenHeader";
import ScreenMenuSheet from "@/core/components/Navigation/ScreenMenuSheet";
import SearchFilter from "@/core/components/Inputs/SearchFilter";
import EmptyState from "@/core/components/Feedback/EmptyState";
import useSubscriptions from "@/features/Subscriptions/hooks/Subscription/useSubscriptions";
import SubscriptionCard from "@/features/Subscriptions/components/Subscription/SubscriptionCard";
import SubscriptionDialog from "@/features/Subscriptions/components/Subscription/SubscriptionDialog";
import CancelSubscriptionDialog from "@/features/Subscriptions/components/Subscription/CancelSubscriptionDialog";

const SafeAreaView = styled(RNSafeAreaView);

const Subscriptions = () => {
  const { t } = useTranslation();
  const {
    filteredSubscriptions,
    searchQuery,
    setSearchQuery,
    expandedId,
    fetchSubscriptions,
    handleToggleExpand,
    handleEditPress,
    handleCancelPress,
    handleConfirmCancel,
    isMenuOpen,
    openMenu,
    closeMenu,
    menuActions,
  } = useSubscriptions();

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <ScreenHeader
        title={t("subscriptions.title", "My Subscriptions")}
        onMenuPress={openMenu}
      />

      <SearchFilter
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder={t("subscriptions.searchPlaceholder", "Search subscriptions...")}
      />

      <FlatList
        data={filteredSubscriptions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SubscriptionCard
            subscription={item}
            variant="manage"
            expanded={expandedId === item.id}
            onPress={() => handleToggleExpand(item)}
            onEditPress={() => handleEditPress(item)}
            onCancelPress={() => handleCancelPress(item)}
          />
        )}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        ListEmptyComponent={
          <EmptyState message={t("subscriptions.noResults", "No subscriptions found.")} />
        }
        extraData={expandedId}
        ItemSeparatorComponent={() => <View className="h-4" />}
        contentContainerClassName="pb-30"
      />

      <ScreenMenuSheet
        visible={isMenuOpen}
        title={t("subscriptions.menu.title", "Subscription options")}
        actions={menuActions}
        onClose={closeMenu}
      />

      <SubscriptionDialog onRefresh={fetchSubscriptions} />
      <CancelSubscriptionDialog onConfirm={handleConfirmCancel} />
    </SafeAreaView>
  );
};

export default Subscriptions;
