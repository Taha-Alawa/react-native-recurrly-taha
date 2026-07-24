import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
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
import { icons } from "@/constants/icons";
import { colors } from "@/constants/theme";
import { getAuthErrorMessage } from "@/lib/clerk-errors";

const SafeAreaView = styled(RNSafeAreaView);

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESEND_COOLDOWN_SECONDS = 30;

type FormErrors = {
  email?: string;
  password?: string;
  confirmPassword?: string;
};

const SignUp = () => {
  const { isLoaded, signUp, setActive } = useSignUp();

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
      nextErrors.email = "Enter your email address.";
    } else if (!EMAIL_PATTERN.test(email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!password) {
      nextErrors.password = "Create a password.";
    } else if (password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters.";
    }

    if (confirmPassword !== password) {
      nextErrors.confirmPassword = "Passwords don't match.";
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
    } catch (error) {
      setFormError(getAuthErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const onVerifyPress = async () => {
    if (!isLoaded || submitting) return;

    setCodeError("");
    if (!code.trim()) {
      setCodeError("Enter the 6-digit code.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: code.trim(),
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
      } else {
        setCodeError("We couldn't verify that code. Please try again.");
      }
    } catch (error) {
      setCodeError(getAuthErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const onResendPress = async () => {
    if (!isLoaded || resendCooldown > 0) return;

    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      setCodeError("");
    } catch (error) {
      setCodeError(getAuthErrorMessage(error));
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
            <View className="auth-brand-block">
              <View className="auth-logo-wrap">
                <Image source={icons.logo} className="auth-logo-mark" />
                <View>
                  <Text className="auth-wordmark">Recurly</Text>
                  <Text className="auth-wordmark-sub">Smart Billing</Text>
                </View>
              </View>
              <Text className="auth-title">Check your email</Text>
              <Text className="auth-subtitle">
                Enter the 6-digit code we sent to {email.trim()}
              </Text>
            </View>

            <View className="auth-card">
              <View className="auth-form">
                <View className="auth-field">
                  <Text className="auth-label">Verification code</Text>
                  <TextInput
                    className={clsx(
                      "auth-input text-center text-xl tracking-[8px]",
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
                    <Text className="auth-button-text">Verify and continue</Text>
                  )}
                </Pressable>

                <View className="items-center gap-3">
                  <Pressable onPress={onResendPress} disabled={resendCooldown > 0}>
                    <Text className="auth-helper">
                      {resendCooldown > 0
                        ? `Resend code in ${resendCooldown}s`
                        : "Didn't get a code? Resend it"}
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      setStage("form");
                      setCode("");
                      setCodeError("");
                    }}
                  >
                    <Text className="auth-link">Edit email address</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
          <View className="auth-brand-block">
            <View className="auth-logo-wrap">
              <Image source={icons.logo} className="auth-logo-mark" />
              <View>
                <Text className="auth-wordmark">Recurly</Text>
                <Text className="auth-wordmark-sub">Smart Billing</Text>
              </View>
            </View>
            <Text className="auth-title">Create your account</Text>
            <Text className="auth-subtitle">
              Track every subscription and never miss a renewal again
            </Text>
          </View>

          <View className="auth-card">
            <View className="auth-form">
              <View className="auth-field">
                <Text className="auth-label">Email</Text>
                <TextInput
                  className={clsx(
                    "auth-input",
                    errors.email && "auth-input-error",
                  )}
                  placeholder="Enter your email"
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
                <Text className="auth-label">Password</Text>
                <View className="justify-center">
                  <TextInput
                    className={clsx(
                      "auth-input pr-16",
                      errors.password && "auth-input-error",
                    )}
                    placeholder="Create a password"
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
                      {showPassword ? "Hide" : "Show"}
                    </Text>
                  </Pressable>
                </View>
                {errors.password ? (
                  <Text className="auth-error">{errors.password}</Text>
                ) : (
                  <Text className="auth-helper">At least 8 characters</Text>
                )}
              </View>

              <View className="auth-field">
                <Text className="auth-label">Confirm password</Text>
                <TextInput
                  className={clsx(
                    "auth-input",
                    errors.confirmPassword && "auth-input-error",
                  )}
                  placeholder="Re-enter your password"
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
                  <Text className="auth-button-text">Create account</Text>
                )}
              </Pressable>
            </View>
          </View>

          <View className="auth-link-row">
            <Text className="auth-link-copy">Already have an account?</Text>
            <Link href="/(auth)/sign-in" className="auth-link">
              Sign in
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignUp;
