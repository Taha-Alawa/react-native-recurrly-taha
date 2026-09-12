import i18n from "@/core/i18n";
import { validators, type ValidationSchema } from "@/core/utils/validation";
import type { TransactionType } from "@/features/Transactions/interfaces/Transaction.interface";

/** The form's value type is inferred from the schema (architecture §7). */
export type TransactionFormValues = {
  type: TransactionType;
  name: string;
  amount: string;
  /** ISO day the money moved. */
  date: string;
};

export const TRANSACTION_DEFAULT_VALUES: TransactionFormValues = {
  type: "outcome",
  name: "",
  amount: "",
  date: "",
};

/**
 * Built as a function so translated messages resolve at call time — a schema
 * frozen at module load would keep the language active during the first import.
 */
export const TransactionSchema = (): ValidationSchema<TransactionFormValues> => ({
  name: [
    validators.required(
      i18n.t(
        "modal.createTransaction.errors.nameRequired",
        "Enter what this was for.",
      ),
    ),
  ],
  amount: [
    validators.number(
      i18n.t(
        "modal.createTransaction.errors.amountInvalid",
        "Enter a valid amount greater than 0.",
      ),
      { exclusiveMin: 0 },
    ),
  ],
  date: [
    validators.required(
      i18n.t("modal.createTransaction.errors.dateRequired", "Pick a date."),
    ),
  ],
});
