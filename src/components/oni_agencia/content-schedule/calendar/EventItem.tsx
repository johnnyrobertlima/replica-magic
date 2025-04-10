
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
  const truncatedTitle = title.length > 18 ? `${title.substring(0, 18)}...` : title;
  const productName = product?.name ? product.name : "";
  const displayText = product ? `${productName} - ${truncatedTitle}` : truncatedTitle;
  
  return (
    <div
      onClick={onClick}
      className="text-[10px] py-[2px] rounded-sm hover:brightness-90 transition-all cursor-pointer w-full flex items-center gap-[2px] mb-[1px] border-l-0 border-r border-t border-b border-gray-200 overflow-hidden"
      title={`${title} - ${service.name}${status ? ` (${status.name})` : ''}`}
    >
      {/* Service color block */}
      <div 
        className="h-full w-6 flex-shrink-0 flex items-center justify-center text-[9px] font-bold text-black" 
        style={{ backgroundColor: service.color || '#ccc' }}
      >
        {format(service.name)}
      </div>
      
      {/* Editorial line with symbol or color */}
      <div className="flex-shrink-0 w-6 h-full flex items-center justify-center"
           style={{ backgroundColor: editorial_line?.color || '#fff' }}>
        {editorial_line?.symbol ? (
          <span className="text-[9px] font-bold" title={editorial_line.name}>
            {editorial_line.symbol}
          </span>
        ) : (
          <Flag size={10} color="#000" />
        )}
      </div>
      
      {/* Collaborator photo or icon */}
      <Avatar className="h-4 w-4 flex-shrink-0">
        {collaborator?.photo_url ? (
          <img 
            src={collaborator.photo_url} 
            alt={collaborator.name} 
            title={collaborator.name}
          />
        ) : (
          <div 
            className="bg-gray-300 h-full w-full flex items-center justify-center text-[8px] font-medium text-gray-700"
            title={collaborator?.name || "Sem responsável"}
          >
            {collaborator?.name?.charAt(0) || "?"}
          </div>
        )}
      </Avatar>
      
      {/* Main content: Status color, Product + Title */}
      <div 
        className="flex-grow overflow-hidden whitespace-nowrap pl-1 h-full" 
        style={{ 
          borderLeft: status?.color ? `3px solid ${status.color}` : 'none',
          backgroundColor: '#FEF7CD'
        }}
      >
        <span className="font-medium truncate text-[9px]">
          {displayText}
        </span>
      </div>
    </div>
  );
}

// Helper function to format service name (takes first two letters)
function format(name: string): string {
  if (!name) return "";
  const words = name.split(' ');
  if (words.length === 1) {
    return name.substring(0, 2).toUpperCase();
  } else {
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
  }
}
