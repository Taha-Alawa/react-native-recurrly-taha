import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import useForm from "@/core/hooks/useForm";
import {
  BALANCE_DEFAULT_VALUES,
  BalanceSchema,
  type BalanceFormValues,
} from "@/features/Balance/schemas/Balance/BalanceSchema";

export type UseBalanceFormOptions = {
  currentAmount: number;
  onSubmit: (values: BalanceFormValues) => void | Promise<void>;
};

export const useBalanceForm = ({
  currentAmount,
  onSubmit,
}: UseBalanceFormOptions) => {
  const { i18n } = useTranslation();
  const schema = useMemo(() => BalanceSchema(), [i18n.language]);

  const form = useForm<BalanceFormValues>({
    schema,
    defaultValues: BALANCE_DEFAULT_VALUES,
    onSubmit,
  });

  const { reset } = form;

  // Seed the field from the balance being edited, so the sheet opens showing
  // the current value rather than an empty box.
  useEffect(() => {
    reset({ amount: String(currentAmount) });
  }, [currentAmount, reset]);

  return form;
};

export default useBalanceForm;
