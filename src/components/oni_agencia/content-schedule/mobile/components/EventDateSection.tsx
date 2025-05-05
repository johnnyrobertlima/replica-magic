
import React from 'react';
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarEvent } from "@/types/oni-agencia";
import { EventCard } from './EventCard';

interface EventDateSectionProps {
  dateString: string;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}

export function EventDateSection({ 
  dateString, 
  events, 
  onEventClick 
}: EventDateSectionProps) {
  const formatDateHeader = (dateString: string) => {
    const date = parseISO(dateString);
    return format(date, "EEEE, d 'de' MMMM", { locale: ptBR });
  };

  return (
    <div key={dateString} className="mb-4">
      <h3 className="text-base font-semibold text-primary mb-2 capitalize">
        {formatDateHeader(dateString)}
      </h3>
      
      <div className="space-y-2">
        {events.map((event) => (
          <EventCard 
            key={event.id} 
            event={event} 
            onClick={() => onEventClick(event)} 
          />
        ))}
      </div>
    </div>
  );
}
