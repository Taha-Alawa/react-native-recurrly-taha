import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { formatCurrency } from "@/core/utils/formatters";

export type BalanceCardProps = {
  amount: number;
};

/**
 * Display only. The figure is the starting balance plus every transaction, so
 * there is nothing to tap here — it moves when a transaction is recorded, not
 * when the card is edited.
 */
const BalanceCard = ({ amount }: BalanceCardProps) => {
  const { t } = useTranslation();

  return (
    <View className="home-balance-card">
      <Text className="home-balance-label">
        {t("home.balanceLabel", "Total balance")}
      </Text>

      {/* Arabic-Indic numerals run much wider than Latin at this size. */}
      <Text
        className="home-balance-amount"
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.6}
      >
        {formatCurrency(amount)}
      </Text>
    </View>
  );
};

export default BalanceCard;
