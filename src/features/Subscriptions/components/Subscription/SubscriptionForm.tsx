import { InputAccessoryView, Keyboard, Platform, Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import TextField from "@/core/components/Form/TextField";
import OptionPicker from "@/core/components/Form/OptionPicker";
import ChipPicker from "@/core/components/Form/ChipPicker";
import SubmitButton from "@/core/components/Form/SubmitButton";
import useSubscriptionForm from "@/features/Subscriptions/hooks/Subscription/useSubscriptionForm";
import type { SubscriptionFormValues } from "@/features/Subscriptions/schemas/Subscription/SubscriptionSchema";
import type { Subscription } from "@/features/Subscriptions/interfaces/Subscription.interface";

const PRICE_ACCESSORY_ID = "price-decimal-pad-accessory";

export type SubscriptionFormProps = {
  data?: Subscription | null;
  onSubmit: (values: SubscriptionFormValues) => void | Promise<void>;
  /** Driven by a `read` dialog type — renders the same fields, uneditable. */
  readOnly?: boolean;
};

/**
 * Presentation only (architecture §7.3). It never decides whether it is
 * creating or updating — the dialog passes the right submit handler in.
 */
const SubscriptionForm = ({ data, onSubmit, readOnly = false }: SubscriptionFormProps) => {
  const { t } = useTranslation();
  const {
    values,
    errors,
    submitting,
    setField,
    handleSubmit,
    frequencyOptions,
    categoryOptions,
  } = useSubscriptionForm({ data, onSubmit });

  return (
    <>
      <TextField
        label={t("modal.createSubscription.nameLabel", "Name")}
        placeholder={t("modal.createSubscription.namePlaceholder", "e.g. Netflix")}
        value={values.name}
        onChangeText={(value) => setField("name", value)}
        error={errors.name}
        editable={!submitting}
        readOnly={readOnly}
        returnKeyType="next"
      />

      <TextField
        label={t("modal.createSubscription.priceLabel", "Price")}
        placeholder={t("modal.createSubscription.pricePlaceholder", "e.g. 9.99")}
        value={values.price}
        onChangeText={(value) => setField("price", value)}
        error={errors.price}
        editable={!submitting}
        readOnly={readOnly}
        keyboardType="decimal-pad"
        returnKeyType="done"
        inputAccessoryViewID={Platform.OS === "ios" ? PRICE_ACCESSORY_ID : undefined}
      />

      <OptionPicker
        label={t("modal.createSubscription.frequencyLabel", "Frequency")}
        options={frequencyOptions}
        value={values.frequency}
        onChange={(value) => setField("frequency", value)}
        disabled={submitting || readOnly}
      />

      <ChipPicker
        label={t("modal.createSubscription.categoryLabel", "Category")}
        options={categoryOptions}
        value={values.category}
        onChange={(value) => setField("category", value)}
        disabled={submitting || readOnly}
      />

      {!readOnly && (
        <SubmitButton
          label={
            data
              ? t("modal.updateSubscription.submit", "Save Changes")
              : t("modal.createSubscription.submit", "Add Subscription")
          }
          busyLabel={t("modal.createSubscription.submitting", "Adding…")}
          busy={submitting}
          onPress={handleSubmit}
        />
      )}

      {Platform.OS === "ios" && (
        <InputAccessoryView nativeID={PRICE_ACCESSORY_ID}>
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

export default SubscriptionForm;
