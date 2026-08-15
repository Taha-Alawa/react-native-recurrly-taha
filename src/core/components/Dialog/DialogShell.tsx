import type { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

export type DialogShellProps = {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** Wrap the body in a ScrollView — for forms taller than the sheet. */
  scrollable?: boolean;
  /** Lift the sheet above the keyboard. */
  avoidKeyboard?: boolean;
  /** Tapping the backdrop dismisses. Off for forms with unsaved input. */
  dismissOnBackdropPress?: boolean;
  /** Blocks close while a request is in flight. */
  busy?: boolean;
};

/**
 * The one bottom-sheet shell every dialog in the app renders inside.
 *
 * Before this existed the same Modal + overlay + header + close-button markup
 * was copy-pasted into every modal; a change to the sheet chrome meant editing
 * each one. Feature dialogs now supply only their body.
 */
const DialogShell = ({
  visible,
  title,
  onClose,
  children,
  scrollable = false,
  avoidKeyboard = false,
  dismissOnBackdropPress = false,
  busy = false,
}: DialogShellProps) => {
  const handleClose = () => {
    if (busy) return;
    onClose();
  };

  const body = scrollable ? (
    <ScrollView
      contentContainerClassName="modal-body"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View className="modal-body">{children}</View>
  );

  const sheet = (
    // Swallows taps so only the backdrop dismisses.
    <Pressable className="modal-container" onPress={() => {}}>
      <View className="modal-header">
        <Text className="modal-title">{title}</Text>
        <Pressable className="modal-close" onPress={handleClose} hitSlop={8}>
          <Text className="modal-close-text">✕</Text>
        </Pressable>
      </View>
      {body}
    </Pressable>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <Pressable
        className="modal-overlay"
        onPress={dismissOnBackdropPress ? handleClose : undefined}
      >
        {avoidKeyboard ? (
          <KeyboardAvoidingView
            className="mt-auto"
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            {sheet}
          </KeyboardAvoidingView>
        ) : (
          sheet
        )}
      </Pressable>
    </Modal>
  );
};

export default DialogShell;
