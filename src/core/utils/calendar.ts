import type { Dayjs } from "dayjs";

export const DAYS_IN_WEEK = 7;

/** Every grid cell is one seventh wide, so rows stay square in any language. */
export const CALENDAR_CELL_WIDTH = `${100 / DAYS_IN_WEEK}%`;

export const buildMonthGrid = (month: Dayjs): (Dayjs | null)[] => {
  const startOfMonth = month.startOf("month");
  const leadingBlanks = (startOfMonth.day() + 6) % DAYS_IN_WEEK;

  const cells: (Dayjs | null)[] = Array.from(
    { length: leadingBlanks },
    () => null,
  );

  for (let day = 0; day < month.daysInMonth(); day += 1) {
    cells.push(startOfMonth.add(day, "day"));
  }

  while (cells.length % DAYS_IN_WEEK !== 0) {
    cells.push(null);
  }

  return cells;
};
