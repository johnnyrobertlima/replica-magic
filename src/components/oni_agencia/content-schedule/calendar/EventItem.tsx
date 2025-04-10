
import { CalendarEvent } from "@/types/oni-agencia";

interface EventItemProps {
  event: CalendarEvent;
  onClick: (e: React.MouseEvent) => void;
}

export function EventItem({ event, onClick }: EventItemProps) {
  // Limitar o título a um número razoável de caracteres
  const truncatedTitle = event.title.length > 18 
    ? `${event.title.substring(0, 18)}...` 
    : event.title;

  // Exibir informação do status se disponível
  const hasStatus = event.status && event.status.name;
  
  return (
    <div
      onClick={onClick}
      className="text-xs p-1 rounded-sm hover:brightness-90 transition-all cursor-pointer w-full"
      style={{ 
        backgroundColor: event.service.color,
        borderLeft: hasStatus ? `3px solid ${event.status?.color || '#ccc'}` : 'none'
      }}
      title={`${event.title} - ${event.service.name}${hasStatus ? ` (${event.status?.name})` : ''}`}
    >
      <div className="font-medium text-white truncate">
        {truncatedTitle}
      </div>
      <div className="text-white/80 truncate">
        {event.service.name}
      </div>
    </div>
  );
}
