import { FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import { useTranslation } from "react-i18next";
import ScreenHeader from "@/core/components/Navigation/ScreenHeader";
import ScreenMenuSheet from "@/core/components/Navigation/ScreenMenuSheet";
import ListHeading from "@/core/components/Navigation/ListHeading";
import EmptyState from "@/core/components/Feedback/EmptyState";
import useTransactions from "@/features/Transactions/hooks/Transaction/useTransactions";
import MonthNavigator from "@/features/Transactions/components/Transaction/MonthNavigator";
import TransactionTotalsCard from "@/features/Transactions/components/Transaction/TransactionTotalsCard";
import TransactionCard from "@/features/Transactions/components/Transaction/TransactionCard";
import TransactionDialog from "@/features/Transactions/components/Transaction/TransactionDialog";
import DeleteTransactionDialog from "@/features/Transactions/components/Transaction/DeleteTransactionDialog";

const SafeAreaView = styled(RNSafeAreaView);

const Transactions = () => {
  const { t } = useTranslation();
  const {
    monthTransactions,
    totals,
    month,
    fetchTransactions,
    goToPreviousMonth,
    goToNextMonth,
    handleAddPress,
    handleDeletePress,
    handleConfirmDelete,
    isMenuOpen,
    openMenu,
    closeMenu,
    menuActions,
  } = useTransactions();

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <FlatList
        data={monthTransactions}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-30"
        ListHeaderComponent={
          <>
            <ScreenHeader
              title={t("transactions.title", "Transactions")}
              onMenuPress={openMenu}
            />

            <MonthNavigator
              month={month}
              onPrevious={goToPreviousMonth}
              onNext={goToNextMonth}
            />

            <TransactionTotalsCard totals={totals} />

            <View className="tx-actions-row">
              <Pressable
                className="tx-action tx-action-income"
                onPress={() => handleAddPress("income")}
              >
                <Text className="tx-action-text tx-action-text-income">
                  {t("transactions.addIncome", "+ Income")}
                </Text>
              </Pressable>

              <Pressable
                className="tx-action tx-action-outcome"
                onPress={() => handleAddPress("outcome")}
              >
                <Text className="tx-action-text tx-action-text-outcome">
                  {t("transactions.addOutcome", "− Expense")}
                </Text>
              </Pressable>
            </View>

            <ListHeading
              title={t("transactions.listTitle", "Activity")}
              showAction={false}
            />
          </>
        }
        renderItem={({ item }) => (
          <TransactionCard
            transaction={item}
            onLongPress={() => handleDeletePress(item)}
          />
        )}
        ItemSeparatorComponent={() => <View className="h-3" />}
        ListEmptyComponent={
          <EmptyState
            message={
              month.isCurrent
                ? t("transactions.empty", "Nothing recorded this month yet.")
                : t("transactions.emptyPast", "Nothing recorded in this month.")
            }
          />
        }
      />

      <ScreenMenuSheet
        visible={isMenuOpen}
        title={t("transactions.menu.title", "Transaction options")}
        actions={menuActions}
        onClose={closeMenu}
      />

      <TransactionDialog onRefresh={fetchTransactions} />
      <DeleteTransactionDialog onConfirm={handleConfirmDelete} />
    </SafeAreaView>
  );
};

export default Transactions;
