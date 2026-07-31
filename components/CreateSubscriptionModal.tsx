import { useState } from 'react';
import {
  InputAccessoryView,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { icons } from '@/constants/icons';
import { colors } from '@/constants/theme';
import { CATEGORY_COLORS, SUBSCRIPTION_CATEGORIES } from '@/constants/data';
import { posthog } from '@/src/config/posthog';

type Frequency = 'Monthly' | 'Yearly';

const DEFAULT_CATEGORY = SUBSCRIPTION_CATEGORIES[0];
const PRICE_ACCESSORY_ID = 'price-decimal-pad-accessory';

const CreateSubscriptionModal = ({
  visible,
  onClose,
  onCreate,
}: CreateSubscriptionModalProps) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [frequency, setFrequency] = useState<Frequency>('Monthly');
  const [category, setCategory] = useState<string>(DEFAULT_CATEGORY);
  const [errors, setErrors] = useState<{ name?: string; price?: string }>({});
  const [creating, setCreating] = useState(false);

  const resetForm = () => {
    setName('');
    setPrice('');
    setFrequency('Monthly');
    setCategory(DEFAULT_CATEGORY);
    setErrors({});
  };

  const handleClose = () => {
    if (creating) return;
    onClose();
  };

  const validate = () => {
    const nextErrors: { name?: string; price?: string } = {};

    if (!name.trim()) {
      nextErrors.name = 'Enter a subscription name.';
    }

    const priceValue = Number(price);
    if (!price.trim() || Number.isNaN(priceValue) || priceValue <= 0) {
      nextErrors.price = 'Enter a valid price greater than 0.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleCreate = () => {
    if (creating) return;
    if (!validate()) return;

    setCreating(true);
    try {
      const trimmedName = name.trim();
      const priceValue = Number(price);
      const startDate = dayjs();
      const renewalDate =
        frequency === 'Yearly'
          ? startDate.add(1, 'year')
          : startDate.add(1, 'month');

      const subscription: Subscription = {
        id: `${trimmedName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
        icon: icons.wallet,
        name: trimmedName,
        category,
        status: 'active',
        startDate: startDate.toISOString(),
        price: priceValue,
        currency: 'USD',
        billing: frequency,
        frequency,
        renewalDate: renewalDate.toISOString(),
        color: CATEGORY_COLORS[category] ?? CATEGORY_COLORS.Other,
      };

      onCreate(subscription);
      posthog.capture('subscription_created', {
        subscription_name: name.trim(),
        subscription_price: price,
        subscription_frequency: frequency,
        subscription_category: category
      })
      resetForm();
      onClose();
    } finally {
      setCreating(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View className="modal-overlay">
        <KeyboardAvoidingView
          className="mt-auto"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View className="modal-container">
            <View className="modal-header">
              <Text className="modal-title">New Subscription</Text>
              <Pressable
                className="modal-close"
                onPress={handleClose}
                hitSlop={8}
              >
                <Text className="modal-close-text">✕</Text>
              </Pressable>
            </View>

            <ScrollView
              contentContainerClassName="modal-body"
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View className="auth-field">
                <Text className="auth-label">Name</Text>
                <TextInput
                  className={clsx(
                    'auth-input',
                    errors.name && 'auth-input-error',
                  )}
                  placeholder="e.g. Netflix"
                  placeholderTextColor={colors.mutedForeground}
                  value={name}
                  onChangeText={(value) => {
                    setName(value);
                    if (errors.name) {
                      setErrors((prev) => ({ ...prev, name: undefined }));
                    }
                  }}
                  returnKeyType="next"
                  editable={!creating}
                />
                {errors.name && (
                  <Text className="auth-error">{errors.name}</Text>
                )}
              </View>

              <View className="auth-field">
                <Text className="auth-label">Price</Text>
                <TextInput
                  className={clsx(
                    'auth-input',
                    errors.price && 'auth-input-error',
                  )}
                  placeholder="e.g. 9.99"
                  placeholderTextColor={colors.mutedForeground}
                  value={price}
                  onChangeText={(value) => {
                    setPrice(value);
                    if (errors.price) {
                      setErrors((prev) => ({ ...prev, price: undefined }));
                    }
                  }}
                  keyboardType="decimal-pad"
                  returnKeyType="done"
                  editable={!creating}
                  inputAccessoryViewID={
                    Platform.OS === 'ios' ? PRICE_ACCESSORY_ID : undefined
                  }
                />
                {errors.price && (
                  <Text className="auth-error">{errors.price}</Text>
                )}
              </View>

              <View className="auth-field">
                <Text className="auth-label">Frequency</Text>
                <View className="picker-row">
                  <Pressable
                    className={clsx(
                      'picker-option',
                      frequency === 'Monthly' && 'picker-option-active',
                    )}
                    onPress={() => setFrequency('Monthly')}
                  >
                    <Text
                      className={clsx(
                        'picker-option-text',
                        frequency === 'Monthly' &&
                          'picker-option-text-active',
                      )}
                    >
                      Monthly
                    </Text>
                  </Pressable>
                  <Pressable
                    className={clsx(
                      'picker-option',
                      frequency === 'Yearly' && 'picker-option-active',
                    )}
                    onPress={() => setFrequency('Yearly')}
                  >
                    <Text
                      className={clsx(
                        'picker-option-text',
                        frequency === 'Yearly' && 'picker-option-text-active',
                      )}
                    >
                      Yearly
                    </Text>
                  </Pressable>
                </View>
              </View>

              <View className="auth-field">
                <Text className="auth-label">Category</Text>
                <View className="category-scroll">
                  {SUBSCRIPTION_CATEGORIES.map((option) => (
                    <Pressable
                      key={option}
                      className={clsx(
                        'category-chip',
                        category === option && 'category-chip-active',
                      )}
                      onPress={() => setCategory(option)}
                    >
                      <Text
                        className={clsx(
                          'category-chip-text',
                          category === option && 'category-chip-text-active',
                        )}
                      >
                        {option}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <Pressable
                className={clsx('auth-button', creating && 'auth-button-disabled')}
                onPress={handleCreate}
                disabled={creating}
              >
                <Text className="auth-button-text">
                  {creating ? 'Adding…' : 'Add Subscription'}
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>

      {Platform.OS === 'ios' && (
        <InputAccessoryView nativeID={PRICE_ACCESSORY_ID}>
          <View className="modal-accessory-bar">
            <Pressable onPress={() => Keyboard.dismiss()} hitSlop={8}>
              <Text className="modal-accessory-bar-text">Done</Text>
            </Pressable>
          </View>
        </InputAccessoryView>
      )}
    </Modal>
  );
};

export default CreateSubscriptionModal;
