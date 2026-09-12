import { Pressable, Text, View } from "react-native";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { useDirection } from "@/core/components/Localization/LocalizationProvider";
import type { MonthWindow } from "@/features/Transactions/utils/transactionCalculations";

export type MonthNavigatorProps = {
  month: MonthWindow;
  onPrevious: () => void;
  onNext: () => void;
};

/**
 * Moves the screen a month at a time. Forward is disabled on the current month
 * rather than hidden, so the control does not jump around as the user pages.
 */
const MonthNavigator = ({ month, onPrevious, onNext }: MonthNavigatorProps) => {
  const { t } = useTranslation();
  const direction = useDirection();

  return (
    <View className="mb-4">
      <View className="period-nav-row">
        <Pressable
          className="period-nav-button"
          onPress={onPrevious}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t("transactions.previousMonth", "Previous month")}
        >
          <Text className="period-nav-button-text">{direction.backGlyph}</Text>
        </Pressable>

        <View className="period-nav-copy">
          <Text className="period-nav-label" numberOfLines={1}>
            {month.label}
          </Text>
          <Text className="period-nav-current" numberOfLines={1}>
            {month.isCurrent
              ? t("transactions.thisMonth", "This month")
              : t("transactions.monthsAgo", {
                  count: Math.abs(month.offset),
                  defaultValue: "{{count}} months ago",
                })}
          </Text>
        </View>

        <Pressable
          className={clsx(
            "period-nav-button",
            month.isCurrent && "period-nav-button-disabled",
          )}
          onPress={onNext}
          disabled={month.isCurrent}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t("transactions.nextMonth", "Next month")}
        >
          <Text className="period-nav-button-text">{direction.forwardGlyph}</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default MonthNavigator;
