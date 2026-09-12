import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import clsx from "clsx";
import dayjs, { type Dayjs } from "dayjs";
import { useTranslation } from "react-i18next";
import {
  buildMonthGrid,
  CALENDAR_CELL_WIDTH as CELL_WIDTH,
} from "@/core/utils/calendar";
import DialogShell from "@/core/components/Dialog/DialogShell";
import SubmitButton from "@/core/components/Form/SubmitButton";
import { useDirection } from "@/core/components/Localization/LocalizationProvider";

/** Inclusive day range, both bounds stored as ISO strings. */
export type DateRange = {
  startDate: string;
  endDate: string;
};

export type DateRangePickerProps = {
  visible: boolean;
  initialRange?: DateRange | null;
  onClose: () => void;
  onApply: (range: DateRange) => void;
  onClear?: () => void;
};

const DateRangePicker = ({
  visible,
  initialRange,
  onClose,
  onApply,
  onClear,
}: DateRangePickerProps) => {
  const { t } = useTranslation();
  const direction = useDirection();
  const weekdayLabels = t("insights.weekdays", {
    returnObjects: true,
  }) as string[];

  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [visibleMonth, setVisibleMonth] = useState<Dayjs>(dayjs());

  // Opening always restores the applied range, so abandoning an in-progress
  // selection never leaks into the next open.
  useEffect(() => {
    if (!visible) return;

    const start = initialRange ? dayjs(initialRange.startDate) : null;
    const end = initialRange ? dayjs(initialRange.endDate) : null;

    setStartDate(start?.isValid() ? start : null);
    setEndDate(end?.isValid() ? end : null);
    setVisibleMonth(start?.isValid() ? start.startOf("month") : dayjs());
  }, [visible, initialRange]);

  const monthCells = useMemo(() => buildMonthGrid(visibleMonth), [visibleMonth]);

  const handleDayPress = (day: Dayjs) => {
    // No start yet, or a complete range: begin a fresh selection.
    if (!startDate || (startDate && endDate)) {
      setStartDate(day);
      setEndDate(null);
      return;
    }

    if (day.isBefore(startDate, "day")) {
      setStartDate(day);
      return;
    }

    setEndDate(day);
  };

  const handleApply = () => {
    if (!startDate || !endDate) return;

    onApply({
      startDate: startDate.startOf("day").toISOString(),
      endDate: endDate.endOf("day").toISOString(),
    });
    onClose();
  };

  const handleClear = () => {
    setStartDate(null);
    setEndDate(null);
    onClear?.();
    onClose();
  };

  return (
    <DialogShell
      visible={visible}
      title={t("modal.dateRange.title", "Select Date Range")}
      onClose={onClose}
    >
      <Text className="auth-helper">
        {t("modal.dateRange.hint", "Tap a start date, then an end date.")}
      </Text>

      <View className="calendar-nav-row">
        <Pressable
          className="calendar-nav-button"
          onPress={() => setVisibleMonth((month) => month.subtract(1, "month"))}
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

      <View>
        <View className="calendar-weekday-row">
          {weekdayLabels.map((label) => (
            <View
              key={label}
              className="calendar-weekday-cell"
              style={{ width: CELL_WIDTH }}
            >
              <Text className="calendar-weekday-text">{label}</Text>
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

            const isStart = Boolean(startDate?.isSame(day, "day"));
            const isEnd = Boolean(endDate?.isSame(day, "day"));
            const isEdge = isStart || isEnd;
            const isInRange = Boolean(
              startDate &&
                endDate &&
                day.isAfter(startDate, "day") &&
                day.isBefore(endDate, "day"),
            );
            const isToday = day.isSame(dayjs(), "day");

            return (
              <View
                key={day.format("YYYY-MM-DD")}
                className="calendar-cell"
                style={{ width: CELL_WIDTH }}
              >
                <Pressable
                  className={clsx(
                    "calendar-day",
                    isInRange && "calendar-day-in-range",
                    isEdge && "calendar-day-edge",
                    !isEdge && isToday && "calendar-day-today",
                  )}
                  onPress={() => handleDayPress(day)}
                >
                  <Text
                    className={clsx(
                      "calendar-day-text",
                      isEdge && "calendar-day-text-edge",
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

      <View className="calendar-summary">
        <Text className="calendar-summary-label">
          {t("modal.dateRange.selected", "Selected range")}
        </Text>
        <Text className="calendar-summary-value">
          {startDate ? startDate.format("MMM D, YYYY") : "—"}
          {direction.isRTL ? "  ←  " : "  →  "}
          {endDate ? endDate.format("MMM D, YYYY") : "—"}
        </Text>
      </View>

      <SubmitButton
        label={t("modal.dateRange.apply", "Show Results")}
        disabled={!startDate || !endDate}
        onPress={handleApply}
      />

      {onClear && (
        <SubmitButton
          label={t("modal.dateRange.clear", "Clear Range")}
          variant="secondary"
          onPress={handleClear}
        />
      )}
    </DialogShell>
  );
};

export default DateRangePicker;
