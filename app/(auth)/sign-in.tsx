import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import { Link } from "expo-router";
import { useSignIn } from "@clerk/clerk-expo";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { colors } from "@/constants/theme";
import { getAuthErrorMessage } from "@/lib/clerk-errors";
import { usePostHog } from "posthog-react-native";
import { useLanguageSwitcher } from "@/hooks/useLanguageSwitcher";
import LanguagePickerModal from "@/components/LanguagePickerModal";
import { LANGUAGE_NAMES } from "@/lib/i18n";

const SafeAreaView = styled(RNSafeAreaView);

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SignIn = () => {
  const { t } = useTranslation();
  const { isLoaded, signIn, setActive } = useSignIn();
  const posthog = usePostHog();
  const { currentLanguage } = useLanguageSwitcher();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  const validate = () => {
    const nextErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      nextErrors.email = t("auth.signIn.errors.emailRequired");
    } else if (!EMAIL_PATTERN.test(email.trim())) {
      nextErrors.email = t("auth.signIn.errors.emailInvalid");
    }

    if (!password) {
      nextErrors.password = t("auth.signIn.errors.passwordRequired");
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const onSignInPress = async () => {
    if (!isLoaded || submitting) return;

    setFormError("");
    if (!validate()) return;

    setSubmitting(true);
    try {
      const result = await signIn.create({
        identifier: email.trim(),
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        posthog.identify(email.trim());
        posthog.capture("user_signed_in", {
          $set_once: { first_sign_in_date: new Date().toISOString() },
        });
      } else {
        setFormError(t("auth.signIn.incompleteError"));
        posthog.capture("sign_in_failed", {
          reason: "incomplete_status",
        });
      }
    } catch (error) {
      setFormError(getAuthErrorMessage(error));
      posthog.capture("sign_in_failed", {
        reason: getAuthErrorMessage(error),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="auth-safe-area">
      <KeyboardAvoidingView
        className="auth-screen"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          className="auth-scroll"
          contentContainerClassName="auth-content"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="auth-lang-row">
            <Pressable
              className="auth-lang-toggle"
              onPress={() => setLanguageModalVisible(true)}
              hitSlop={8}
            >
              <Text className="auth-lang-toggle-text">
                {LANGUAGE_NAMES[currentLanguage]}
              </Text>
            </Pressable>
          </View>

          <View className="auth-brand-block">
            <View className="auth-logo-wrap">
              <View className="auth-logo-mark">
                <Text className="auth-logo-mark-text">S</Text>
              </View>
              <View>
                <Text className="auth-wordmark">Subly</Text>
                <Text className="auth-wordmark-sub">
                  {t("auth.wordmarkSub")}
                </Text>
              </View>
            </View>
            <Text className="auth-title">{t("auth.signIn.title")}</Text>
            <Text className="auth-subtitle">{t("auth.signIn.subtitle")}</Text>
          </View>

          <View className="auth-card">
            <View className="auth-form">
              <View className="auth-field">
                <Text className="auth-label">
                  {t("auth.signIn.emailLabel")}
                </Text>
                <TextInput
                  className={clsx(
                    "auth-input",
                    errors.email && "auth-input-error",
                  )}
                  placeholder={t("auth.signIn.emailPlaceholder")}
                  placeholderTextColor={colors.mutedForeground}
                  value={email}
                  onChangeText={(value) => {
                    setEmail(value);
                    if (errors.email) {
                      setErrors((prev) => ({ ...prev, email: undefined }));
                    }
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  editable={!submitting}
                  returnKeyType="next"
                />
                {errors.email && (
                  <Text className="auth-error">{errors.email}</Text>
                )}
              </View>

              <View className="auth-field">
                <Text className="auth-label">
                  {t("auth.signIn.passwordLabel")}
                </Text>
                <View className="justify-center">
                  <TextInput
                    className={clsx(
                      "auth-input pr-16",
                      errors.password && "auth-input-error",
                    )}
                    placeholder={t("auth.signIn.passwordPlaceholder")}
                    placeholderTextColor={colors.mutedForeground}
                    value={password}
                    onChangeText={(value) => {
                      setPassword(value);
                      if (errors.password) {
                        setErrors((prev) => ({
                          ...prev,
                          password: undefined,
                        }));
                      }
                    }}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType="password"
                    editable={!submitting}
                    returnKeyType="done"
                    onSubmitEditing={onSignInPress}
                  />
                  <Pressable
                    className="absolute right-4"
                    onPress={() => setShowPassword((value) => !value)}
                    hitSlop={8}
                  >
                    <Text className="text-xs font-sans-bold text-accent">
                      {showPassword
                        ? t("auth.signIn.hide")
                        : t("auth.signIn.show")}
                    </Text>
                  </Pressable>
                </View>
                {errors.password && (
                  <Text className="auth-error">{errors.password}</Text>
                )}
              </View>

              {formError ? (
                <Text className="auth-error text-center">{formError}</Text>
              ) : null}

              <Pressable
                className={clsx(
                  "auth-button",
                  (submitting || !isLoaded) && "auth-button-disabled",
                )}
                onPress={onSignInPress}
                disabled={submitting || !isLoaded}
              >
                {submitting ? (
                  <ActivityIndicator color={colors.primary} />
                ) : (
                  <Text className="auth-button-text">
                    {t("auth.signIn.submit")}
                  </Text>
                )}
              </Pressable>
            </View>
          </View>

          <View className="auth-link-row">
            <Text className="auth-link-copy">
              {t("auth.signIn.newToApp")}
            </Text>
            <Link href="/(auth)/sign-up" className="auth-link">
              {t("auth.signIn.createAccount")}
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <LanguagePickerModal
        visible={languageModalVisible}
        onClose={() => setLanguageModalVisible(false)}
      />
    </SafeAreaView>
  );
};

export default SignIn;
