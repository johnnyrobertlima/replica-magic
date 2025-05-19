
import React from 'react';
import { CalendarEvent } from "@/types/oni-agencia";
import { MobileScheduleEventDialog } from "../MobileScheduleEventDialog";

interface EventDialogHandlerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  selectedDate?: Date;
  filteredEvents: CalendarEvent[];
  selectedEvent?: CalendarEvent;
  onClose: () => void;
}

export function EventDialogHandler({ 
  isOpen, 
  onOpenChange, 
  clientId, 
  selectedDate, 
  filteredEvents = [], 
  selectedEvent, 
  onClose 
}: EventDialogHandlerProps) {
  if (!selectedDate) return null;
  
  // Safely filter events, ensuring we handle nullish values
  const dateEvents = Array.isArray(filteredEvents) 
    ? filteredEvents.filter(e => 
        e?.scheduled_date === selectedDate.toISOString().split('T')[0]
      )
    : [];
  
  return (
    <MobileScheduleEventDialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      clientId={clientId}
      selectedDate={selectedDate}
      events={dateEvents}
      onClose={onClose}
      selectedEvent={selectedEvent}
      initialStatusTabActive={true} // This will open the status tab by default
    />
  );
}
