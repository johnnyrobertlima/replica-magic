
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { CalendarEvent } from "@/types/oni-agencia";
import { format, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ScheduleEventDialog } from "./ScheduleEventDialog";
import { useAllContentSchedules } from "@/hooks/useOniAgenciaContentSchedules";
import { CalendarHeader } from "./calendar/CalendarHeader";
import { WeekDaysHeader } from "./calendar/WeekDaysHeader";
import { CalendarDayCell } from "./calendar/CalendarDayCell";
import { useCalendarEvents } from "./hooks/useCalendarEvents";

interface ContentCalendarProps {
  events: CalendarEvent[];
  clientId: string;
  month: number;
  year: number;
  onMonthChange: (month: number, year: number) => void;
}

export function ContentCalendar({ events, clientId, month, year, onMonthChange }: ContentCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  
  // Use this query to get ALL events regardless of month - this helps when switching months
  const { data: allEvents = [] } = useAllContentSchedules(clientId);
  
  const currentDate = new Date(year, month - 1, 1);
  
  // Use the custom hook to manage calendar events
  const { 
    currentEvents, 
    isDialogOpen, 
    setIsDialogOpen, 
    openDialog 
  } = useCalendarEvents(events, selectedDate);
  
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      openDialog();
    }
  };

  const handlePrevMonth = () => {
    if (month === 1) {
      onMonthChange(12, year - 1);
    } else {
      onMonthChange(month - 1, year);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      onMonthChange(1, year + 1);
    } else {
      onMonthChange(month + 1, year);
    }
  };

  const handleEventClick = (event: CalendarEvent, date: Date) => {
    setSelectedDate(date);
    setIsDialogOpen(true);
  };

  const weekDays = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

  return (
    <div className="bg-white rounded-md border shadow-sm w-full h-full">
      <CalendarHeader 
        currentDate={currentDate}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
      />
      
      <WeekDaysHeader weekDays={weekDays} />
      
      <div className="w-full p-0">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          month={currentDate}
          className="w-full rounded-md border-none"
          locale={ptBR}
          components={{
            Day: ({ date, ...dayProps }) => {
              // Check if this date is selected
              const isSelected = selectedDate && isSameDay(selectedDate, date);
              
              return (
                <CalendarDayCell 
                  date={date}
                  events={events}
                  isSelected={isSelected}
                  onSelect={() => handleDateSelect(date)}
                  onEventClick={(event) => handleEventClick(event, date)}
                />
              );
            },
            Caption: () => null, // Hide the default caption since we have a custom header
          }}
        />
      </div>
      
      {selectedDate && (
        <ScheduleEventDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          clientId={clientId}
          selectedDate={selectedDate}
          events={currentEvents}
          onClose={() => setSelectedDate(undefined)}
        />
      )}
    </div>
  );
}
