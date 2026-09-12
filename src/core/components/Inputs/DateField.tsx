import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import clsx from "clsx";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import {
  buildMonthGrid,
  CALENDAR_CELL_WIDTH as CELL_WIDTH,
} from "@/core/utils/calendar";
import { useDirection } from "@/core/components/Localization/LocalizationProvider";

export type DateFieldProps = {
  label: string;
  /** ISO string, or "" while nothing is chosen. */
  value: string;
  onChange: (isoDate: string) => void;
  error?: string;
  disabled?: boolean;
  /** Days after this are unselectable — a transaction cannot happen later. */
  maxDate?: string;
};

/**
 * Single-day picker that expands in place rather than opening a second modal.
 *
 * A nested Modal inside the dialog sheet is the obvious implementation and the
 * wrong one on React Native: the inner one animates over the outer sheet and
 * loses the keyboard-avoiding context the form sits in. Expanding inline keeps
 * one layer, and the form dialog already scrolls.
 */
const DateField = ({
  label,
  value,
  onChange,
  error,
  disabled = false,
  maxDate,
}: DateFieldProps) => {
  const { t } = useTranslation();
  const direction = useDirection();
  const weekdayLabels = t("common.weekdays", {
    returnObjects: true,
  }) as string[];

  const selected = value ? dayjs(value) : null;
  const limit = maxDate ? dayjs(maxDate).endOf("day") : null;

  const [isExpanded, setExpanded] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() =>
    selected?.isValid() ? selected.startOf("month") : dayjs().startOf("month"),
  );

  const monthCells = useMemo(() => buildMonthGrid(visibleMonth), [visibleMonth]);

  const select = (day: dayjs.Dayjs) => {
    // Noon, not midnight: the row is read back in the device's timezone, and a
    // midnight ISO string lands on the previous day west of UTC.
    onChange(day.hour(12).minute(0).second(0).millisecond(0).toISOString());
    setExpanded(false);
  };

  const quickPicks = [
    { key: "today", label: t("common.today", "Today"), day: dayjs() },
    {
      key: "yesterday",
      label: t("common.yesterday", "Yesterday"),
      day: dayjs().subtract(1, "day"),
    },
  ];

  return (
    <View className="auth-field">
      <Text className="auth-label">{label}</Text>

      <Pressable
        className={clsx(
          "date-field-trigger",
          error && "auth-input-error",
          disabled && "opacity-50",
        )}
        onPress={() => setExpanded((current) => !current)}
        disabled={disabled}
        accessibilityRole="button"
      >
        <Text className="date-field-value" numberOfLines={1}>
          {selected?.isValid()
            ? selected.format("ddd, MMM D, YYYY")
            : t("modal.createTransaction.datePlaceholder", "Pick a date")}
        </Text>
        <Text className="date-field-chevron">{isExpanded ? "▲" : "▼"}</Text>
      </Pressable>

      {isExpanded && !disabled && (
        <View className="date-field-panel">
          <View className="date-field-quick-row">
            {quickPicks.map((pick) => {
              const isActive = Boolean(selected?.isSame(pick.day, "day"));

              return (
                <Pressable
                  key={pick.key}
                  className={clsx(
                    "category-chip",
                    isActive && "category-chip-active",
                  )}
                  onPress={() => select(pick.day)}
                >
                  <Text
                    className={clsx(
                      "category-chip-text",
                      isActive && "category-chip-text-active",
                    )}
                  >
                    {pick.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View className="calendar-nav-row">
            <Pressable
              className="calendar-nav-button"
              onPress={() =>
                setVisibleMonth((month) => month.subtract(1, "month"))
              }
              hitSlop={8}
            >
              <Text className="calendar-nav-text">{direction.backGlyph}</Text>
            </Pressable>

            <Text className="calendar-month-title">
              {visibleMonth.format("MMMM YYYY")}
            </Text>

            <Pressable
              className="calendar-nav-button"
              onPress={() => setVisibleMonth((month) => month.add(1, "month"))}
              hitSlop={8}
            >
              <Text className="calendar-nav-text">{direction.forwardGlyph}</Text>
            </Pressable>
          </View>

          <View className="calendar-weekday-row">
            {weekdayLabels.map((weekday) => (
              <View
                key={weekday}
                className="calendar-weekday-cell"
                style={{ width: CELL_WIDTH }}
              >
                <Text className="calendar-weekday-text">{weekday}</Text>
              </View>
            ))}
          </View>

          <View className="calendar-grid">
            {monthCells.map((day, index) => {
              if (!day) {
                return (
                  <View
                    key={`blank-${index}`}
                    className="calendar-cell"
                    style={{ width: CELL_WIDTH }}
                  />
                );
              }

              const isSelected = Boolean(selected?.isSame(day, "day"));
              const isToday = day.isSame(dayjs(), "day");
              const isBlocked = Boolean(limit && day.isAfter(limit, "day"));

              return (
                <View
                  key={day.format("YYYY-MM-DD")}
                  className="calendar-cell"
                  style={{ width: CELL_WIDTH }}
                >
                  <Pressable
                    className={clsx(
                      "calendar-day",
                      isSelected && "calendar-day-edge",
                      !isSelected && isToday && "calendar-day-today",
                      isBlocked && "opacity-30",
                    )}
                    onPress={() => select(day)}
                    disabled={isBlocked}
                  >
                    <Text
                      className={clsx(
                        "calendar-day-text",
                        isSelected && "calendar-day-text-edge",
                      )}
                    >
                      {day.format("D")}
                    </Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {error ? <Text className="auth-error">{error}</Text> : null}
    </View>
  );
};

export default DateField;
