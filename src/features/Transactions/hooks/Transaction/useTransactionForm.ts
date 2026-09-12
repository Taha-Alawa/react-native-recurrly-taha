import { useEffect, useMemo } from "react";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import useForm from "@/core/hooks/useForm";
import type { PickerOption } from "@/core/components/Form/OptionPicker";
import {
  TRANSACTION_DEFAULT_VALUES,
  TransactionSchema,
  type TransactionFormValues,
} from "@/features/Transactions/schemas/Transaction/TransactionSchema";
import {
  INCOME_SOURCES,
  OUTCOME_NAMES,
} from "@/features/Transactions/constants/transactionCategories";
import type { TransactionType } from "@/features/Transactions/interfaces/Transaction.interface";

export type UseTransactionFormOptions = {
  /** Which side the sheet was opened on. */
  initialType: TransactionType;
  /** The sheet is mounted permanently, so this is what marks a fresh session. */
  isOpen: boolean;
  onSubmit: (values: TransactionFormValues) => void | Promise<void>;
};

/**
 * Form hook for the transaction entity (architecture §4.3b).
 */
export const useTransactionForm = ({
  initialType,
  isOpen,
  onSubmit,
}: UseTransactionFormOptions) => {
  const { t, i18n } = useTranslation();

  // Rebuilt per language so validation messages follow the active locale.
  const schema = useMemo(() => TransactionSchema(), [i18n.language]);

  const form = useForm<TransactionFormValues>({
    schema,
    defaultValues: TRANSACTION_DEFAULT_VALUES,
    onSubmit,
  });

  const { reset } = form;

  // Re-seeded on every open, not just on mount. The dialog shell keeps this
  // form mounted while hidden, so without this an abandoned half-typed entry
  // would still be sitting there next time — and the date would be the day the
  // screen was first opened rather than today.
  useEffect(() => {
    if (!isOpen) return;

    reset({
      type: initialType,
      name: "",
      amount: "",
      date: dayjs().hour(12).startOf("hour").toISOString(),
    });
  }, [initialType, isOpen, reset]);

  const typeOptions: PickerOption<TransactionType>[] = useMemo(
    () => [
      { value: "income", label: t("transactions.income", "Income") },
      { value: "outcome", label: t("transactions.outcome", "Expense") },
    ],
    [t],
  );

  /** Suggestions only — the name field stays free text. */
  const nameSuggestions = useMemo(() => {
    const source =
      form.values.type === "income" ? INCOME_SOURCES : OUTCOME_NAMES;

    return source.map((name) => ({
      value: name,
      label: t(`transactionNames.${name}`, { defaultValue: name }),
    }));
  }, [form.values.type, t]);

  return { ...form, typeOptions, nameSuggestions };
};

export default useTransactionForm;
