import type { ComponentProps } from "react";
import type { ImageSourcePropType } from "react-native";
import type { Ionicons } from "@expo/vector-icons";
import { icons } from "@/core/constants/icons";


export type AppTab = {
  name: string;
  titleKey: string;
  icon?: ImageSourcePropType;
  glyph?: ComponentProps<typeof Ionicons>["name"];
};

export const TABS: AppTab[] = [
  { name: "index", titleKey: "tabs.home", icon: icons.home },
  {
    name: "transactions",
    titleKey: "tabs.transactions",
    glyph: "swap-vertical",
  },
  { name: "subscriptions", titleKey: "tabs.subscriptions", icon: icons.wallet },
  { name: "insights", titleKey: "tabs.insights", icon: icons.activity },
  { name: "settings", titleKey: "tabs.settings", icon: icons.setting },
];
