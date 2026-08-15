import { Stack } from "expo-router";

/** Chrome for the public (signed-out) audience. */
const AuthLayout = () => <Stack screenOptions={{ headerShown: false }} />;

export default AuthLayout;
