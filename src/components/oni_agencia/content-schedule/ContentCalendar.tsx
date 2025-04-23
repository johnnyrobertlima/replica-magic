
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
import { usePautaStatus } from "./hooks/usePautaStatus";
import { PautaStatusIndicator } from "./PautaStatusIndicator";
import { useEffect, useMemo } from "react";

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
    setSelectedDate,
    setSelectedEvent
  } = useDateSelection();
  const { handlePrevMonth, handleNextMonth } = useMonthNavigation(month, year, onMonthChange);
  const { isDragging, handleDragStart, handleDragEnd } = useDragAndDrop(events, userName);
  
  // Use this query to get ALL events regardless of month - this helps when switching months
  const { data: allEvents = [] } = useAllContentSchedules(clientId);
  
  const currentDate = new Date(year, month - 1, 1);
  
  // Use the custom hook to manage calendar events - now passing selectedCollaborator
  const { 
    currentEvents
  } = useCalendarEvents(events, selectedDate, isDialogOpen, setIsDialogOpen, selectedCollaborator);
  
  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Min drag distance before activation
      },
    })
  );

  // Reset selection when events change
  useEffect(() => {
    if (!isDialogOpen && selectedEvent) {
      // Find if the selected event still exists or has been updated
      const updatedEvent = events.find(e => e.id === selectedEvent.id);
      if (updatedEvent) {
        setSelectedEvent(updatedEvent);
      }
    }
  }, [events, isDialogOpen, selectedEvent, setSelectedEvent]);

  const weekDays = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

  // Memoize filtered events to improve performance
  const filteredEvents = useMemo(() => {
    if (!selectedCollaborator) return events;
    
    return events.filter(event => {
      // Check if the person is a collaborator
      const isCollaborator = event.collaborator_id === selectedCollaborator;
      
      // Process creators to ensure we're working with a proper array
      let creators: string[] = [];
      
      if (event.creators) {
        if (Array.isArray(event.creators)) {
          creators = event.creators;
        } else if (typeof event.creators === 'string') {
          try {
            const parsedCreators = JSON.parse(event.creators);
            creators = Array.isArray(parsedCreators) ? parsedCreators : [parsedCreators];
          } catch (e) {
            creators = [event.creators];
          }
        } else {
          creators = [];
        }
      }
      
      // Check if the person is in the creators array
      const isCreator = creators.includes(selectedCollaborator);
      
      // Add debug logging for one specific event to help with troubleshooting
      if (event.title === "teste" || event.title === " ") {
        console.log("ContentCalendar filtering event:", {
          title: event.title,
          collaborator_id: event.collaborator_id,
          creators: creators,
          selectedCollaborator,
          isCollaborator,
          isCreator,
          shouldShow: isCollaborator || isCreator
        });
      }
      
      // Return true if the person is either a collaborator or a creator
      return isCollaborator || isCreator;
    });
  }, [events, selectedCollaborator]);

  const handleCellSelect = (date: Date) => {
    // When a cell is clicked (not an event), we want to create a new event
    handleDateSelect(date);
    
    // Explicitly make sure we don't have any selected event
    setSelectedEvent(undefined);
  };

  const handleCellEventClick = (event: CalendarEvent, date: Date) => {
    // When an event is clicked, we want to edit that specific event
    handleEventClick(event, date);
  };

  const handleDialogClose = () => {
    setSelectedDate(undefined);
    setSelectedEvent(undefined);
    setIsDialogOpen(false);
  };

  return (
    <DndContext 
      sensors={sensors} 
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="bg-white rounded-md border shadow-sm w-full h-full">
        <div className="px-4 pt-4">
          <PautaStatusIndicator 
            events={filteredEvents} 
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
                    events={filteredEvents}
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
            onClose={handleDialogClose}
            selectedEvent={selectedEvent} // Pass the selected event to open directly
          />
        )}
      </div>
    </DndContext>
  );
}
