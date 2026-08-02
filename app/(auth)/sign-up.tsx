import { useEffect, useRef, useState } from "react";
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
import { useSignUp } from "@clerk/clerk-expo";
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
const RESEND_COOLDOWN_SECONDS = 30;

type FormErrors = {
  email?: string;
  password?: string;
  confirmPassword?: string;
};

const SignUp = () => {
  const { t } = useTranslation();
  const { isLoaded, signUp, setActive } = useSignUp();
  const posthog = usePostHog();
  const { currentLanguage } = useLanguageSwitcher();
  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  const [stage, setStage] = useState<"form" | "verify">("form");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const cooldownTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (resendCooldown <= 0) {
      if (cooldownTimer.current) clearInterval(cooldownTimer.current);
      return;
    }

    cooldownTimer.current = setInterval(() => {
      setResendCooldown((value) => Math.max(0, value - 1));
    }, 1000);

    return () => {
      if (cooldownTimer.current) clearInterval(cooldownTimer.current);
    };
  }, [resendCooldown]);

  const validate = () => {
    const nextErrors: FormErrors = {};

    if (!email.trim()) {
      nextErrors.email = t("auth.signUp.errors.emailRequired");
    } else if (!EMAIL_PATTERN.test(email.trim())) {
      nextErrors.email = t("auth.signUp.errors.emailInvalid");
    }

    if (!password) {
      nextErrors.password = t("auth.signUp.errors.passwordRequired");
    } else if (password.length < 8) {
      nextErrors.password = t("auth.signUp.errors.passwordTooShort");
    }

    if (confirmPassword !== password) {
      nextErrors.confirmPassword = t("auth.signUp.errors.passwordMismatch");
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const onSignUpPress = async () => {
    if (!isLoaded || submitting) return;

    setFormError("");
    if (!validate()) return;

    setSubmitting(true);
    try {
      await signUp.create({
        emailAddress: email.trim(),
        password,
      });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      setStage("verify");
      posthog.capture("email_verification_requested");
    } catch (error) {
      setFormError(getAuthErrorMessage(error));
      posthog.capture("sign_up_failed", {
        reason: getAuthErrorMessage(error),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const onVerifyPress = async () => {
    if (!isLoaded || submitting) return;

    setCodeError("");
    if (!code.trim()) {
      setCodeError(t("auth.signUp.verify.codeRequired"));
      return;
    }

    setSubmitting(true);
    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: code.trim(),
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        posthog.identify(email.trim(), {
          $set_once: { sign_up_date: new Date().toISOString() },
        });
        posthog.capture("email_verified");
      } else {
        setCodeError(t("auth.signUp.verify.codeInvalid"));
      }
    } catch (error) {
      setCodeError(getAuthErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const onResendPress = async () => {
    if (!isLoaded || resendCooldown > 0 || submitting) return;

    setSubmitting(true);
    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      setCodeError("");
    } catch (error) {
      setCodeError(getAuthErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  if (stage === "verify") {
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
              <Text className="auth-title">{t("auth.signUp.verify.title")}</Text>
              <Text className="auth-subtitle">
                {t("auth.signUp.verify.subtitle", { email: email.trim() })}
              </Text>
            </View>

            <View className="auth-card">
              <View className="auth-form">
                <View className="auth-field">
                  <Text className="auth-label">
                    {t("auth.signUp.verify.codeLabel")}
                  </Text>
                  <TextInput
                    className={clsx(
                      "auth-input text-xl tracking-[8px]",
                      codeError && "auth-input-error",
                    )}
                    placeholder="000000"
                    placeholderTextColor={colors.mutedForeground}
                    value={code}
                    onChangeText={(value) => {
                      setCode(value.replace(/[^0-9]/g, "").slice(0, 6));
                      if (codeError) setCodeError("");
                    }}
                    keyboardType="number-pad"
                    maxLength={6}
                    editable={!submitting}
                    returnKeyType="done"
                    onSubmitEditing={onVerifyPress}
                  />
                  {codeError && <Text className="auth-error">{codeError}</Text>}
                </View>

                <Pressable
                  className={clsx(
                    "auth-button",
                    (submitting || !isLoaded) && "auth-button-disabled",
                  )}
                  onPress={onVerifyPress}
                  disabled={submitting || !isLoaded}
                >
                  {submitting ? (
                    <ActivityIndicator color={colors.primary} />
                  ) : (
                    <Text className="auth-button-text">
                      {t("auth.signUp.verify.submit")}
                    </Text>
                  )}
                </Pressable>

                <View className="items-center gap-3">
                  <Pressable onPress={onResendPress} disabled={resendCooldown > 0}>
                    <Text className="auth-helper">
                      {resendCooldown > 0
                        ? t("auth.signUp.verify.resendIn", {
                            seconds: resendCooldown,
                          })
                        : t("auth.signUp.verify.resendNow")}
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      setStage("form");
                      setCode("");
                      setCodeError("");
                    }}
                  >
                    <Text className="auth-link">
                      {t("auth.signUp.verify.editEmail")}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        <LanguagePickerModal
          visible={languageModalVisible}
          onClose={() => setLanguageModalVisible(false)}
        />
      </SafeAreaView>
    );
  }

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
            <Text className="auth-title">{t("auth.signUp.title")}</Text>
            <Text className="auth-subtitle">{t("auth.signUp.subtitle")}</Text>
          </View>

          <View className="auth-card">
            <View className="auth-form">
              <View className="auth-field">
                <Text className="auth-label">
                  {t("auth.signUp.emailLabel")}
                </Text>
                <TextInput
                  className={clsx(
                    "auth-input",
                    errors.email && "auth-input-error",
                  )}
                  placeholder={t("auth.signUp.emailPlaceholder")}
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
                  {t("auth.signUp.passwordLabel")}
                </Text>
                <View className="justify-center">
                  <TextInput
                    className={clsx(
                      "auth-input pr-16",
                      errors.password && "auth-input-error",
                    )}
                    placeholder={t("auth.signUp.passwordPlaceholder")}
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
                    textContentType="newPassword"
                    editable={!submitting}
                    returnKeyType="next"
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
                {errors.password ? (
                  <Text className="auth-error">{errors.password}</Text>
                ) : (
                  <Text className="auth-helper">
                    {t("auth.signUp.passwordHelper")}
                  </Text>
                )}
              </View>

              <View className="auth-field">
                <Text className="auth-label">
                  {t("auth.signUp.confirmPasswordLabel")}
                </Text>
                <TextInput
                  className={clsx(
                    "auth-input",
                    errors.confirmPassword && "auth-input-error",
                  )}
                  placeholder={t("auth.signUp.confirmPasswordPlaceholder")}
                  placeholderTextColor={colors.mutedForeground}
                  value={confirmPassword}
                  onChangeText={(value) => {
                    setConfirmPassword(value);
                    if (errors.confirmPassword) {
                      setErrors((prev) => ({
                        ...prev,
                        confirmPassword: undefined,
                      }));
                    }
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="newPassword"
                  editable={!submitting}
                  returnKeyType="done"
                  onSubmitEditing={onSignUpPress}
                />
                {errors.confirmPassword && (
                  <Text className="auth-error">{errors.confirmPassword}</Text>
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
                onPress={onSignUpPress}
                disabled={submitting || !isLoaded}
              >
                {submitting ? (
                  <ActivityIndicator color={colors.primary} />
                ) : (
                  <Text className="auth-button-text">
                    {t("auth.signUp.submit")}
                  </Text>
                )}
              </Pressable>
            </View>
          </View>

          <View className="auth-link-row">
            <Text className="auth-link-copy">
              {t("auth.signUp.alreadyHaveAccount")}
            </Text>
            <Link href="/(auth)/sign-in" className="auth-link">
              {t("auth.signUp.signIn")}
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

export default SignUp;
