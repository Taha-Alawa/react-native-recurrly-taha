import { Text } from "react-native";
import { Link } from "expo-router";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
const SafeAreaView = styled(RNSafeAreaView)

export default function Index() {
  return (
    <SafeAreaView
      className="flex-1 bg-background p-5"
    >
      <Text className="bg-background text-primary p-4 rounded">Edit app/index.tsx to edit this screen.</Text>
      <Link href="/onboarding" className="mt-4 rounded bg-primary text-white p-4">
        Go to onboarding
      </Link>
      <Link href="/(auth)/sign-in" className="mt-4 rounded bg-primary text-white p-4">
        Go to sign in
      </Link>
      <Link href="/(auth)/sign-up" className="mt-4 rounded bg-primary text-white p-4">
        Go to sign up
      </Link>

      <Link href="/(tabs)/subscriptions" className="mt-4 rounded bg-primary text-white p-4">
        Go to subscriptions
      </Link>
      <Link href="/subscriptions/spotify" className="mt-4 rounded bg-primary text-white p-4">
        Go to spotify subscription details
      </Link>
      <Link 
        href={{
          pathname: "/subscriptions/[id]",
          params: { id: "claude" },
        }} 
        className="mt-4 rounded bg-primary text-white p-4">
        claude subscription details
      </Link>
    </SafeAreaView>
  );
}
