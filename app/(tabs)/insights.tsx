import React, { useMemo } from 'react';
import { FlatList, Image, Text, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import clsx from "clsx";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { colors } from "@/constants/theme";
import { formatCurrency } from "@/lib/utils";
import ListHeading from "@/components/ListHeading";
import ScreenHeader from "@/components/ScreenHeader";
import { useSubscriptions } from "@/context/SubscriptionsContext";

const SafeAreaView = styled(RNSafeAreaView);

const Insights = () => {
  const { t } = useTranslation();
  const { subscriptions } = useSubscriptions();
  const weekdayLabels = t("insights.weekdays", {
    returnObjects: true,
  }) as string[];

  const weekDays = useMemo(() => {
    const startOfWeek = dayjs()
      .subtract((dayjs().day() + 6) % 7, "day")
      .startOf("day");

    return Array.from({ length: 7 }).map((_, index) => {
      const date = startOfWeek.add(index, "day");
      const total = subscriptions
        .filter((subscription) => subscription.status !== "cancelled")
        .filter((subscription) =>
          subscription.renewalDate
            ? dayjs(subscription.renewalDate).isSame(date, "day")
            : false
        )
        .reduce((sum, subscription) => sum + subscription.price, 0);

      return {
        key: date.format("YYYY-MM-DD"),
        label: weekdayLabels[index],
        total,
        isToday: date.isSame(dayjs(), "day"),
      };
    });
  }, [subscriptions, weekdayLabels]);

  const maxWeekTotal = Math.max(1, ...weekDays.map((day) => day.total));

  const monthlyExpenses = useMemo(() => {
    return subscriptions
      .filter((subscription) => subscription.status !== "cancelled")
      .reduce((sum, subscription) => {
        const isYearly =
          subscription.billing === "Yearly" ||
          subscription.frequency === "Yearly";
        return sum + (isYearly ? subscription.price / 12 : subscription.price);
      }, 0);
  }, [subscriptions]);

  const history = useMemo(() => {
    return [...subscriptions]
      .filter((subscription) => subscription.startDate)
      .sort(
        (a, b) => dayjs(b.startDate).valueOf() - dayjs(a.startDate).valueOf()
      );
  }, [subscriptions]);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerClassName="p-5 pb-30"
        ListHeaderComponent={() => (
          <>
            <ScreenHeader title={t("insights.title")} />

            <ListHeading title={t("insights.upcoming")} />

            <View className="insights-chart-card">
              <View className="insights-chart-row">
                {weekDays.map((day) => {
                  const barHeight = Math.max(
                    10,
                    (day.total / maxWeekTotal) * 100
                  );
 
                  return (
                    <View key={day.key} className="insights-bar-col">
                      {day.isToday && day.total > 0 && (
                        <View className="insights-bar-badge">
                          <Text className="insights-bar-badge-text">
                            {formatCurrency(day.total)}
                          </Text>
                        </View>
                      )}
                      <View className="insights-bar-track">
                        <View
                          className={clsx(
                            "insights-bar-fill",
                            day.isToday ? "bg-accent" : "bg-primary"
                          )}
                          style={{ height: `${barHeight}%` }}
                        />
                      </View>
                      <Text className="insights-bar-label">{day.label}</Text>
                    </View>
                  );
                })}
              </View>
            </View>

            <View className="insights-expenses-card">
              <View>
                <Text className="insights-expenses-title">
                  {t("insights.expenses")}
                </Text>
                <Text className="insights-expenses-meta">
                  {dayjs().format("MMMM YYYY")}
                </Text>
              </View>
              <Text className="insights-expenses-amount">
                -{formatCurrency(monthlyExpenses)}
              </Text>
            </View>

            <ListHeading title={t("insights.history")} />
          </>
        )}
        renderItem={({ item }) => {
          const isYearly =
            item.billing === "Yearly" || item.frequency === "Yearly";

          return (
            <View className="insights-history-item">
              <View
                className="insights-history-icon-wrap"
                style={{ backgroundColor: item.color ?? colors.muted }}
              >
                <Image source={item.icon} className="insights-history-icon" />
              </View>
              <View className="insights-history-copy">
                <Text className="insights-history-name" numberOfLines={1}>
                  {item.name}
                </Text>
                <Text className="insights-history-date">
                  {dayjs(item.startDate).format("MMM D, HH:mm")}
                </Text>
              </View>
              <View className="insights-history-price-box">
                <Text className="insights-history-price">
                  {formatCurrency(item.price, item.currency)}
                </Text>
                <Text className="insights-history-period">
                  {isYearly ? t("insights.perYear") : t("insights.perMonth")}
                </Text>
              </View>
            </View>
          );
        }}
        ItemSeparatorComponent={() => <View className="h-3" />}
        ListEmptyComponent={() => (
          <Text className="home-empty-state">{t("insights.noHistory")}</Text>
        )}
      />
    </SafeAreaView>
  );
};

export default Insights;
