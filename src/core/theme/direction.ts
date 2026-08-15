import type { AppLanguage } from "@/core/i18n/languages";

/**
 * Direction configuration keyed by language (architecture §10).
 *
 * On the web this layer emits CSS custom properties on <html>. React Native has
 * no document, so the equivalent is NativeWind's variable context — the values
 * below are published as `--direction-*` variables by LocalizationProvider and
 * consumed by utility classes, so mirroring the layout costs zero component
 * changes.
 */
export type DirectionConfig = {
  /** Physical side text aligns to. */
  textAlign: "left" | "right";
  /** Value for React Native's `writingDirection` style. */
  writingDirection: "ltr" | "rtl";
  /** The opposite side — used for trailing affordances and chevrons. */
  mirroredAlign: "left" | "right";
  /** Glyph for "go back"/"previous" that already points the right way. */
  backGlyph: string;
  /** Glyph for "forward"/"next". */
  forwardGlyph: string;
  isRTL: boolean;
};

export const DIRECTION_BY_LANGUAGE: Record<AppLanguage, DirectionConfig> = {
  en: {
    textAlign: "left",
    writingDirection: "ltr",
    mirroredAlign: "right",
    backGlyph: "‹",
    forwardGlyph: "›",
    isRTL: false,
  },
  ar: {
    textAlign: "right",
    writingDirection: "rtl",
    mirroredAlign: "left",
    backGlyph: "›",
    forwardGlyph: "‹",
    isRTL: true,
  },
};

export const getDirectionConfig = (language: string): DirectionConfig =>
  DIRECTION_BY_LANGUAGE[language as AppLanguage] ?? DIRECTION_BY_LANGUAGE.en;
