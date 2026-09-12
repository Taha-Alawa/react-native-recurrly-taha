import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { colors } from "@/core/theme/tokens";
import { formatCurrencyShort } from "@/core/utils/formatters";
import type { CategoryShare } from "@/features/Insights/utils/insightsCalculations";

export type CategorySplitProps = {
  shares: CategoryShare[];
};

/**
 * The annual commitment split by category.
 *
 * The pastel colours the cards use are background tints: as data fills several
 * of them are indistinguishable from each other even with full colour vision,
 * so identity here comes from the label and magnitude from the bar.
 */
const CategorySplit = ({ shares }: CategorySplitProps) => {
  const { t } = useTranslation();

  if (!shares.length) return null;

  return (
    <View className="breakdown-list">
      {shares.map((share) => (
        <View key={share.key} className="category-row">
          <View className="category-copy">
            <Text className="breakdown-name" numberOfLines={1}>
              {t(`categories.${share.category}`, { defaultValue: share.category })}
            </Text>

            <View className="breakdown-track">
              <View
                className="breakdown-fill"
                style={{
                  width: `${Math.max(2, share.share * 100)}%`,
                  backgroundColor: colors.accent,
                }}
              />
            </View>
          </View>

          <View className="category-figures">
            <Text className="breakdown-value" numberOfLines={1}>
              {Math.round(share.share * 100)}%
            </Text>
            <Text className="breakdown-caption" numberOfLines={1}>
              {formatCurrencyShort(share.total)}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
};

export default CategorySplit;
