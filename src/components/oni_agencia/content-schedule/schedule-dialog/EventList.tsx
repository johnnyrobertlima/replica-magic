
import { CalendarEvent } from "@/types/oni-agencia";

export interface EventListProps {
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
}

export const EventList: React.FC<EventListProps> = ({ events, onSelectEvent }) => {
  return (
    <div className="space-y-2">
      {events.map((event) => (
        <button
          key={event.id}
          onClick={() => onSelectEvent(event)}
          className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded border flex justify-between items-center"
        >
          <div>
            <div className="font-medium">{event.title || "Sem título"}</div>
            <div className="text-sm text-gray-500">
              {event.service?.name}
              {event.collaborator && ` • ${event.collaborator.name}`}
            </div>
          </div>
          {event.status && (
            <span 
              className="px-2 py-1 text-xs rounded" 
              style={{ 
                backgroundColor: event.status.color ? `${event.status.color}20` : '#f3f4f6', 
                color: event.status.color || 'inherit'
              }}
            >
              {event.status.name}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};
