import { InputAccessoryView, Keyboard, Platform, Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import TextField from "@/core/components/Form/TextField";
import SubmitButton from "@/core/components/Form/SubmitButton";
import { formatCurrency } from "@/core/utils/formatters";
import useBalanceForm from "@/features/Balance/hooks/Balance/useBalanceForm";
import type { BalanceFormValues } from "@/features/Balance/schemas/Balance/BalanceSchema";

const BALANCE_ACCESSORY_ID = "balance-decimal-pad-accessory";

export type BalanceFormProps = {
  currentAmount: number;
  onSubmit: (values: BalanceFormValues) => void | Promise<void>;
};

const BalanceForm = ({ currentAmount, onSubmit }: BalanceFormProps) => {
  const { t } = useTranslation();
  const { values, errors, submitting, setField, handleSubmit } = useBalanceForm({
    currentAmount,
    onSubmit,
  });

  return (
    <>
      <View className="calendar-summary">
        <Text className="calendar-summary-label">
          {t("modal.updateBalance.currentLabel", "Current balance")}
        </Text>
        <Text className="calendar-summary-value" numberOfLines={1}>
          {formatCurrency(currentAmount)}
        </Text>
      </View>

      <TextField
        label={t("modal.updateBalance.amountLabel", "New balance")}
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
