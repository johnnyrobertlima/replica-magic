
import { CalendarEvent } from "@/types/oni-agencia";
import { CalendarHeader } from "./calendar/CalendarHeader";
import { WeekDaysHeader } from "./calendar/WeekDaysHeader";
import { CalendarContainer } from "./calendar/CalendarContainer";
import { useCalendarEvents } from "./hooks/useCalendarEvents";
import { usePautaStatus } from "./hooks/usePautaStatus";
import { PautaStatusIndicator } from "./PautaStatusIndicator";
import { ScheduleEventDialog } from "./ScheduleEventDialog";
import { useDateSelection } from "./hooks/useDateSelection";
import { useMonthNavigation } from "./hooks/useMonthNavigation";

interface ContentCalendarProps {
  events: CalendarEvent[];
  clientId: string;
  month: number;
  year: number;
  onMonthChange: (month: number, year: number) => void;
  selectedCollaborator?: string | null;
}

export function ContentCalendar({ 
  events, 
  clientId, 
  month, 
  year, 
  onMonthChange,
  selectedCollaborator
}: ContentCalendarProps) {
  const { 
    selectedDate, 
    selectedEvent, 
    isDialogOpen,
    setIsDialogOpen,
    handleDateSelect, 
    handleEventClick,
    setSelectedDate,
    setSelectedEvent
  } = useDateSelection();
  
  const { handlePrevMonth, handleNextMonth } = useMonthNavigation(month, year, onMonthChange);
  
  const currentDate = new Date(year, month - 1, 1);
  
  const { currentEvents } = useCalendarEvents(events, selectedDate, isDialogOpen, setIsDialogOpen, selectedCollaborator);

  const weekDays = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

  const handleDialogClose = () => {
    setSelectedDate(undefined);
    setSelectedEvent(undefined);
    setIsDialogOpen(false);
  };

  return (
    <div className="bg-white rounded-md border shadow-sm w-full h-full">
      <div className="px-4 pt-4">
        <PautaStatusIndicator 
          events={events} 
          clientId={clientId} 
          month={month} 
          year={year} 
        />
      </div>
      
      <CalendarHeader 
        currentDate={currentDate}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
      />
      
      <WeekDaysHeader weekDays={weekDays} />
      
      <CalendarContainer
        events={events}
        selectedDate={selectedDate}
        currentDate={currentDate}
        selectedCollaborator={selectedCollaborator}
        onSelect={handleDateSelect}
        onEventClick={handleEventClick}
      />
      
      {selectedDate && (
        <ScheduleEventDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          clientId={clientId}
          selectedDate={selectedDate}
          events={currentEvents}
          onClose={handleDialogClose}
          selectedEvent={selectedEvent}
        />
      )}
    </div>
  );
}
