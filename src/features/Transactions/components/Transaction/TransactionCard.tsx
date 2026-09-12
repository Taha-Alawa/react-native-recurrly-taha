import { Image, Pressable, Text, View } from "react-native";
import clsx from "clsx";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { formatCurrency } from "@/core/utils/formatters";
import type { Transaction } from "@/features/Transactions/interfaces/Transaction.interface";

export type TransactionCardProps = {
  transaction: Transaction;
  onLongPress?: () => void;
};

/**
 * One recorded movement. Income and expense share a row shape so a week reads
 * as one ledger; only the sign, the colour and the badge separate them.
 */
const TransactionCard = ({ transaction, onLongPress }: TransactionCardProps) => {
  const { t } = useTranslation();
  const { type, name, amount, currency, date, origin, icon } = transaction;

  const isIncome = type === "income";
  const isSubscription = origin === "subscription";

  return (
    <Pressable
      className="tx-item"
      onLongPress={onLongPress}
      delayLongPress={350}
      accessibilityRole="button"
      accessibilityLabel={t("transactions.rowAccessibility", {
        name,
        defaultValue: "{{name}}. Hold to delete.",
      })}
    >
      <View
        className={clsx(
          "tx-item-badge",
          isIncome ? "tx-item-badge-income" : "tx-item-badge-outcome",
        )}
      >
        {isSubscription ? (
          <Image source={icon} className="tx-item-icon" />
        ) : (
          <Text
            className={clsx(
              "tx-item-glyph",
              isIncome ? "tx-item-glyph-income" : "tx-item-glyph-outcome",
            )}
          >
            {isIncome ? "+" : "−"}
          </Text>
        )}
      </View>

      <View className="tx-item-copy">
        <Text className="tx-item-name" numberOfLines={1}>
          {name}
        </Text>
        <Text className="tx-item-meta" numberOfLines={1}>
          {dayjs(date).format("ddd, MMM D · HH:mm")}
        </Text>
      </View>

      <View className="tx-item-amount-box">
        <Text
          className={clsx(
            "tx-item-amount",
            isIncome ? "tx-item-amount-income" : "tx-item-amount-outcome",
          )}
          numberOfLines={1}
        >
          {isIncome ? "+" : "−"}
          {formatCurrency(amount, currency)}
        </Text>
        <Text className="tx-item-tag" numberOfLines={1}>
          {isSubscription
            ? t("transactions.subscriptionTag", "Subscription")
            : isIncome
              ? t("transactions.income", "Income")
              : t("transactions.outcome", "Expense")}
        </Text>
      </View>
    </Pressable>
  );
};

export default TransactionCard;
