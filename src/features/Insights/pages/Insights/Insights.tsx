import { ScrollView, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import { useTranslation } from "react-i18next";
import ScreenHeader from "@/core/components/Navigation/ScreenHeader";
import ScreenMenuSheet from "@/core/components/Navigation/ScreenMenuSheet";
import ListHeading from "@/core/components/Navigation/ListHeading";
import useInsights from "@/features/Insights/hooks/useInsights";
import PeriodNavigator from "@/features/Insights/components/PeriodNavigator";
import SummaryTiles from "@/features/Insights/components/SummaryTiles";
import CashflowChart from "@/features/Insights/components/CashflowChart";
import AveragesCard from "@/features/Insights/components/AveragesCard";
import TopSpendingList from "@/features/Insights/components/TopSpendingList";
import CommitmentCard from "@/features/Insights/components/CommitmentCard";
import SubscriptionCostList from "@/features/Insights/components/SubscriptionCostList";
import CategorySplit from "@/features/Insights/components/CategorySplit";

const SafeAreaView = styled(RNSafeAreaView);

/**
 * A plain ScrollView rather than a FlatList: every section is a different shape
 * and there is no long homogeneous list left to virtualise.
 */
const Insights = () => {
  const { t } = useTranslation();
  const {
    period,
    changeMode,
    goToPrevious,
    goToNext,
    totals,
    buckets,
    maxBucket,
    selectedBucket,
    selectBucket,
    averages,
    topSpending,
    subscriptionCosts,
    categoryShares,
    commitment,
    isMenuOpen,
    openMenu,
    closeMenu,
    menuActions,
  } = useInsights();

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-30"
      >
        <ScreenHeader
          title={t("dashboard.title", "Dashboard")}
          onMenuPress={openMenu}
        />

        <PeriodNavigator
          period={period}
          onModeChange={changeMode}
          onPrevious={goToPrevious}
          onNext={goToNext}
        />

        <SummaryTiles totals={totals} />

        <ListHeading
          title={t("dashboard.cashflow", "Income vs Expenses")}
          showAction={false}
        />

        <CashflowChart
          buckets={buckets}
          maxValue={maxBucket}
          selected={selectedBucket}
          onSelect={selectBucket}
          periodLabel={period.label}
          periodIncome={totals.income}
          periodOutcome={totals.outcome}
        />

        <ListHeading
          title={t("dashboard.rates", "Rates & extremes")}
          showAction={false}
        />

        <AveragesCard averages={averages} period={period} />

        <ListHeading
          title={t("dashboard.topSpending", "Top spending")}
          showAction={false}
        />

        <TopSpendingList entries={topSpending} />

        <ListHeading
          title={t("dashboard.commitment", "Subscription commitment")}
          showAction={false}
        />

        <CommitmentCard commitment={commitment} period={period} />

        <ListHeading
          title={t("dashboard.byCost", "Subscriptions by yearly cost")}
          showAction={false}
        />

        <SubscriptionCostList costs={subscriptionCosts} />

        {categoryShares.length > 0 && (
          <>
            <ListHeading
              title={t("dashboard.byCategory", "By category")}
              showAction={false}
            />
            <CategorySplit shares={categoryShares} />
          </>
        )}

        <View className="h-4" />
      </ScrollView>

      <ScreenMenuSheet
        visible={isMenuOpen}
        title={t("dashboard.menu.title", "Dashboard options")}
        actions={menuActions}
        onClose={closeMenu}
      />
    </SafeAreaView>
  );
};

export default Insights;
