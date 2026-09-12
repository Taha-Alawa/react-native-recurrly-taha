import {
  InputAccessoryView,
  Keyboard,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import clsx from "clsx";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import TextField from "@/core/components/Form/TextField";
import OptionPicker from "@/core/components/Form/OptionPicker";
import DateField from "@/core/components/Inputs/DateField";
import SubmitButton from "@/core/components/Form/SubmitButton";
import useTransactionForm from "@/features/Transactions/hooks/Transaction/useTransactionForm";
import type { TransactionFormValues } from "@/features/Transactions/schemas/Transaction/TransactionSchema";
import type { TransactionType } from "@/features/Transactions/interfaces/Transaction.interface";

const AMOUNT_ACCESSORY_ID = "transaction-decimal-pad-accessory";

export type TransactionFormProps = {
  /** Marks a fresh session so the fields re-seed on every open. */
  isOpen: boolean;
  initialType: TransactionType;
  onSubmit: (values: TransactionFormValues) => void | Promise<void>;
};

/**
 * Presentation only (architecture §7.3). The wording follows the chosen side —
 * income is asked for its source, an expense for what it was spent on — but it
 * stays one form, because both write the same row.
 */
const TransactionForm = ({
  isOpen,
  initialType,
  onSubmit,
}: TransactionFormProps) => {
  const { t } = useTranslation();
  const {
    values,
    errors,
    submitting,
    setField,
    handleSubmit,
    typeOptions,
    nameSuggestions,
  } = useTransactionForm({ initialType, isOpen, onSubmit });

  const isIncome = values.type === "income";

  return (
    <>
      <OptionPicker
        label={t("modal.createTransaction.typeLabel", "Type")}
        options={typeOptions}
        value={values.type}
        onChange={(value) => setField("type", value)}
        disabled={submitting}
      />

      <TextField
        label={
          isIncome
            ? t("modal.createTransaction.sourceLabel", "Source")
            : t("modal.createTransaction.nameLabel", "Transaction")
        }
        placeholder={
          isIncome
            ? t("modal.createTransaction.sourcePlaceholder", "e.g. Salary")
            : t("modal.createTransaction.namePlaceholder", "e.g. Supermarket")
        }
        value={values.name}
        onChangeText={(value) => setField("name", value)}
        error={errors.name}
        editable={!submitting}
        returnKeyType="next"
      />

      <View className="category-scroll tx-suggestions">
        {nameSuggestions.map((suggestion) => {
          const isActive =
            values.name.trim().toLowerCase() === suggestion.value.toLowerCase();

          return (
            <Pressable
              key={suggestion.value}
              className={clsx(
                "category-chip",
                isActive && "category-chip-active",
                submitting && "opacity-50",
              )}
              onPress={() => setField("name", suggestion.value)}
              disabled={submitting}
            >
              <Text
                className={clsx(
                  "category-chip-text",
                  isActive && "category-chip-text-active",
                )}
              >
                {suggestion.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <TextField
        label={t("modal.createTransaction.amountLabel", "Amount")}
        placeholder={t("modal.createTransaction.amountPlaceholder", "e.g. 24.90")}
        value={values.amount}
        onChangeText={(value) => setField("amount", value)}
        error={errors.amount}
        editable={!submitting}
        keyboardType="decimal-pad"
        returnKeyType="done"
        inputAccessoryViewID={
          Platform.OS === "ios" ? AMOUNT_ACCESSORY_ID : undefined
        }
      />

      <DateField
        label={t("modal.createTransaction.dateLabel", "Date")}
        value={values.date}
        onChange={(value) => setField("date", value)}
        error={errors.date}
        disabled={submitting}
        maxDate={dayjs().toISOString()}
      />

      <SubmitButton
        label={
          isIncome
            ? t("modal.createTransaction.submitIncome", "Add Income")
            : t("modal.createTransaction.submitOutcome", "Add Expense")
        }
        busyLabel={t("modal.createTransaction.submitting", "Saving…")}
        busy={submitting}
        onPress={handleSubmit}
      />

      {Platform.OS === "ios" && (
        <InputAccessoryView nativeID={AMOUNT_ACCESSORY_ID}>
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

export default TransactionForm;
