import { Image, View } from "react-native";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { colors, components } from "@/core/theme/tokens";
import { TABS } from "@/core/constants/navigation";

const tabBar = components.tabBar;

const TabIcon = ({
  focused,
  icon,
}: {
  focused: boolean;
  icon: React.ComponentProps<typeof Image>["source"];
}) => (
  <View className="tabs-icon">
    <View className={clsx("tabs-pill", focused && "tabs-active")}>
      <Image source={icon} className="tabs-glyph" />
    </View>
  </View>
);

/** Chrome for the authenticated audience. */
const TabsLayout = () => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: "absolute",
          bottom: Math.max(insets.bottom, tabBar.horizontalInset),
          height: tabBar.height,
          marginHorizontal: tabBar.horizontalInset,
          borderRadius: tabBar.radius,
          backgroundColor: colors.primary,
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarItemStyle: {
          paddingVertical: tabBar.height / 2 - tabBar.iconFrame / 1.6,
        },
        tabBarIconStyle: {
          width: tabBar.iconFrame,
          height: tabBar.iconFrame,
          alignItems: "center",
        },
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: t(tab.titleKey),
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} icon={tab.icon} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
};

export default TabsLayout;
