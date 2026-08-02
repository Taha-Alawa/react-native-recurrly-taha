import { ClerkLoaded, ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { SplashScreen, Stack, usePathname, useGlobalSearchParams } from "expo-router";
import "./global.css";
import { useFonts } from "expo-font";
import { useEffect, useRef, useState } from "react";
import { tokenCache } from "@/lib/token-cache";
import { PostHogProvider } from "posthog-react-native";
import { posthog } from "@/src/config/posthog";
import { initI18n } from "@/lib/i18n";
import LocaleFontProvider from "@/components/LocaleFontProvider";

SplashScreen.preventAutoHideAsync();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error(
    "Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY. Add it to your .env file.",
  );
}

const RootNavigation = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const pathname = usePathname();
  const params = useGlobalSearchParams();
  const previousPathname = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (isLoaded) {
      SplashScreen.hideAsync();
    }
  }, [isLoaded]);

  useEffect(() => {
    if (previousPathname.current !== pathname) {
      posthog.screen(pathname, {
        previous_screen: previousPathname.current ?? null,
        ...params,
      });
      previousPathname.current = pathname;
    }
  }, [pathname, params]);

  if (!isLoaded) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!isSignedIn}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={!!isSignedIn}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
    </Stack>
  );
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "sans-regular": require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
    "sans-medium": require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
    "sans-semibold": require("../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
    "sans-bold": require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
    "sans-extrabold": require("../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
    "sans-light": require("../assets/fonts/PlusJakartaSans-Light.ttf"),
    "sans-regular-ar": require("../assets/fonts/IBMPlexSansArabic-Regular.ttf"),
    "sans-medium-ar": require("../assets/fonts/IBMPlexSansArabic-Medium.ttf"),
    "sans-semibold-ar": require("../assets/fonts/IBMPlexSansArabic-SemiBold.ttf"),
    "sans-bold-ar": require("../assets/fonts/IBMPlexSansArabic-Bold.ttf"),
    // IBM Plex Sans Arabic has no ExtraBold static weight — Bold is the closest match.
    "sans-extrabold-ar": require("../assets/fonts/IBMPlexSansArabic-Bold.ttf"),
    "sans-light-ar": require("../assets/fonts/IBMPlexSansArabic-Light.ttf"),
  });
  const [i18nReady, setI18nReady] = useState(false);

  useEffect(() => {
    initI18n().finally(() => setI18nReady(true));
  }, []);

  if (!fontsLoaded || !i18nReady) {
    return null;
  }

  return (
    <LocaleFontProvider>
      <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
        <ClerkLoaded>
          <PostHogProvider
            client={posthog}
            autocapture={{
              captureScreens: false,
              captureTouches: true,
              propsToCapture: ["testID"],
            }}
          >
            <RootNavigation />
          </PostHogProvider>
        </ClerkLoaded>
      </ClerkProvider>
    </LocaleFontProvider>
  );
}
