import { Text, View } from "react-native";
import clsx from "clsx";
import { formatCurrency } from "@/core/utils/formatters";
import type { WeekdayTotal } from "@/features/Insights/utils/insightsCalculations";

export type ExpenseChartProps = {
  weekDays: WeekdayTotal[];
  maxTotal: number;
};

const ExpenseChart = ({ weekDays, maxTotal }: ExpenseChartProps) => (
  <View className="insights-chart-card">
    <View className="insights-chart-row">
      {weekDays.map((day) => {
        const barHeight = Math.max(10, (day.total / maxTotal) * 100);

        return (
          <View key={day.key} className="insights-bar-col">
            {day.isToday && day.total > 0 && (
              <View className="insights-bar-badge">
                <Text
                  className="insights-bar-badge-text"
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.7}
                >
                  {formatCurrency(day.total)}
                </Text>
              </View>
            )}

            <View className="insights-bar-track">
              <View
                className={clsx(
                  "insights-bar-fill",
                  day.isToday ? "bg-accent" : "bg-primary",
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
);

export default ExpenseChart;
