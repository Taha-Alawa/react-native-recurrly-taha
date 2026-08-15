import { Pressable, Text, View } from "react-native";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { formatCurrency } from "@/core/utils/formatters";

export type BalanceCardProps = {
  amount: number;
  onPress: () => void;
  /** Soonest real renewal; the row is hidden when there is none. */
  nextRenewalDate?: string;
};

const BalanceCard = ({ amount, onPress, nextRenewalDate }: BalanceCardProps) => {
  const { t } = useTranslation();

  return (
    <Pressable
      className="home-balance-card"
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t("home.editBalance", "Edit total balance")}
    >
      <View className="home-balance-top-row">
        <Text className="home-balance-label">
          {t("home.balanceLabel", "Total balance")}
        </Text>
        <View className="home-balance-badge">
          <Text className="home-balance-badge-text">✎</Text>
        </View>
      </View>

      {/* Arabic-Indic numerals run much wider than Latin at this size. */}
      <Text
        className="home-balance-amount"
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.6}
      >
        {formatCurrency(amount)}
      </Text>

      <View className="home-balance-bottom-row">
        <View className="home-balance-bottom-dot" />
        <Text className="home-balance-date" numberOfLines={1}>
          {nextRenewalDate
            ? `${t("home.nextRenewal", "Next renewal")} · ${dayjs(nextRenewalDate).format("MMM D")}`
            : t("home.noRenewals", "No upcoming renewals")}
        </Text>
      </View>
    </Pressable>
  );
};

export default BalanceCard;
