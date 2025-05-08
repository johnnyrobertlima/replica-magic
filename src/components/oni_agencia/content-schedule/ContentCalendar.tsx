
import { useMemo } from "react";
import { Calendar } from "./calendar/Calendar";
import { useDateSelection } from "./hooks/useDateSelection";
import { ScheduleEventDialog } from "./ScheduleEventDialog";
import { CalendarEvent } from "@/types/oni-agencia";
import { useDragAndDrop } from "./hooks/useDragAndDrop";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface ContentCalendarProps {
  events: CalendarEvent[];
  clientId: string;
  month: number;
  year: number;
  onMonthChange: (month: number, year: number) => void;
  selectedCollaborator?: string | null;
  onManualRefetch?: () => void;
}

export function ContentCalendar({ 
  events, 
  clientId,
  month,
  year,
  onMonthChange,
  selectedCollaborator,
  onManualRefetch
}: ContentCalendarProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const dndContext = useDragAndDrop();
  
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
  
  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setSelectedDate(undefined);
      setSelectedEvent(undefined);
    }
  };
  
  const handleDialogClose = () => {
    setSelectedDate(undefined);
    setSelectedEvent(undefined);
    setIsDialogOpen(false);
  };

  // Filter events based on selectedCollaborator
  const filteredEvents = useMemo(() => {
    if (!selectedCollaborator) return events;
    
    return events.filter(event => {
      // Check if the person is a collaborator
      const isCollaborator = event.collaborator_id === selectedCollaborator;
      
      // Check if the person is in the creators array
      let isCreator = false;
      
      if (event.creators) {
        const creatorsArray = Array.isArray(event.creators) ? event.creators : 
                            (typeof event.creators === 'string' ? [event.creators] : []);
        
        isCreator = creatorsArray.includes(selectedCollaborator);
      }
      
      return isCollaborator || isCreator;
    });
  }, [events, selectedCollaborator]);
  
  return (
    <div className="bg-white rounded-md border shadow-sm">
      <Calendar
        events={filteredEvents}
        month={month}
        year={year}
        clientId={clientId}
        selectedCollaborator={selectedCollaborator}
        onMonthChange={onMonthChange}
        onDateSelect={handleDateSelect}
        onEventClick={handleEventClick}
        selectedDate={selectedDate}
        selectedEvent={selectedEvent}
        isDialogOpen={isDialogOpen}
        onDialogOpenChange={handleDialogOpenChange}
        onDialogClose={handleDialogClose}
        onManualRefetch={onManualRefetch}
      />
      
      {selectedDate && (
        <ScheduleEventDialog
          isOpen={isDialogOpen}
          onOpenChange={handleDialogOpenChange}
          clientId={clientId}
          selectedDate={selectedDate}
          events={[]}
          onClose={handleDialogClose}
          selectedEvent={selectedEvent}
          onManualRefetch={onManualRefetch}
        />
      )}
    </div>
  );
}
