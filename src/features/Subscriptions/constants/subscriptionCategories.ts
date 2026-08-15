export const SUBSCRIPTION_CATEGORIES = [
  "Entertainment",
  "AI Tools",
  "Developer Tools",
  "Design",
  "Productivity",
  "Cloud",
  "Music",
  "Other",
] as const;

export type SubscriptionCategory = (typeof SUBSCRIPTION_CATEGORIES)[number];

export const CATEGORY_COLORS: Record<string, string> = {
  Entertainment: "#f7b6c2",
  "AI Tools": "#b8d4e3",
  "Developer Tools": "#e8def8",
  Design: "#f5c542",
  Productivity: "#cfe8c9",
  Cloud: "#bcd9f0",
  Music: "#f9d29d",
  Other: "#f6eecf",
};
