import { Image, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { icons } from '@/constants/icons';

const ScreenHeader = ({ title, onMenuPress }: ScreenHeaderProps) => {
  const router = useRouter();

  return (
    <View className="screen-header">
      <Pressable
        className="screen-back"
        onPress={() => {
          if (router.canGoBack()) router.back();
        }}
        hitSlop={8}
      >
        <Image source={icons.back} className="screen-back-icon" />
      </Pressable>
      <Text className="screen-title">{title}</Text>
      <Pressable className="screen-menu" onPress={onMenuPress} hitSlop={8}>
        <Text className="screen-menu-text">•••</Text>
      </Pressable>
    </View>
  );
};

export default ScreenHeader;
