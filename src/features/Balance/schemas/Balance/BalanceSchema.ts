import i18n from "@/core/i18n";
import { validators, type ValidationSchema } from "@/core/utils/validation";

export type BalanceFormValues = {
  amount: string;
};

export const BALANCE_DEFAULT_VALUES: BalanceFormValues = { amount: "" };

export const BalanceSchema = (): ValidationSchema<BalanceFormValues> => ({
  amount: [
    validators.number(
      i18n.t(
        "modal.updateBalance.errors.amountInvalid",
        "Enter a valid amount of 0 or more.",
      ),
      { min: 0 },
    ),
  ],
});
