
import { isSameDay, isToday } from "date-fns";
import { CalendarEvent } from "@/types/oni-agencia";
import { useMemo } from "react";
import { CalendarDayCell } from "./CalendarDayCell";

interface CalendarDayProps {
  date: Date;
  selectedDate: Date | undefined;
  events: CalendarEvent[];
  selectedCollaborator?: string | null;
  onSelect: (date: Date) => void;
  onEventClick: (event: CalendarEvent, date: Date) => void;
}

export function CalendarDay({
  date,
  selectedDate,
  events,
  selectedCollaborator,
  onSelect,
  onEventClick
}: CalendarDayProps) {
  // Memoize whether this date is selected and is current day
  const { isSelected, isCurrentDay } = useMemo(() => ({
    isSelected: selectedDate && isSameDay(selectedDate, date),
    isCurrentDay: isToday(date)
  }), [selectedDate, date]);

  return (
    <CalendarDayCell
      date={date}
      events={events}
      isSelected={isSelected}
      isCurrentDay={isCurrentDay}
      onSelect={onSelect}
      onEventClick={onEventClick}
      selectedCollaborator={selectedCollaborator}
    />
  );
}

