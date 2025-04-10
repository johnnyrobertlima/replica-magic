
import { format, isSameDay } from "date-fns";
import { CalendarEvent } from "@/types/oni-agencia";
import { EventItem } from "./EventItem";

interface CalendarDayCellProps {
  date: Date;
  events: CalendarEvent[];
  isSelected: boolean;
  onSelect: (date: Date) => void;
  onEventClick: (event: CalendarEvent, date: Date) => void;
}

export function CalendarDayCell({ 
  date, 
  events, 
  isSelected, 
  onSelect, 
  onEventClick 
}: CalendarDayCellProps) {
  const dateString = format(date, 'yyyy-MM-dd');
  const dayEvents = events.filter(event => event.scheduled_date === dateString);
  
  return (
    <div 
      className="h-32 w-full border-r border-b cursor-pointer hover:bg-gray-50" 
      onClick={() => onSelect(date)}
    >
      <button 
        className={`h-8 w-8 p-0 font-normal flex items-center justify-center rounded-full ${
          isSelected ? 'bg-primary text-primary-foreground' : ''
        }`}
      >
        {format(date, 'd')}
      </button>
      
      {dayEvents.length > 0 && (
        <div className="flex flex-col gap-1 mt-1 overflow-y-auto max-h-20">
          {dayEvents.map((event) => (
            <EventItem 
              key={event.id} 
              event={event}
              onClick={(e) => {
                e.stopPropagation();
                onEventClick(event, date);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
