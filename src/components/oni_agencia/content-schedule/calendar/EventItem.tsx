
import { CalendarEvent } from "@/types/oni-agencia";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Flag, Circle } from "lucide-react";

interface EventItemProps {
  event: CalendarEvent;
  onClick: (e: React.MouseEvent) => void;
}

export function EventItem({ event, onClick }: EventItemProps) {
  // Extract all the data we need from the event
  const { service, editorial_line, collaborator, status, product, title } = event;
  
  // Truncate the title and product name if they're too long
  const truncatedTitle = title.length > 25 ? `${title.substring(0, 25)}...` : title;
  const productName = product?.name ? product.name : "";
  const displayText = product ? `${productName} - ${truncatedTitle}` : truncatedTitle;
  
  return (
    <div
      onClick={onClick}
      className="text-xs p-1 rounded-sm hover:brightness-90 transition-all cursor-pointer w-full flex items-center gap-1 mb-1 border border-gray-200 overflow-hidden"
      title={`${title} - ${service.name}${status ? ` (${status.name})` : ''}`}
    >
      {/* Service color block */}
      <div 
        className="h-full w-5 flex-shrink-0" 
        style={{ backgroundColor: service.color || '#ccc' }}
      />
      
      {/* Editorial line with symbol or color */}
      {editorial_line && (
        <div className="flex-shrink-0 w-5">
          {editorial_line.symbol ? (
            <span title={editorial_line.name}>{editorial_line.symbol}</span>
          ) : (
            <Flag 
              size={14} 
              color={editorial_line.color || '#666'} 
              title={editorial_line.name}
            />
          )}
        </div>
      )}
      
      {/* Collaborator photo or icon */}
      <Avatar className="h-5 w-5 flex-shrink-0">
        {collaborator?.photo_url ? (
          <img 
            src={collaborator.photo_url} 
            alt={collaborator.name} 
            title={collaborator.name}
          />
        ) : (
          <div 
            className="bg-gray-300 h-full w-full flex items-center justify-center text-[10px] font-medium text-gray-700"
            title={collaborator?.name || "Sem responsável"}
          >
            {collaborator?.name?.charAt(0) || "?"}
          </div>
        )}
      </Avatar>
      
      {/* Main content: Status + Product + Title */}
      <div 
        className="flex-grow overflow-hidden whitespace-nowrap pl-1" 
        style={{ 
          borderLeft: status?.color ? `3px solid ${status.color}` : 'none'
        }}
      >
        <span className="font-medium truncate">
          {displayText}
        </span>
      </div>
    </div>
  );
}
