import { Link } from 'expo-router';
import { Text, View } from 'react-native';

const SignIn = () => {
  return (
    <View>
      <Text className="text-primary">Sign In Screen</Text>
      <Link href="/(auth)/sign-up" className="mt-4 rounded bg-primary text-white p-4">
        create account
      </Link>
    </View>
  );
}

export default SignIn;
