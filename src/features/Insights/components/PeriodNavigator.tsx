import { Pressable, Text, View } from "react-native";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { useDirection } from "@/core/components/Localization/LocalizationProvider";
import type {
  PeriodMode,
  PeriodWindow,
} from "@/features/Insights/utils/insightsCalculations";

export type PeriodNavigatorProps = {
  period: PeriodWindow;
  onModeChange: (mode: PeriodMode) => void;
  onPrevious: () => void;
  onNext: () => void;
};

const MODES: PeriodMode[] = ["year", "month"];

/**
 * Scope and position in one control: the segmented row picks how far to zoom
 * out, the arrows move within that zoom. Forward is disabled on the current
 * period rather than hidden, so the control does not shift as the user pages.
 */
const PeriodNavigator = ({
  period,
  onModeChange,
  onPrevious,
  onNext,
}: PeriodNavigatorProps) => {
  const { t } = useTranslation();
  const direction = useDirection();

  return (
    <View className="period-nav">
      <View className="picker-row">
        {MODES.map((mode) => {
          const isActive = mode === period.mode;

          return (
            <Pressable
              key={mode}
              className={clsx("picker-option", isActive && "picker-option-active")}
              onPress={() => onModeChange(mode)}
            >
              <Text
                className={clsx(
                  "picker-option-text",
                  isActive && "picker-option-text-active",
                )}
              >
                {mode === "year"
                  ? t("dashboard.year", "Year")
                  : t("dashboard.month", "Month")}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View className="period-nav-row">
        <Pressable
          className="period-nav-button"
          onPress={onPrevious}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t("dashboard.previousPeriod", "Previous period")}
        >
          <Text className="period-nav-button-text">{direction.backGlyph}</Text>
        </Pressable>

        <View className="period-nav-copy">
          <Text className="period-nav-label" numberOfLines={1}>
            {period.label}
          </Text>
          {period.isCurrent && (
            <Text className="period-nav-current" numberOfLines={1}>
              {period.mode === "year"
                ? t("dashboard.thisYear", "This year")
                : t("dashboard.thisMonth", "This month")}
            </Text>
          )}
        </View>

        <Pressable
          className={clsx(
            "period-nav-button",
            period.isCurrent && "period-nav-button-disabled",
          )}
          onPress={onNext}
          disabled={period.isCurrent}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t("dashboard.nextPeriod", "Next period")}
        >
          <Text className="period-nav-button-text">{direction.forwardGlyph}</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default PeriodNavigator;
