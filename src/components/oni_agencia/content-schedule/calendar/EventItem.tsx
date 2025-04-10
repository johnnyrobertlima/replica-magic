
import { CalendarEvent } from "@/types/oni-agencia";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface EventItemProps {
  event: CalendarEvent;
  onClick: (event: React.MouseEvent) => void;
}

export function EventItem({ event, onClick }: EventItemProps) {
  return (
    <div
      className="w-full h-6 flex items-center text-xs rounded overflow-hidden cursor-pointer"
      onClick={onClick}
    >
      {/* Service color - first part */}
      <div 
        className="h-full w-6 flex-shrink-0" 
        style={{ backgroundColor: event.service.color }}
        title={event.service.name}
      />
      
      {/* Editorial line - second part */}
      {event.editorial_line ? (
        <div 
          className="h-full w-6 flex-shrink-0 flex items-center justify-center"
          style={{ backgroundColor: event.editorial_line.color || '#E5DEFF' }}
          title={event.editorial_line.name}
        >
          {event.editorial_line.symbol && (
            <span className="text-white text-[8px] font-bold">
              {event.editorial_line.symbol}
            </span>
          )}
        </div>
      ) : (
        <div className="h-full w-6 flex-shrink-0 bg-gray-100" />
      )}
      
      {/* Collaborator photo - third part */}
      <div className="h-full w-6 flex-shrink-0 flex items-center justify-center bg-gray-50">
        {event.collaborator ? (
          <Avatar className="h-5 w-5">
            <AvatarImage src={event.collaborator.photo_url || ''} alt={event.collaborator.name} />
            <AvatarFallback className="text-[8px]">
              {event.collaborator.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="h-5 w-5 rounded-full bg-gray-200" />
        )}
      </div>
      
      {/* Status color, Product and Title - fourth part (70%) */}
      <div 
        className="h-full flex-grow flex items-center overflow-hidden"
        style={{ 
          backgroundColor: event.status?.color || '#F1F0FB',
          color: event.status?.color ? '#fff' : '#000'
        }}
      >
        <div className="px-1 truncate">
          {event.product ? (
            <span className="font-semibold">{event.product.name}:</span>
          ) : null}
          {' '}
          <span className="truncate">{event.title}</span>
        </div>
      </div>
    </div>
  );
}
