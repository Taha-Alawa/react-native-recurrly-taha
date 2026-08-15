import { ActivityIndicator, View } from "react-native";
import { colors } from "@/core/theme/tokens";

export type LoaderProps = {
  /** Fills its parent and centres — for whole-screen and whole-sheet waits. */
  fill?: boolean;
};

const Loader = ({ fill = false }: LoaderProps) => (
  <View className={fill ? "loader-fill" : "loader-inline"}>
    <ActivityIndicator color={colors.accent} />
  </View>
);

export default Loader;
