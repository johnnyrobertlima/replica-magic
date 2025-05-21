
import { useState, useCallback } from "react";
import { ContentCalendar } from "@/components/oni_agencia/content-schedule/ContentCalendar";
import { CalendarEvent } from "@/types/oni-agencia";
import { format, isToday } from "date-fns";
import { useDraggable } from "@dnd-kit/core";
import { CalendarDayCell } from "./CalendarDayCell";

interface CalendarProps {
  events: CalendarEvent[];
  month: number;
  year: number;
  clientId: string;
  selectedDate?: Date;
  selectedEvent?: CalendarEvent;
  selectedCollaborator?: string | null;
  isDialogOpen?: boolean;
  onMonthYearChange: (month: number, year: number) => void;
  onDateSelect: (date: Date) => void;
  onEventClick: (event: CalendarEvent, date: Date) => void;
  onDialogOpenChange?: (open: boolean) => void;
  onDialogClose?: () => void;
  onManualRefetch?: () => void;
  useCaptureDate?: boolean;
  prioritizeCaptureDate?: boolean;
  defaultTab?: "details" | "status" | "history" | "capture";
}

export function Calendar({
  events,
  month,
  year,
  clientId,
  selectedDate,
  selectedEvent,
  selectedCollaborator,
  isDialogOpen = false,
  onMonthYearChange,
  onDateSelect,
  onEventClick,
  onDialogOpenChange,
  onDialogClose,
  onManualRefetch,
  useCaptureDate = false,
  prioritizeCaptureDate = false,
  defaultTab = "details"
}: CalendarProps) {
  const [view, setView] = useState<"month" | "list">("month");

  // Organize events by date
  const eventsByDate = events.reduce<Record<string, CalendarEvent[]>>((acc, event) => {
    // Determine which date to use as the key
    const dateKey = prioritizeCaptureDate && event.capture_date
      ? event.capture_date.split('T')[0]  // Exclude time part
      : event.scheduled_date || '';
    
    // Skip events without a date
    if (!dateKey) return acc;
    
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    
    acc[dateKey].push(event);
    return acc;
  }, {});
  
  console.log("Calendar component received", events.length, "total events for", year + "-" + month);
  console.log("Events by date:", eventsByDate);

  // Use ContentCalendar component for month view
  if (view === "month") {
    return (
      <ContentCalendar
        events={events}
        month={month}
        year={year}
        clientId={clientId}
        onMonthYearChange={onMonthYearChange}
        onManualRefetch={onManualRefetch}
        useCaptureDate={useCaptureDate}
        selectedCollaborator={selectedCollaborator}
        defaultTab={defaultTab}
        prioritizeCaptureDate={prioritizeCaptureDate}
        onDateSelect={onDateSelect}
        onEventClick={onEventClick}
        selectedDate={selectedDate}
        selectedEvent={selectedEvent}
        isDialogOpen={isDialogOpen}
        onDialogOpenChange={onDialogOpenChange}
        onDialogClose={onDialogClose}
      />
    );
  }

  // For completeness, we would implement list view here
  // but since it's not relevant to your current issue, we'll skip it
  return null;
}
