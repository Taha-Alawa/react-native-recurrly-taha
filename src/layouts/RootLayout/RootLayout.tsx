import { useEffect, useRef, useState } from "react";
import {
  SplashScreen,
  Stack,
  useGlobalSearchParams,
  usePathname,
} from "expo-router";
import { useFonts } from "expo-font";
import { PostHogProvider } from "posthog-react-native";
import { posthog } from "@/core/services/posthog";
import { initI18n } from "@/core/i18n";
import useAuthSession from "@/core/hooks/useAuthSession";
import LocalizationProvider from "@/core/components/Localization/LocalizationProvider";
import GlobalFeedbackRenderer from "@/core/components/Feedback/GlobalFeedbackRenderer";

SplashScreen.preventAutoHideAsync();

/**
 * Pure URL-to-audience map. Route groups split the two audiences; each group's
 * layout composes the chrome and providers only it needs.
 */
const RootNavigation = () => {
  const { isLoading, isSignedIn } = useAuthSession();
  const pathname = usePathname();
  const params = useGlobalSearchParams();
  const previousPathname = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!isLoading) SplashScreen.hideAsync();
  }, [isLoading]);

  useEffect(() => {
    if (previousPathname.current !== pathname) {
      posthog.screen(pathname, {
        previous_screen: previousPathname.current ?? null,
        ...params,
      });
      previousPathname.current = pathname;
    }
  }, [pathname, params]);

  if (isLoading) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!isSignedIn}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={isSignedIn}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
    </Stack>
  );
};

/**
 * Holds only what is universal (architecture §2): global styles, the language
 * and direction bootstrap, and the global feedback renderer.
 */
const RootLayout = () => {
  const [fontsLoaded] = useFonts({
    "sans-regular": require("@/assets/fonts/PlusJakartaSans-Regular.ttf"),
    "sans-medium": require("@/assets/fonts/PlusJakartaSans-Medium.ttf"),
    "sans-semibold": require("@/assets/fonts/PlusJakartaSans-SemiBold.ttf"),
    "sans-bold": require("@/assets/fonts/PlusJakartaSans-Bold.ttf"),
    "sans-extrabold": require("@/assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
    "sans-light": require("@/assets/fonts/PlusJakartaSans-Light.ttf"),
    "sans-regular-ar": require("@/assets/fonts/IBMPlexSansArabic-Regular.ttf"),
    "sans-medium-ar": require("@/assets/fonts/IBMPlexSansArabic-Medium.ttf"),
    "sans-semibold-ar": require("@/assets/fonts/IBMPlexSansArabic-SemiBold.ttf"),
    "sans-bold-ar": require("@/assets/fonts/IBMPlexSansArabic-Bold.ttf"),
    // IBM Plex Sans Arabic has no ExtraBold static weight — Bold is the closest.
    "sans-extrabold-ar": require("@/assets/fonts/IBMPlexSansArabic-Bold.ttf"),
    "sans-light-ar": require("@/assets/fonts/IBMPlexSansArabic-Light.ttf"),
  });

  const [i18nReady, setI18nReady] = useState(false);

  useEffect(() => {
    initI18n().finally(() => setI18nReady(true));
  }, []);

  if (!fontsLoaded || !i18nReady) return null;

  return (
    <LocalizationProvider>
      <PostHogProvider
        client={posthog}
        autocapture={{
          captureScreens: false,
          captureTouches: true,
          propsToCapture: ["testID"],
        }}
      >
        <RootNavigation />
        <GlobalFeedbackRenderer />
      </PostHogProvider>
    </LocalizationProvider>
  );
};

export default RootLayout;
