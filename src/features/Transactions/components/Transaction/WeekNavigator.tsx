import { Pressable, Text, View } from "react-native";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { useDirection } from "@/core/components/Localization/LocalizationProvider";
import type { WeekWindow } from "@/features/Transactions/utils/transactionCalculations";

export type WeekNavigatorProps = {
  week: WeekWindow;
  onPrevious: () => void;
  onNext: () => void;
};

/**
 * Moves the screen a week at a time. Forward is disabled on the current window
 * rather than hidden, so the control does not jump around as the user pages.
 */
const WeekNavigator = ({ week, onPrevious, onNext }: WeekNavigatorProps) => {
  const { t } = useTranslation();
  const direction = useDirection();

  const sameMonth = week.start.isSame(week.end, "month");
  const range = `${week.start.format("MMM D")} – ${week.end.format(
    sameMonth ? "D, YYYY" : "MMM D, YYYY",
  )}`;

  return (
    <View className="tx-week-nav">
      <Pressable
        className="tx-week-button"
        onPress={onPrevious}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={t("transactions.previousWeek", "Previous week")}
      >
        <Text className="tx-week-button-text">{direction.backGlyph}</Text>
      </Pressable>

      <View className="tx-week-copy">
        <Text className="tx-week-range" numberOfLines={1}>
          {range}
        </Text>
        <Text className="tx-week-label" numberOfLines={1}>
          {week.isCurrent
            ? t("transactions.thisWeek", "This week")
            : t("transactions.weeksAgo", {
                count: Math.abs(week.offset),
                defaultValue: "{{count}} weeks ago",
              })}
        </Text>
      </View>

      <Pressable
        className={clsx(
          "tx-week-button",
          week.isCurrent && "tx-week-button-disabled",
        )}
        onPress={onNext}
        disabled={week.isCurrent}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={t("transactions.nextWeek", "Next week")}
      >
        <Text className="tx-week-button-text">{direction.forwardGlyph}</Text>
      </Pressable>
    </View>
  );
};

export default WeekNavigator;
