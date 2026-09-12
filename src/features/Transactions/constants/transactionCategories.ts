/**
 * Suggestions, not a closed set — the name field stays free text so anything
 * can be typed. These only exist to save typing on the common cases.
 */
export const INCOME_SOURCES = [
  "Salary",
  "Freelance",
  "Refund",
  "Gift",
  "Investment",
  "Other",
] as const;

export const OUTCOME_NAMES = [
  "Supermarket",
  "Restaurant",
  "Online Shopping",
  "Transport",
  "Bills",
  "Health",
  "Other",
] as const;
