
import { useMemo } from "react";
import { CalendarHeader } from "./CalendarHeader";
import { CalendarContainer } from "./CalendarContainer";
import { ScheduleEventDialog } from "@/components/oni_agencia/content-schedule/ScheduleEventDialog";
import { CalendarEvent } from "@/types/oni-agencia";
import { useMonthNavigation } from "@/components/oni_agencia/content-schedule/hooks/useMonthNavigation";

interface CalendarProps {
  events: CalendarEvent[];
  month: number;
  year: number;
  clientId: string;
  selectedCollaborator?: string | null;
  selectedDate?: Date;
  selectedEvent?: CalendarEvent;
  isDialogOpen: boolean;
  onMonthYearChange: (month: number, year: number) => void;
  onDateSelect: (date: Date) => void;
  onEventClick: (event: CalendarEvent, date: Date) => void;
  onDialogOpenChange: (open: boolean) => void;
  onDialogClose: () => void;
  onManualRefetch?: () => void;
  forceImmediateRefresh?: () => Promise<any>;
}

export function Calendar({ 
  events,
  month,
  year,
  clientId,
  selectedCollaborator,
  selectedDate,
  selectedEvent,
  isDialogOpen,
  onMonthYearChange,
  onDateSelect,
  onEventClick,
  onDialogOpenChange,
  onDialogClose,
  onManualRefetch,
  forceImmediateRefresh
}: CalendarProps) {
  // Use the hook for month navigation
  const { 
    currentMonth,
    currentYear,
    currentDate,
    navigateToNext,
    navigateToPrevious
  } = useMonthNavigation(month, year, onMonthYearChange);
  
  // Filter events for the selected date
  const dateEvents = useMemo(() => {
    if (!selectedDate) return [];
    const dateString = selectedDate.toISOString().split('T')[0];
    return events.filter(event => event.scheduled_date === dateString);
  }, [events, selectedDate]);
  
  // Handle drag-and-drop success - immediately refresh
  const handleDragSuccess = async (success: boolean, eventId?: string) => {
    if (success && forceImmediateRefresh) {
      console.log(`Calendar: Evento arrastado com sucesso (${eventId}), atualizando...`);
      await forceImmediateRefresh();
    }
  };

  return (
    <div className="bg-white rounded-md border shadow-sm">
      <CalendarHeader 
        month={currentMonth}
        year={currentYear}
        onNext={navigateToNext}
        onPrevious={navigateToPrevious}
      />
      
      <div className="p-0 md:p-2 overflow-auto">
        <CalendarContainer 
          events={events}
          selectedDate={selectedDate}
          currentDate={currentDate}
          selectedCollaborator={selectedCollaborator}
          onSelect={onDateSelect}
          onEventClick={onEventClick}
          onDragSuccess={handleDragSuccess}
        />
      </div>
      
      {selectedDate && (
        <ScheduleEventDialog
          isOpen={isDialogOpen}
          onOpenChange={onDialogOpenChange}
          clientId={clientId}
          selectedDate={selectedDate}
          events={dateEvents}
          onClose={onDialogClose}
          selectedEvent={selectedEvent}
          onManualRefetch={onManualRefetch}
        />
      )}
    </div>
  );
}
