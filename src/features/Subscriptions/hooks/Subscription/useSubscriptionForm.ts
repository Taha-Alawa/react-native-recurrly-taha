import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import useForm from "@/core/hooks/useForm";
import type { PickerOption } from "@/core/components/Form/OptionPicker";
import {
  SUBSCRIPTION_DEFAULT_VALUES,
  SubscriptionSchema,
  type SubscriptionFormValues,
} from "@/features/Subscriptions/schemas/Subscription/SubscriptionSchema";
import { SUBSCRIPTION_CATEGORIES } from "@/features/Subscriptions/constants/subscriptionCategories";
import type {
  BillingCycle,
  Subscription,
} from "@/features/Subscriptions/interfaces/Subscription.interface";

export type UseSubscriptionFormOptions = {
  /** Present when editing — hydrates the form from the row being changed. */
  data?: Subscription | null;
  onSubmit: (values: SubscriptionFormValues) => void | Promise<void>;
};

/**
 * Form hook for the subscription entity (architecture §4.3b): the form instance
 * bound to the schema resolver, its defaults, the hydration effect, and the
 * lookup data the form's pickers need.
 */
export const useSubscriptionForm = ({
  data,
  onSubmit,
}: UseSubscriptionFormOptions) => {
  const { t, i18n } = useTranslation();

  // Rebuilt per language so validation messages follow the active locale.
  const schema = useMemo(() => SubscriptionSchema(), [i18n.language]);

  const form = useForm<SubscriptionFormValues>({
    schema,
    defaultValues: SUBSCRIPTION_DEFAULT_VALUES,
    onSubmit,
  });

  const { reset } = form;

  useEffect(() => {
    if (!data) {
      reset();
      return;
    }

    reset({
      name: data.name,
      price: String(data.price),
      frequency: (data.frequency ?? data.billing) as BillingCycle,
      category: data.category ?? SUBSCRIPTION_CATEGORIES[0],
    });
  }, [data, reset]);

  const frequencyOptions: PickerOption<BillingCycle>[] = useMemo(
    () => [
      { value: "Monthly", label: t("modal.createSubscription.monthly", "Monthly") },
      { value: "Yearly", label: t("modal.createSubscription.yearly", "Yearly") },
    ],
    [t],
  );

  const categoryOptions: PickerOption<string>[] = useMemo(
    () =>
      SUBSCRIPTION_CATEGORIES.map((category) => ({
        value: category,
        label: t(`categories.${category}`, category),
      })),
    [t],
  );

  return { ...form, frequencyOptions, categoryOptions };
};

export default useSubscriptionForm;
