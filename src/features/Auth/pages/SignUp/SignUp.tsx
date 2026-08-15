import { Text, View } from "react-native";
import { Link } from "expo-router";
import { useTranslation } from "react-i18next";
import TextField from "@/core/components/Form/TextField";
import SubmitButton from "@/core/components/Form/SubmitButton";
import AuthScreenShell from "@/features/Auth/components/AuthScreenShell";
import PasswordToggle from "@/features/Auth/components/PasswordToggle";
import useSignUpForm from "@/features/Auth/hooks/useSignUpForm";

const SignUp = () => {
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
  } = useSignUpForm();

  return (
    <AuthScreenShell
      title={t("auth.signUp.title", "Create your account")}
      subtitle={t("auth.signUp.subtitle", "Track every subscription and never miss a renewal again")}
      footer={
        <View className="auth-link-row">
          <Text className="auth-link-copy">
            {t("auth.signUp.alreadyHaveAccount", "Already have an account?")}
          </Text>
          <Link href="/(auth)/sign-in" className="auth-link">
            {t("auth.signUp.signIn", "Sign in")}
          </Link>
        </View>
      }
    >
      <TextField
        label={t("auth.signUp.emailLabel", "Email")}
        placeholder={t("auth.signUp.emailPlaceholder", "Enter your email")}
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
        label={t("auth.signUp.passwordLabel", "Password")}
        placeholder={t("auth.signUp.passwordPlaceholder", "Create a password")}
        value={values.password}
        onChangeText={(value) => setField("password", value)}
        error={errors.password}
        secureTextEntry={!showPassword}
        autoCapitalize="none"
        autoCorrect={false}
        textContentType="newPassword"
        editable={!submitting}
        returnKeyType="next"
        trailing={
          <PasswordToggle visible={showPassword} onToggle={toggleShowPassword} />
        }
      />

      {!errors.password && (
        <Text className="auth-helper">
          {t("auth.signUp.passwordHelper", "At least 8 characters")}
        </Text>
      )}

      <TextField
        label={t("auth.signUp.confirmPasswordLabel", "Confirm password")}
        placeholder={t("auth.signUp.confirmPasswordPlaceholder", "Re-enter your password")}
        value={values.confirmPassword}
        onChangeText={(value) => setField("confirmPassword", value)}
        error={errors.confirmPassword}
        secureTextEntry={!showPassword}
        autoCapitalize="none"
        autoCorrect={false}
        textContentType="newPassword"
        editable={!submitting}
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
      />

      {formError ? (
        <Text className="auth-error text-center">{formError}</Text>
      ) : null}

      <SubmitButton
        label={t("auth.signUp.submit", "Create account")}
        busy={submitting}
        onPress={handleSubmit}
      />
    </AuthScreenShell>
  );
};

export default SignUp;
