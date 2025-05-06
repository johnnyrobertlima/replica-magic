
import { useState, useEffect } from "react";
import { addMonths, format, getDate, getDaysInMonth, getDay, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDay } from "./CalendarDay";
import { CalendarDayHeader } from "./CalendarDayHeader";
import { CalendarNavigation } from "./CalendarNavigation";
import { CalendarHeader } from "./CalendarHeader";
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
  onManualRefetch
}: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date(year, month - 1, 1));
  
  useEffect(() => {
    setCurrentDate(new Date(year, month - 1, 1));
  }, [month, year]);
  
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getDay(new Date(year, month - 1, 1));
  const monthName = format(currentDate, 'MMMM', { locale: ptBR });
  const yearNumber = format(currentDate, 'yyyy');
  
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

  const renderCalendarDays = () => {
    const days = [];
    const daysToRender = 42; // 6 rows x 7 days
    
    // Create days from previous month to fill the first week
    for (let i = 0; i < firstDay; i++) {
      const prevMonthDate = new Date(year, month - 2, getDaysInMonth(new Date(year, month - 2, 1)) - (firstDay - i) + 1);
      days.push(
        <CalendarDay 
          key={`prev-${i}`}
          date={prevMonthDate}
          events={[]}
          selectedDate={selectedDate}
          onSelect={onDateSelect}
          onEventClick={onEventClick}
          selectedCollaborator={selectedCollaborator}
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
          events={events}
          selectedDate={selectedDate}
          onSelect={onDateSelect}
          onEventClick={onEventClick}
          selectedCollaborator={selectedCollaborator}
        />
      );
    }
    
    // Add days from next month to fill the remaining cells
    const remainingDays = daysToRender - (firstDay + daysInMonth);
    for (let i = 1; i <= remainingDays; i++) {
      const nextMonthDate = new Date(year, month, i);
      days.push(
        <CalendarDay 
          key={`next-${i}`}
          date={nextMonthDate}
          events={[]}
          selectedDate={selectedDate}
          onSelect={onDateSelect}
          onEventClick={onEventClick}
          selectedCollaborator={selectedCollaborator}
        />
      );
    }
    
    return days;
  };

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
      <div className="calendar-grid">
        <CalendarDayHeader />
        {renderCalendarDays()}
      </div>
      
      {selectedDate && (
        <ScheduleEventDialog
          isOpen={isDialogOpen}
          onOpenChange={onDialogOpenChange}
          clientId={clientId}
          selectedDate={selectedDate}
          events={events.filter(e => e.scheduled_date === format(selectedDate, 'yyyy-MM-dd'))}
          onClose={onDialogClose}
          selectedEvent={selectedEvent}
          onManualRefetch={onManualRefetch}
        />
      )}
    </div>
  );
}
