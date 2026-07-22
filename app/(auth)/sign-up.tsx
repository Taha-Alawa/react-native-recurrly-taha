import { Link } from 'expo-router';
import { Text, View } from 'react-native';

const SignUp = () => {
  return (
    <View>
      <Text className="text-primary">Sign Up Screen</Text>
      <Link href="/(auth)/sign-in" className="mt-4 rounded bg-primary text-white p-4">
        sign in
      </Link>
    </View>
  );
}

export default SignUp;
