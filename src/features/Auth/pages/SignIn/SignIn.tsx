import { Text, View } from "react-native";
import { Link } from "expo-router";
import { useTranslation } from "react-i18next";
import TextField from "@/core/components/Form/TextField";
import SubmitButton from "@/core/components/Form/SubmitButton";
import AuthScreenShell from "@/features/Auth/components/AuthScreenShell";
import PasswordToggle from "@/features/Auth/components/PasswordToggle";
import useSignInForm from "@/features/Auth/hooks/useSignInForm";

const SignIn = () => {
  const { t } = useTranslation();
  const {
    values,
    errors,
    submitting,
    setField,
    handleSubmit,
    formError,
    showPassword,
    toggleShowPassword,
  } = useSignInForm();

  return (
    <AuthScreenShell
      title={t("auth.signIn.title", "Welcome back")}
      subtitle={t("auth.signIn.subtitle", "Sign in to continue managing your subscriptions")}
      footer={
        <View className="auth-link-row">
          <Text className="auth-link-copy">
            {t("auth.signIn.newToApp", "New to Subly?")}
          </Text>
          <Link href="/(auth)/sign-up" className="auth-link">
            {t("auth.signIn.createAccount", "Create an account")}
          </Link>
        </View>
      }
    >
      <TextField
        label={t("auth.signIn.emailLabel", "Email")}
        placeholder={t("auth.signIn.emailPlaceholder", "Enter your email")}
        value={values.email}
        onChangeText={(value) => setField("email", value)}
        error={errors.email}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        textContentType="emailAddress"
        editable={!submitting}
        returnKeyType="next"
      />

      <TextField
        label={t("auth.signIn.passwordLabel", "Password")}
        placeholder={t("auth.signIn.passwordPlaceholder", "Enter your password")}
        value={values.password}
        onChangeText={(value) => setField("password", value)}
        error={errors.password}
        secureTextEntry={!showPassword}
        autoCapitalize="none"
        autoCorrect={false}
        textContentType="password"
        editable={!submitting}
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
        trailing={
          <PasswordToggle visible={showPassword} onToggle={toggleShowPassword} />
        }
      />

      {formError ? (
        <Text className="auth-error text-center">{formError}</Text>
      ) : null}

      <SubmitButton
        label={t("auth.signIn.submit", "Sign in")}
        busy={submitting}
        onPress={handleSubmit}
      />
    </AuthScreenShell>
  );
};

export default SignIn;
