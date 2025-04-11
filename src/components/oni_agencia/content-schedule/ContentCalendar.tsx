
import { Calendar } from "@/components/ui/calendar";
import { CalendarEvent } from "@/types/oni-agencia";
import { format, isSameDay, isToday, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ScheduleEventDialog } from "./ScheduleEventDialog";
import { useAllContentSchedules } from "@/hooks/useOniAgenciaContentSchedules";
import { CalendarHeader } from "./calendar/CalendarHeader";
import { WeekDaysHeader } from "./calendar/WeekDaysHeader";
import { CalendarDayCell } from "./calendar/CalendarDayCell";
import { DndContext, useSensor, useSensors, PointerSensor } from "@dnd-kit/core";
import { useDragAndDrop } from "./hooks/useDragAndDrop";
import { useCurrentUser } from "./hooks/useCurrentUser";
import { useDateSelection } from "./hooks/useDateSelection";
import { useMonthNavigation } from "./hooks/useMonthNavigation";
import { useCalendarEvents } from "./hooks/useCalendarEvents";

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
  // Custom hooks
  const userName = useCurrentUser();
  const { 
    selectedDate, 
    selectedEvent, 
    isDialogOpen,
    setIsDialogOpen,
    handleDateSelect, 
    handleEventClick,
    setSelectedDate
  } = useDateSelection();
  const { handlePrevMonth, handleNextMonth } = useMonthNavigation(month, year, onMonthChange);
  const { isDragging, handleDragStart, handleDragEnd } = useDragAndDrop(events, userName);
  
  // Use this query to get ALL events regardless of month - this helps when switching months
  const { data: allEvents = [] } = useAllContentSchedules(clientId);
  
  const currentDate = new Date(year, month - 1, 1);
  
  // Use the custom hook to manage calendar events
  const { 
    currentEvents
  } = useCalendarEvents(events, selectedDate, isDialogOpen, setIsDialogOpen);
  
  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Min drag distance before activation
      },
    })
  );

  const weekDays = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

  console.log("ContentCalendar render state:", { 
    selectedDate, 
    isDialogOpen, 
    eventsCount: events.length,
    currentEventsCount: currentEvents.length
  });

  const handleCellSelect = (date: Date) => {
    console.log("Cell selected in ContentCalendar:", format(date, 'yyyy-MM-dd'));
    handleDateSelect(date);
  };

  const handleCellEventClick = (event: CalendarEvent, date: Date) => {
    console.log("Event clicked in ContentCalendar:", event.id, event.title);
    handleEventClick(event, date);
  };

  return (
    <DndContext 
      sensors={sensors} 
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
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
            onSelect={handleCellSelect}
            month={currentDate}
            className="w-full rounded-md border-none"
            locale={ptBR}
            components={{
              Day: ({ date, ...dayProps }) => {
                // Check if this date is selected
                const isSelected = selectedDate && isSameDay(selectedDate, date);
                // Check if this is the current day
                const isCurrentDay = isToday(date);
                
                return (
                  <CalendarDayCell 
                    date={date}
                    events={events}
                    isSelected={isSelected}
                    isCurrentDay={isCurrentDay}
                    onSelect={handleCellSelect}
                    onEventClick={handleCellEventClick}
                    selectedCollaborator={selectedCollaborator}
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
            onClose={() => {
              console.log("ScheduleEventDialog closed");
              setSelectedDate(undefined);
              setIsDialogOpen(false);
            }}
            selectedEvent={selectedEvent} // Pass the selected event to open directly
          />
        )}
      </div>
    </DndContext>
  );
}
