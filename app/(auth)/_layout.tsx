import { View } from 'react-native';
import { Stack } from "expo-router";

const Layout = () => {
  return (
    <View>
      <Stack screenOptions={{ headerShown: false }} />
    </View>
  );
}

export default Layout;
