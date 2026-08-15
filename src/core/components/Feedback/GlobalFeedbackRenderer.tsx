import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ConfirmDialog, {
  type ConfirmTone,
} from "@/core/components/Dialog/ConfirmDialog";
import feedbackService, {
  type FeedbackMessage,
  type FeedbackType,
} from "@/core/services/feedbackService";

const GLYPH_BY_TYPE: Record<FeedbackType, string> = {
  success: "✓",
  info: "i",
  warn: "!",
  error: "✕",
};

const TONE_BY_TYPE: Record<FeedbackType, ConfirmTone> = {
  success: "success",
  info: "neutral",
  warn: "warn",
  error: "danger",
};

/**
 * Mounted once at the root layout (architecture §6). Registers its queue push
 * on mount, then drains one message at a time so a burst never stacks modals.
 */
const GlobalFeedbackRenderer = () => {
  const { t } = useTranslation();
  const [queue, setQueue] = useState<FeedbackMessage[]>([]);

  useEffect(() => {
    feedbackService.register((message) =>
      setQueue((current) => {
        // Three screens failing the same read should not mean three identical
        // dialogs to dismiss in a row.
        const last = current[current.length - 1];
        if (last && last.type === message.type && last.message === message.message) {
          return current;
        }
        return [...current, message];
      }),
    );

    return () => feedbackService.register(null);
  }, []);

  const active = queue[0] ?? null;
  const dismiss = () => setQueue((current) => current.slice(1));
  const type = active?.type ?? "info";

  return (
    <ConfirmDialog
      visible={Boolean(active)}
      title={t(`common.feedback.${type}`, type)}
      message={active?.message ?? ""}
      glyph={GLYPH_BY_TYPE[type]}
      tone={TONE_BY_TYPE[type]}
      acknowledgeOnly
      onConfirm={dismiss}
      onClose={dismiss}
    />
  );
};

export default GlobalFeedbackRenderer;
