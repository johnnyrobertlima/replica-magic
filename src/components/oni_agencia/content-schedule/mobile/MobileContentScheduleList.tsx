
import { useState, useMemo } from "react";
import { parseISO } from "date-fns";
import { CalendarEvent } from "@/types/oni-agencia";
import { useToast } from "@/hooks/use-toast";
import { MobileEventList } from "./MobileEventList";
import { MobileScheduleEventDialog } from "./MobileScheduleEventDialog";
import { useDateSelection } from "../hooks/useDateSelection";
import { EmptyState } from "../event-list/EmptyState";

interface MobileContentScheduleListProps {
  events: CalendarEvent[];
  clientId: string;
  selectedCollaborator?: string | null;
}

export function MobileContentScheduleList({ 
  events, 
  clientId,
  selectedCollaborator 
}: MobileContentScheduleListProps) {
  const { toast } = useToast();
  const [statusTabActive, setStatusTabActive] = useState<boolean>(true);
  
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

  // Filter events based on selectedCollaborator
  const filteredEvents = useMemo(() => {
    if (!selectedCollaborator) return events;
    
    return events.filter(event => {
      const isCollaborator = event.collaborator_id === selectedCollaborator;
      let isCreator = false;
      
      if (event.creators) {
        const creatorsArray = Array.isArray(event.creators) ? event.creators : 
                            (typeof event.creators === 'string' ? [event.creators] : []);
        isCreator = creatorsArray.includes(selectedCollaborator);
      }
      
      return isCollaborator || isCreator;
    });
  }, [events, selectedCollaborator]);
  
  // Group events by date
  const groupedEvents = useMemo(() => {
    return filteredEvents.reduce<Record<string, CalendarEvent[]>>((acc, event) => {
      const dateKey = event.scheduled_date;
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      
      acc[dateKey].push(event);
      return acc;
    }, {});
  }, [filteredEvents]);
  
  // Sort dates
  const sortedDates = useMemo(() => Object.keys(groupedEvents).sort(), [groupedEvents]);
  
  const handleEventItemClick = (event: CalendarEvent) => {
    const date = parseISO(event.scheduled_date);
    handleEventClick(event, date);
    setStatusTabActive(true); // Automatically activate the status tab when opening dialog
  };
  
  const handleDialogClose = () => {
    setSelectedDate(undefined);
    setSelectedEvent(undefined);
    setIsDialogOpen(false);
  };

  // Show empty state if no events
  if (sortedDates.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="bg-white rounded-md border shadow-sm w-full overflow-auto">
      <div className="p-3">
        <MobileEventList
          groupedEvents={groupedEvents}
          sortedDates={sortedDates}
          onEventClick={handleEventItemClick}
        />
      </div>
      
      {selectedDate && selectedEvent && (
        <MobileScheduleEventDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          clientId={clientId}
          selectedDate={selectedDate}
          events={[]}
          onClose={handleDialogClose}
          selectedEvent={selectedEvent}
          initialStatusTabActive={statusTabActive}
        />
      )}
    </div>
  );
}
