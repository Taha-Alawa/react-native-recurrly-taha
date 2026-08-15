import i18n from "@/core/i18n";
import { validators, type ValidationSchema } from "@/core/utils/validation";
import type { BillingCycle } from "@/features/Subscriptions/interfaces/Subscription.interface";
import { SUBSCRIPTION_CATEGORIES } from "@/features/Subscriptions/constants/subscriptionCategories";

/** The form's value type is inferred from the schema (architecture §7). */
export type SubscriptionFormValues = {
  name: string;
  price: string;
  frequency: BillingCycle;
  category: string;
};

export const SUBSCRIPTION_DEFAULT_VALUES: SubscriptionFormValues = {
  name: "",
  price: "",
  frequency: "Monthly",
  category: SUBSCRIPTION_CATEGORIES[0],
};

/**
 * Built as a function so translated messages resolve at call time — a schema
 * frozen at module load would keep the language active during the first import.
 */
export const SubscriptionSchema = (): ValidationSchema<SubscriptionFormValues> => ({
  name: [
    validators.required(
      i18n.t("modal.createSubscription.errors.nameRequired", "Enter a subscription name."),
    ),
  ],
  price: [
    validators.number(
      i18n.t("modal.createSubscription.errors.priceInvalid", "Enter a valid price greater than 0."),
      { exclusiveMin: 0 },
    ),
  ],
});
