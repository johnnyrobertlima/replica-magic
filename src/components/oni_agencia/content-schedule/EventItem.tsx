
import { CalendarEvent } from "@/types/oni-agencia";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface EventItemProps {
  event: CalendarEvent;
  onClick: (e: React.MouseEvent) => void;
}

export function EventItem({ event, onClick }: EventItemProps) {
  // Extract all the data we need from the event with proper null checks
  const { service, editorial_line, collaborator, status, product, title = "", id } = event;
  
  // Safely handle title
  const truncatedTitle = title && title.length > 18 ? `${title.substring(0, 18)}...` : title || "Sem título";
  
  // Safely handle product name
  const productName = product?.name || "";
  
  // Create display text - now prioritizing showing product name when available
  let displayText = truncatedTitle;
  
  // If product exists, combine product name with title
  if (product && productName) {
    displayText = `${productName} - ${truncatedTitle}`;
  }
  
  // Calculate text color based on background color brightness
  const calculateTextColor = (bgColor: string | null | undefined): string => {
    if (!bgColor) return "#fff";
    
    // Convert hex to RGB
    const hex = bgColor.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculate perceived brightness
    const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // If brightness is greater than 0.5, use black text, otherwise use white
    return brightness > 0.5 ? "#000" : "#fff";
  };
  
  const textColor = status?.color ? calculateTextColor(status.color) : "#000";
  
  // Safe service color
  const serviceColor = service?.color || '#ccc';
  
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        onClick(e);
      }}
      className="h-6 text-[10px] rounded-sm hover:brightness-90 transition-all cursor-pointer w-full flex items-center overflow-hidden"
      title={`${title || "Sem título"}${product ? ` - ${product.name}` : ""}${service ? ` (${service.name})` : ''}${status ? ` [${status.name}]` : ''}`}
      data-event-id={id}
    >
      {/* Service color block - no text */}
      <div 
        className="h-full w-6 flex-shrink-0" 
        style={{ backgroundColor: serviceColor }}
      />
      
      {/* Editorial line with color only - no icon/symbol */}
      <div 
        className="flex-shrink-0 w-6 h-full"
        style={{ backgroundColor: editorial_line?.color || '#fff' }}
      />
      
      {/* Collaborator photo using Avatar component */}
      <Avatar className="h-5 w-5 flex-shrink-0 border border-gray-200">
        {collaborator?.photo_url ? (
          <AvatarImage 
            src={collaborator.photo_url} 
            alt={collaborator.name || "Colaborador"}
            title={collaborator.name || "Sem responsável"}
          />
        ) : (
          <AvatarFallback className="text-[8px] bg-gray-300 text-gray-700">
            {collaborator?.name ? collaborator.name.charAt(0) : "?"}
          </AvatarFallback>
        )}
      </Avatar>
      
      {/* Main content: Status color, Product + Title */}
      <div 
        className="flex-grow overflow-hidden whitespace-nowrap pl-1 h-full flex items-center" 
        style={{ 
          backgroundColor: status?.color || '#FEF7CD',
          color: textColor
        }}
      >
        <span className="font-medium truncate text-[9px]">
          {displayText}
        </span>
      </div>
    </div>
  );
}
