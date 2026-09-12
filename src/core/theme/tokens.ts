/**
 * Design tokens — the single source of truth for colour, spacing and component
 * metrics. Nothing in features/ may hard-code a hex value or a raw pixel size;
 * it reads from here, or from the matching CSS custom properties in global.css.
 */

export const colors = {
    background: "#f6f3fc",
    foreground: "#1e1b3a",
    card: "#ffffff",
    muted: "#ece6fa",
    mutedForeground: "rgba(30, 27, 58, 0.6)",
    primary: "#1e1b3a",
    accent: "#8b5cf6",
    border: "rgba(30, 27, 58, 0.12)",
    success: "#16a34a",
    destructive: "#dc2626",
    subscription: "#c4b5fd",

    /**
     * Chart series. Deliberately not the green/red used for transaction text:
     * as adjacent bars that pair separates by a CVD Delta-E of 5, which readers
     * with deuteranopia cannot tell apart. Green against the brand accent
     * separates by 28 and passes every check against this light surface.
     */
    chartIncome: "#16a34a",
    chartOutcome: "#8b5cf6",
} as const;

export const spacing = {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    9: 36,
    10: 40,
    11: 44,
    12: 48,
    14: 56,
    16: 64,
    18: 72,
    20: 80,
    24: 96,
    30: 120,
} as const;

export const components = {
    tabBar: {
        height: spacing[18],
        horizontalInset: spacing[5],
        radius: spacing[8],
        iconFrame: spacing[12],
        itemPaddingVertical: spacing[2],
    },
    chart: {
        /** Plot height the bars are scaled against. */
        trackHeight: 112,
        /** Floor for a non-zero bar, so a small month still draws. */
        minBarHeight: 3,
    },
} as const;

export const theme = {
    colors,
    spacing,
    components,
} as const;
