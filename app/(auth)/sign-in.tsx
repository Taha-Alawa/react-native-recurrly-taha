import { useState } from "react";
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
import { useSignIn } from "@clerk/clerk-expo";
import clsx from "clsx";
import { icons } from "@/constants/icons";
import { colors } from "@/constants/theme";
import { getAuthErrorMessage } from "@/lib/clerk-errors";

const SafeAreaView = styled(RNSafeAreaView);

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SignIn = () => {
  const { isLoaded, signIn, setActive } = useSignIn();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const nextErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      nextErrors.email = "Enter your email address.";
    } else if (!EMAIL_PATTERN.test(email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!password) {
      nextErrors.password = "Enter your password.";
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
      } else {
        setFormError(
          "We need a bit more information to sign you in. Please try again.",
        );
      }
    } catch (error) {
      setFormError(getAuthErrorMessage(error));
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
          <View className="auth-brand-block">
            <View className="auth-logo-wrap">
              <Image source={icons.logo} className="auth-logo-mark" />
              <View>
                <Text className="auth-wordmark">Recurly</Text>
                <Text className="auth-wordmark-sub">Smart Billing</Text>
              </View>
            </View>
            <Text className="auth-title">Welcome back</Text>
            <Text className="auth-subtitle">
              Sign in to continue managing your subscriptions
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
                    placeholder="Enter your password"
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
                      {showPassword ? "Hide" : "Show"}
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
                  <Text className="auth-button-text">Sign in</Text>
                )}
              </Pressable>
            </View>
          </View>

          <View className="auth-link-row">
            <Text className="auth-link-copy">New to Recurly?</Text>
            <Link href="/(auth)/sign-up" className="auth-link">
              Create an account
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignIn;
