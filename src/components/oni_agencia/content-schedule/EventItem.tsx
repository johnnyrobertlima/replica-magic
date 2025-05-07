
import { CalendarEvent } from "@/types/oni-agencia";
import { StatusBadge } from "./status-badge/StatusBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface EventItemProps {
  event: CalendarEvent;
  onClick: (e: React.MouseEvent) => void;
  isDragging?: boolean;
}

export function EventItem({ event, onClick, isDragging }: EventItemProps) {
  // Determine color based on service color or default to blue
  const serviceColor = event.service?.color || '#3490dc';
  
  // Get collaborator initials for avatar fallback
  const getInitials = (name: string | null | undefined) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };
  
  const collaboratorInitials = getInitials(event.collaborator?.name);
  
  return (
    <div 
      className={`
        py-1 px-2 mb-1 rounded-sm text-xs text-white 
        cursor-pointer hover:opacity-90 transition-opacity
        ${isDragging ? 'shadow-lg border border-white' : ''}
      `}
      style={{ backgroundColor: serviceColor }}
      onClick={onClick}
      title={event.title || 'Sem título'}
      data-event-id={event.id}
    >
      <div className="flex items-center gap-1">
        {event.status && <StatusBadge status={event.status} size="xs" className="scale-90" />}
        
        {event.collaborator && (
          <Avatar className="h-4 w-4 mr-1">
            <AvatarImage 
              src={event.collaborator.photo_url || ''} 
              alt={event.collaborator.name || 'Colaborador'} 
            />
            <AvatarFallback className="text-[8px]">{collaboratorInitials}</AvatarFallback>
          </Avatar>
        )}
        
        <span className="truncate flex-1">
          {event.title || "Sem título"}
        </span>
      </div>
    </div>
  );
}
