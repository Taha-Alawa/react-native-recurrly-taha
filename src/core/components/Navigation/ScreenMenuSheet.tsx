import { Pressable, Text } from "react-native";
import clsx from "clsx";
import DialogShell from "@/core/components/Dialog/DialogShell";
import { useDirection } from "@/core/components/Localization/LocalizationProvider";

export type ScreenMenuAction = {
  key: string;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  destructive?: boolean;
};

export type ScreenMenuSheetProps = {
  visible: boolean;
  title: string;
  actions: ScreenMenuAction[];
  onClose: () => void;
};

/** The sheet behind every screen's ••• header button. */
const ScreenMenuSheet = ({
  visible,
  title,
  actions,
  onClose,
}: ScreenMenuSheetProps) => {
  const direction = useDirection();

  return (
    <DialogShell
      visible={visible}
      title={title}
      onClose={onClose}
      dismissOnBackdropPress
    >
      {actions.map((action) => (
        <Pressable
          key={action.key}
          className={clsx(
            "menu-sheet-item",
            action.disabled && "menu-sheet-item-disabled",
          )}
          disabled={action.disabled}
          onPress={() => {
            onClose();
            action.onPress();
          }}
        >
          <Text
            className={clsx(
              "menu-sheet-item-text",
              action.destructive && "menu-sheet-item-text-destructive",
            )}
          >
            {action.label}
          </Text>
          <Text className="menu-sheet-chevron">{direction.forwardGlyph}</Text>
        </Pressable>
      ))}
    </DialogShell>
  );
};

export default ScreenMenuSheet;
