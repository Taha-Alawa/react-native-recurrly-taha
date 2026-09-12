import { Pressable, Text, View } from "react-native";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { colors, components } from "@/core/theme/tokens";
import { formatCurrencyShort } from "@/core/utils/formatters";
import type { CashflowBucket } from "@/features/Insights/utils/insightsCalculations";

const { trackHeight, minBarHeight } = components.chart;

export type CashflowChartProps = {
  buckets: CashflowBucket[];
  maxValue: number;
  selected: CashflowBucket | null;
  onSelect: (key: string) => void;
  /** Shown in the detail line when no column is selected. */
  periodLabel: string;
  periodIncome: number;
  periodOutcome: number;
};

/**
 * Income against outcome, one pair of bars per month (or per week block in
 * month mode).
 *
 * A phone cannot fit twelve readable axis labels, so the columns carry one
 * letter each and the row above names whichever column is selected in full —
 * the native equivalent of a tooltip. The two series are also named in the
 * legend, so identity never rests on colour alone.
 */
const CashflowChart = ({
  buckets,
  maxValue,
  selected,
  onSelect,
  periodLabel,
  periodIncome,
  periodOutcome,
}: CashflowChartProps) => {
  const { t } = useTranslation();

  const barHeight = (value: number) =>
    value <= 0
      ? 0
      : Math.max(minBarHeight, (value / maxValue) * trackHeight);

  const hasData = buckets.some(
    (bucket) => bucket.income > 0 || bucket.outcome > 0,
  );

  const headingLabel = selected?.fullLabel ?? periodLabel;
  const headingIncome = selected ? selected.income : periodIncome;
  const headingOutcome = selected ? selected.outcome : periodOutcome;

  return (
    <View className="chart-card">
      <View className="chart-head">
        <Text className="chart-head-title" numberOfLines={1}>
          {headingLabel}
        </Text>

        <View className="chart-head-figures">
          <Text className="chart-head-figure" numberOfLines={1}>
            <Text style={{ color: colors.chartIncome }}>+</Text>
            {formatCurrencyShort(headingIncome)}
          </Text>
          <Text className="chart-head-figure" numberOfLines={1}>
            <Text style={{ color: colors.chartOutcome }}>{"−"}</Text>
            {formatCurrencyShort(headingOutcome)}
          </Text>
        </View>
      </View>

      <View className="chart-scale-row">
        <Text className="chart-scale-label">
          {hasData ? formatCurrencyShort(maxValue) : formatCurrencyShort(0)}
        </Text>
        <View className="chart-scale-rule" />
      </View>

      <View className="chart-columns" style={{ height: trackHeight }}>
        {buckets.map((bucket) => {
          const isSelected = selected?.key === bucket.key;

          return (
            <Pressable
              key={bucket.key}
              className={clsx("chart-col", isSelected && "chart-col-active")}
              onPress={() => onSelect(bucket.key)}
              accessibilityRole="button"
              accessibilityLabel={t("dashboard.bucketAccessibility", {
                period: bucket.fullLabel,
                income: formatCurrencyShort(bucket.income),
                outcome: formatCurrencyShort(bucket.outcome),
                defaultValue: "{{period}}: {{income}} in, {{outcome}} out",
              })}
            >
              <View className="chart-bars">
                <View
                  className="chart-bar"
                  style={{
                    height: barHeight(bucket.income),
                    backgroundColor: colors.chartIncome,
                  }}
                />
                <View
                  className="chart-bar"
                  style={{
                    height: barHeight(bucket.outcome),
                    backgroundColor: colors.chartOutcome,
                  }}
                />
              </View>
            </Pressable>
          );
        })}
      </View>

      <View className="chart-labels">
        {buckets.map((bucket) => (
          <View key={bucket.key} className="chart-label-cell">
            <Text
              className={clsx(
                "chart-label",
                (selected?.key === bucket.key || bucket.isCurrent) &&
                  "chart-label-active",
              )}
              numberOfLines={1}
            >
              {bucket.label}
            </Text>
          </View>
        ))}
      </View>

      <View className="chart-legend">
        <View className="chart-legend-item">
          <View
            className="chart-legend-swatch"
            style={{ backgroundColor: colors.chartIncome }}
          />
          <Text className="chart-legend-text">
            {t("dashboard.income", "Income")}
          </Text>
        </View>

        <View className="chart-legend-item">
          <View
            className="chart-legend-swatch"
            style={{ backgroundColor: colors.chartOutcome }}
          />
          <Text className="chart-legend-text">
            {t("dashboard.outcome", "Outcome")}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default CashflowChart;
