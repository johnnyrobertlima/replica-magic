
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
  
  // Handle click on the empty space of the cell
  const handleCellClick = (e: React.MouseEvent) => {
    // Only trigger if clicking directly on the cell, not on an event
    if ((e.target as HTMLElement).closest('.event-item') === null) {
      onSelect(date);
    }
  };
  
  return (
    <div 
      className="h-32 w-full border-r border-b cursor-pointer hover:bg-gray-50 calendar-day-cell p-1" 
      onClick={handleCellClick}
    >
      <div className="flex justify-between items-center mb-1">
        <button 
          className={`h-6 w-6 p-0 font-normal flex items-center justify-center rounded-full ${
            isSelected ? 'bg-primary text-primary-foreground' : ''
          }`}
        >
          {format(date, 'd')}
        </button>
      </div>
      
      {dayEvents.length > 0 ? (
        <div className="flex flex-col gap-1 overflow-y-auto max-h-24">
          {dayEvents.map((event) => (
            <div key={event.id} className="event-item">
              <EventItem 
                event={event}
                onClick={(e) => {
                  e.stopPropagation();
                  onEventClick(event, date);
                }}
              />
            </div>
          ))}
        </div>
      ) : (
        // Empty state to make sure the entire cell is clickable for creating new events
        <div className="h-[calc(100%-24px)] w-full" />
      )}
    </div>
  );
}
