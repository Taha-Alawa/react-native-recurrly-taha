import { FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import ScreenHeader from "@/core/components/Navigation/ScreenHeader";
import ScreenMenuSheet from "@/core/components/Navigation/ScreenMenuSheet";
import ListHeading from "@/core/components/Navigation/ListHeading";
import EmptyState from "@/core/components/Feedback/EmptyState";
import DateRangePicker from "@/core/components/Inputs/DateRangePicker";
import { formatCurrency } from "@/core/utils/formatters";
import useInsights from "@/features/Insights/hooks/useInsights";
import ExpenseChart from "@/features/Insights/components/ExpenseChart";
import HistoryItem from "@/features/Insights/components/HistoryItem";

const SafeAreaView = styled(RNSafeAreaView);

const Insights = () => {
  const { t } = useTranslation();
  const {
    weekDays,
    maxWeekTotal,
    monthlyExpenses,
    filteredHistory,
    historyRange,
    handleApplyRange,
    clearRange,
    isRangePickerOpen,
    openRangePicker,
    closeRangePicker,
    isMenuOpen,
    openMenu,
    closeMenu,
    menuActions,
  } = useInsights();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <FlatList
        data={filteredHistory}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerClassName="p-5 pb-30"
        ListHeaderComponent={
          <>
            <ScreenHeader
              title={t("insights.title", "Monthly Insights")}
              onMenuPress={openMenu}
            />

            <ListHeading title={t("insights.upcoming", "Upcoming")} showAction={false} />

            <ExpenseChart weekDays={weekDays} maxTotal={maxWeekTotal} />

            <View className="insights-expenses-card">
              <View className="min-w-0 flex-1">
                <Text className="insights-expenses-title">
                  {t("insights.expenses", "Expenses")}
                </Text>
                <Text className="insights-expenses-meta">
                  {dayjs().format("MMMM YYYY")}
                </Text>
              </View>
              <Text className="insights-expenses-amount" numberOfLines={1}>
                -{formatCurrency(monthlyExpenses)}
              </Text>
            </View>

            <ListHeading
              title={t("insights.history", "History")}
              onActionPress={openRangePicker}
            />

            {historyRange && (
              <View className="filter-chip-row">
                <Pressable className="filter-chip" onPress={clearRange}>
                  <Text className="filter-chip-text" numberOfLines={1}>
                    {dayjs(historyRange.startDate).format("MMM D, YYYY")}
                    {" – "}
                    {dayjs(historyRange.endDate).format("MMM D, YYYY")}
                  </Text>
                  <Text className="filter-chip-clear">✕</Text>
                </Pressable>
              </View>
            )}
          </>
        }
        renderItem={({ item }) => <HistoryItem subscription={item} />}
        ItemSeparatorComponent={() => <View className="h-3" />}
        ListEmptyComponent={
          <EmptyState
            message={
              historyRange
                ? t("insights.noHistoryInRange", "No subscriptions in the selected date range.")
                : t("insights.noHistory", "No subscription history yet.")
            }
          />
        }
      />

      <DateRangePicker
        visible={isRangePickerOpen}
        initialRange={historyRange}
        onClose={closeRangePicker}
        onApply={handleApplyRange}
        onClear={clearRange}
      />

      <ScreenMenuSheet
        visible={isMenuOpen}
        title={t("insights.menu.title", "Insights options")}
        actions={menuActions}
        onClose={closeMenu}
      />
    </SafeAreaView>
  );
};

export default Insights;
