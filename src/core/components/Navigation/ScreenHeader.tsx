import { I18nManager, Image, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { icons } from "@/core/constants/icons";

export type ScreenHeaderProps = {
  title: string;
  /** Omit to render a spacer instead of a dead button. */
  onMenuPress?: () => void;
};

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
        <Image
          source={icons.back}
          className="screen-back-icon"
          style={I18nManager.isRTL ? { transform: [{ scaleX: -1 }] } : undefined}
        />
      </Pressable>

      <Text className="screen-title">{title}</Text>

      {onMenuPress ? (
        <Pressable
          className="screen-menu"
          onPress={onMenuPress}
          hitSlop={8}
          accessibilityRole="button"
        >
          <Text className="screen-menu-text">•••</Text>
        </Pressable>
      ) : (
        // Keeps the title optically centred on screens with no menu.
        <View className="screen-menu-placeholder" />
      )}
    </View>
  );
};

export default ScreenHeader;
