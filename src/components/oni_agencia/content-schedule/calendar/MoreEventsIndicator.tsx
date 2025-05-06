
import { format } from "date-fns";
import { ChevronDown } from "lucide-react";
import { CalendarEvent } from "@/types/oni-agencia";
import { EventItem } from "../EventItem";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface MoreEventsIndicatorProps {
  count: number;
  date: Date;
  events: CalendarEvent[];
  onEventClick: (e: React.MouseEvent, event: CalendarEvent) => void;
}

export function MoreEventsIndicator({ 
  count, 
  date, 
  events,
  onEventClick 
}: MoreEventsIndicatorProps) {
  if (count <= 0) return null;
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="text-xs text-primary font-medium px-1 py-0.5 hover:bg-gray-100 rounded flex items-center justify-between events-overflow-indicator"
          type="button"
        >
          <span>+ {count} mais agendamento{count > 1 ? 's' : ''}</span>
          <ChevronDown className="h-3 w-3" />
        </button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[240px] p-2 max-h-[300px] overflow-y-auto" 
        sideOffset={5}
      >
        <div className="flex justify-between items-center mb-2 pb-1 border-b">
          <h4 className="text-sm font-medium">Agendamentos de {format(date, 'dd/MM')}</h4>
        </div>
        <div className="flex flex-col gap-1">
          {events.map((event) => (
            <div key={event.id} className="event-item-wrapper">
              <EventItem 
                event={event}
                onClick={(e) => onEventClick(e, event)}
              />
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
