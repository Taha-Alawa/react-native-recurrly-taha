import { Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";

export type ListHeadingProps = {
  title: string;
  /** Hide the trailing action entirely, for headings that lead nowhere. */
  showAction?: boolean;
  actionLabel?: string;
  onActionPress?: () => void;
};

const ListHeading = ({
  title,
  showAction = true,
  actionLabel,
  onActionPress,
}: ListHeadingProps) => {
  const { t } = useTranslation();

  return (
    <View className="list-head">
      <Text className="list-title">{title}</Text>

      {showAction && (
        <TouchableOpacity
          className="list-action"
          onPress={onActionPress}
          disabled={!onActionPress}
          hitSlop={8}
        >
          <Text className="list-action-text">
            {actionLabel ?? t("common.viewAll", "View all")}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ListHeading;
