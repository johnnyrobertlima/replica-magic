
import { CalendarEvent } from "@/types/oni-agencia";
import { StatusBadge } from "./status-badge/StatusBadge";

interface EventItemProps {
  event: CalendarEvent;
  onClick: (e: React.MouseEvent) => void;
  isDragging?: boolean;
}

export function EventItem({ event, onClick, isDragging }: EventItemProps) {
  // Determine color based on service color or default to blue
  const serviceColor = event.service?.color || '#3490dc';
  
  return (
    <div 
      className={`
        py-1 px-2 mb-1 rounded-sm text-xs text-white truncate 
        cursor-pointer hover:opacity-90 transition-opacity
        ${isDragging ? 'shadow-lg border border-white' : ''}
      `}
      style={{ backgroundColor: serviceColor }}
      onClick={onClick}
      title={event.title || 'Sem título'}
      data-event-id={event.id}
    >
      <div className="flex items-center space-x-1">
        {event.status && <StatusBadge status={event.status} size="xs" />}
        <span className="truncate">
          {event.title || "Sem título"}
        </span>
      </div>
    </div>
  );
}
