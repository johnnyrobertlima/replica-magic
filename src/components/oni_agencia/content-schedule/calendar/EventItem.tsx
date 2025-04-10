
import { CalendarEvent } from "@/types/oni-agencia";
import { Avatar } from "@/components/ui/avatar";

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
      className="text-[10px] py-[2px] rounded-sm hover:brightness-90 transition-all cursor-pointer w-full flex items-center gap-0 mb-[1px] overflow-hidden"
      title={`${title} - ${service.name}${status ? ` (${status.name})` : ''}`}
    >
      {/* Service color block (without text) */}
      <div 
        className="h-full w-5 flex-shrink-0" 
        style={{ backgroundColor: service.color || '#ccc' }}
      />
      
      {/* Editorial line with color (without text or symbol) */}
      <div 
        className="flex-shrink-0 w-5 h-full"
        style={{ backgroundColor: editorial_line?.color || '#fff' }}
      />
      
      {/* Collaborator photo or icon */}
      <Avatar className="h-4 w-4 flex-shrink-0 rounded-none">
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
