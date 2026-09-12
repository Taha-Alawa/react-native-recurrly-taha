import { InputAccessoryView, Keyboard, Platform, Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import TextField from "@/core/components/Form/TextField";
import SubmitButton from "@/core/components/Form/SubmitButton";
import { formatCurrency } from "@/core/utils/formatters";
import useBalanceForm from "@/features/Balance/hooks/Balance/useBalanceForm";
import type { BalanceFormValues } from "@/features/Balance/schemas/Balance/BalanceSchema";

const BALANCE_ACCESSORY_ID = "balance-decimal-pad-accessory";

export type BalanceFormProps = {
  startingAmount: number;
  currentAmount: number;
  transactionsNet: number;
  onSubmit: (values: BalanceFormValues) => void | Promise<void>;
};

const BalanceForm = ({
  startingAmount,
  currentAmount,
  transactionsNet,
  onSubmit,
}: BalanceFormProps) => {
  const { t } = useTranslation();
  const { values, errors, submitting, setField, handleSubmit } = useBalanceForm({
    seedAmount: startingAmount,
    onSubmit,
  });

  const hasTransactions = transactionsNet !== 0;

  return (
    <>
      <View className="calendar-summary">
        <Text className="calendar-summary-label">
          {t("modal.updateBalance.currentLabel", "Current balance")}
        </Text>
        <Text className="calendar-summary-value" numberOfLines={1}>
          {formatCurrency(currentAmount)}
        </Text>
        {hasTransactions && (
          <Text className="auth-helper" numberOfLines={1}>
            {t("modal.updateBalance.breakdown", {
              starting: formatCurrency(startingAmount),
              movement: `${transactionsNet > 0 ? "+" : "−"}${formatCurrency(
                Math.abs(transactionsNet),
              )}`,
              defaultValue: "{{starting}} starting {{movement}} from transactions",
            })}
          </Text>
        )}
      </View>

      <TextField
        label={t("modal.updateBalance.amountLabel", "Starting balance")}
        placeholder={t("modal.updateBalance.amountPlaceholder", "e.g. 2489.48")}
        value={values.amount}
        onChangeText={(value) => setField("amount", value)}
        error={errors.amount}
        editable={!submitting}
        keyboardType="decimal-pad"
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
        autoFocus
        selectTextOnFocus
        inputAccessoryViewID={Platform.OS === "ios" ? BALANCE_ACCESSORY_ID : undefined}
      />

      <SubmitButton
        label={t("modal.updateBalance.submit", "Save Balance")}
        busy={submitting}
        onPress={handleSubmit}
      />

      {Platform.OS === "ios" && (
        <InputAccessoryView nativeID={BALANCE_ACCESSORY_ID}>
          <View className="modal-accessory-bar">
            <Pressable onPress={() => Keyboard.dismiss()} hitSlop={8}>
              <Text className="modal-accessory-bar-text">
                {t("modal.createSubscription.done", "Done")}
              </Text>
            </Pressable>
          </View>
        </InputAccessoryView>
      )}
    </>
  );
};

export default BalanceForm;
