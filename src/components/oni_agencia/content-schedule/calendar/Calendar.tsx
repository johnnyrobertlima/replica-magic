
import { useState, useEffect } from "react";
import { addMonths, format, getDate, getDaysInMonth, getDay, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDay } from "./CalendarDay";
import { CalendarDayHeader } from "./CalendarDayHeader";
import { CalendarNavigation } from "./CalendarNavigation";
import { CalendarHeader } from "./CalendarHeader";
import { WeekDaysHeader } from "./WeekDaysHeader";
import { CalendarEvent } from "@/types/oni-agencia";
import { ScheduleEventDialog } from "../ScheduleEventDialog";

interface CalendarProps {
  events: CalendarEvent[];
  month: number;
  year: number;
  clientId: string;
  selectedCollaborator?: string | null;
  onMonthYearChange: (month: number, year: number) => void;
  onDateSelect: (date: Date) => void;
  onEventClick: (event: CalendarEvent, date: Date) => void;
  selectedDate?: Date;
  selectedEvent?: CalendarEvent;
  isDialogOpen: boolean;
  onDialogOpenChange: (open: boolean) => void;
  onDialogClose: () => void;
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
  selectedCollaborator,
  onMonthYearChange,
  onDateSelect,
  onEventClick,
  selectedDate,
  selectedEvent,
  isDialogOpen,
  onDialogOpenChange,
  onDialogClose,
  onManualRefetch,
  useCaptureDate = false,
  prioritizeCaptureDate = false,
  defaultTab = "details"
}: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date(year, month - 1, 1));
  
  // Update currentDate when month or year props change
  useEffect(() => {
    setCurrentDate(new Date(year, month - 1, 1));
  }, [month, year]);
  
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayOfMonth = getDay(new Date(year, month - 1, 1));
  
  const handlePrevMonth = () => {
    const prevMonth = subMonths(currentDate, 1);
    const newMonth = prevMonth.getMonth() + 1;
    const newYear = prevMonth.getFullYear();
    onMonthYearChange(newMonth, newYear);
  };

  const handleNextMonth = () => {
    const nextMonth = addMonths(currentDate, 1);
    const newMonth = nextMonth.getMonth() + 1;
    const newYear = nextMonth.getFullYear();
    onMonthYearChange(newMonth, newYear);
  };

  // Added debugging log to track events data
  useEffect(() => {
    console.log(`Calendar component received ${events?.length || 0} total events for ${year}-${month}`);
    
    // Group events by date for debugging
    const eventsByDate = events.reduce((acc, event) => {
      const date = useCaptureDate && event.capture_date ? 
        event.capture_date.split('T')[0] : event.scheduled_date;
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log("Events by date:", eventsByDate);
  }, [events, month, year, useCaptureDate]);

  const renderCalendarDays = () => {
    const days = [];
    const totalDays = 42; // 6 rows x 7 days
    
    // Create days from previous month to fill the first week
    const prevMonthDays = firstDayOfMonth;
    const prevMonth = subMonths(new Date(year, month - 1, 1), 1);
    const daysInPrevMonth = getDaysInMonth(prevMonth);
    
    for (let i = 0; i < prevMonthDays; i++) {
      const day = daysInPrevMonth - (prevMonthDays - 1) + i;
      const prevMonthDate = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), day);
      days.push(
        <CalendarDay 
          key={`prev-${i}`}
          date={prevMonthDate}
          events={[]} // Previous month days don't show events
          selectedDate={selectedDate}
          onSelect={onDateSelect}
          onEventClick={onEventClick}
          selectedCollaborator={selectedCollaborator}
          useCaptureDate={useCaptureDate}
        />
      );
    }
    
    // Create days for current month
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDayDate = new Date(year, month - 1, i);
      days.push(
        <CalendarDay 
          key={`current-${i}`}
          date={currentDayDate}
          events={events} // Pass all events, each day will filter its own
          selectedDate={selectedDate}
          onSelect={onDateSelect}
          onEventClick={onEventClick}
          selectedCollaborator={selectedCollaborator}
          useCaptureDate={useCaptureDate}
        />
      );
    }
    
    // Add days from next month to fill the remaining cells
    const remainingDays = totalDays - (prevMonthDays + daysInMonth);
    for (let i = 1; i <= remainingDays; i++) {
      const nextMonthDate = new Date(year, month, i);
      days.push(
        <CalendarDay 
          key={`next-${i}`}
          date={nextMonthDate}
          events={[]} // Next month days don't show events
          selectedDate={selectedDate}
          onSelect={onDateSelect}
          onEventClick={onEventClick}
          selectedCollaborator={selectedCollaborator}
          useCaptureDate={useCaptureDate}
        />
      );
    }
    
    return days;
  };

  // Dias da semana em português
  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  return (
    <div className="bg-white rounded-md border shadow-sm w-full">
      <CalendarHeader 
        currentDate={currentDate}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
      />
      <CalendarNavigation 
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
      />
      
      <WeekDaysHeader weekDays={weekDays} />
      
      <div className="grid grid-cols-7 gap-px">
        {renderCalendarDays()}
      </div>
      
      {selectedDate && (
        <ScheduleEventDialog
          isOpen={isDialogOpen}
          onOpenChange={onDialogOpenChange}
          clientId={clientId}
          selectedDate={selectedDate}
          events={events.filter(e => {
            const dateStr = format(selectedDate, 'yyyy-MM-dd');
            return useCaptureDate && e.capture_date ? 
              e.capture_date.split('T')[0] === dateStr : 
              e.scheduled_date === dateStr;
          })}
          onClose={onDialogClose}
          selectedEvent={selectedEvent}
          onManualRefetch={onManualRefetch}
          defaultTab={defaultTab}
          prioritizeCaptureDate={prioritizeCaptureDate}
        />
      )}
    </div>
  );
}
