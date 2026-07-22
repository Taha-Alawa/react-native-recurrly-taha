import { Text, View } from "react-native";
import { Link } from "expo-router";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
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
      <Link href="/(tabs)/subscriptions/spotify" className="mt-4 rounded bg-primary text-white p-4">
        Go to spotify subscription details
      </Link>
      <Link 
        href={{
          pathname: "/(tabs)/subscriptions/[id]",
          params: { id: "claude" },
        }} 
        className="mt-4 rounded bg-primary text-white p-4">
        claude subscription details
      </Link>
    </View>
  );
}
