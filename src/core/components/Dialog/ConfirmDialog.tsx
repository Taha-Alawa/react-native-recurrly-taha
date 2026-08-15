import { Pressable, Text, View } from "react-native";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import DialogShell from "@/core/components/Dialog/DialogShell";

export type ConfirmTone = "neutral" | "success" | "warn" | "danger";

export type ConfirmDialogProps = {
  visible: boolean;
  title: string;
  message: string;
  /** Glyph shown above the message. Rendered inside a centred badge. */
  glyph?: string;
  /** Drives the badge colour and the confirm button colour. */
  tone?: ConfirmTone;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Locks both buttons while the confirmed action is in flight. */
  disabled?: boolean;
  onConfirm: () => void;
  onClose: () => void;
  /** Hides the cancel button — used for acknowledge-only feedback. */
  acknowledgeOnly?: boolean;
};

const BADGE_TONE: Record<ConfirmTone, string> = {
  neutral: "confirm-badge-neutral",
  success: "confirm-badge-success",
  warn: "confirm-badge-warn",
  danger: "confirm-badge-danger",
};

const GLYPH_TONE: Record<ConfirmTone, string> = {
  neutral: "confirm-glyph-neutral",
  success: "confirm-glyph-success",
  warn: "confirm-glyph-warn",
  danger: "confirm-glyph-danger",
};

const ConfirmDialog = ({
  visible,
  title,
  message,
  glyph,
  tone = "neutral",
  confirmLabel,
  cancelLabel,
  disabled = false,
  onConfirm,
  onClose,
  acknowledgeOnly = false,
}: ConfirmDialogProps) => {
  const { t } = useTranslation();

  return (
    <DialogShell visible={visible} title={title} onClose={onClose} busy={disabled}>
      <View className="confirm-body">
        {glyph ? (
          // A View, not a styled Text: React Native centres a glyph with flex,
          // not with lineHeight — which pushed it out of the badge entirely.
          <View className={clsx("confirm-badge", BADGE_TONE[tone])}>
            <Text className={clsx("confirm-glyph", GLYPH_TONE[tone])}>
              {glyph}
            </Text>
          </View>
        ) : null}

        <Text className="confirm-message">{message}</Text>
      </View>

      <View className="confirm-actions">
        {!acknowledgeOnly && (
          <Pressable
            className={clsx("confirm-cancel", disabled && "auth-button-disabled")}
            onPress={onClose}
            disabled={disabled}
          >
            <Text className="confirm-cancel-text">
              {cancelLabel ?? t("common.cancel", "Cancel")}
            </Text>
          </Pressable>
        )}

        <Pressable
          className={clsx(
            "confirm-confirm",
            tone === "danger" && "confirm-confirm-destructive",
            tone === "success" && "confirm-confirm-success",
            disabled && "auth-button-disabled",
          )}
          onPress={onConfirm}
          disabled={disabled}
        >
          <Text className="confirm-confirm-text">
            {confirmLabel ?? t("common.ok", "OK")}
          </Text>
        </Pressable>
      </View>
    </DialogShell>
  );
};

export default ConfirmDialog;
