import type { ImageSourcePropType } from "react-native";
import { icons } from "@/core/constants/icons";

export type AppTab = {
  name: string;
  titleKey: string;
  icon: ImageSourcePropType;
};

export const TABS: AppTab[] = [
  { name: "index", titleKey: "tabs.home", icon: icons.home },
  { name: "subscriptions", titleKey: "tabs.subscriptions", icon: icons.wallet },
  { name: "insights", titleKey: "tabs.insights", icon: icons.activity },
  { name: "settings", titleKey: "tabs.settings", icon: icons.setting },
];
