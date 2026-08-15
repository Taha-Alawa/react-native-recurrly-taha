import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/core/components/Localization/LanguageSwitcher";

const SafeAreaView = styled(RNSafeAreaView);

export type AuthScreenShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
};

/**
 * The chrome shared by sign-in, sign-up and verification: keyboard handling,
 * the language pill, and the brand block. Previously duplicated three times.
 */
const AuthScreenShell = ({
  title,
  subtitle,
  children,
  footer,
}: AuthScreenShellProps) => {
  const { t } = useTranslation();

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
          <LanguageSwitcher />

          <View className="auth-brand-block">
            <View className="auth-logo-wrap">
              <View className="auth-logo-mark">
                <Text className="auth-logo-mark-text">S</Text>
              </View>
              <View>
                <Text className="auth-wordmark">Subly</Text>
                <Text className="auth-wordmark-sub">
                  {t("auth.wordmarkSub", "Smart Billing")}
                </Text>
              </View>
            </View>
            <Text className="auth-title">{title}</Text>
            <Text className="auth-subtitle">{subtitle}</Text>
          </View>

          <View className="auth-card">
            <View className="auth-form">{children}</View>
          </View>

          {footer}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AuthScreenShell;
