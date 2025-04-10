
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
  
  // Calculate text color based on background color brightness
  // This is a simple implementation - a more robust solution would consider proper color contrast
  const calculateTextColor = (bgColor: string | null | undefined): string => {
    if (!bgColor) return "text-black";
    
    // Convert hex to RGB
    const hex = bgColor.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculate perceived brightness using the formula
    // (0.299*R + 0.587*G + 0.114*B)
    const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // If brightness is greater than 0.5, use black text, otherwise use white
    return brightness > 0.5 ? "text-black" : "text-white";
  };
  
  const textColorClass = calculateTextColor(status?.color);
  
  return (
    <div
      onClick={onClick}
      className="h-6 text-[10px] rounded-sm hover:brightness-90 transition-all cursor-pointer w-full flex items-center overflow-hidden"
      title={`${title} - ${service.name}${status ? ` (${status.name})` : ''}`}
    >
      {/* Service color block - no text */}
      <div 
        className="h-full w-6 flex-shrink-0" 
        style={{ backgroundColor: service.color || '#ccc' }}
      />
      
      {/* Editorial line with color and optional symbol - no text */}
      <div 
        className="flex-shrink-0 w-6 h-full flex items-center justify-center"
        style={{ backgroundColor: editorial_line?.color || '#fff' }}
      >
        {editorial_line?.symbol && (
          <span className="text-[9px] font-bold" title={editorial_line.name}>
            {editorial_line.symbol}
          </span>
        )}
      </div>
      
      {/* Collaborator photo or icon */}
      <Avatar className="h-5 w-5 flex-shrink-0 border border-gray-200">
        {collaborator?.photo_url ? (
          <img 
            src={collaborator.photo_url} 
            alt={collaborator.name} 
            title={collaborator.name}
            className="h-full w-full object-cover"
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
        className={`flex-grow overflow-hidden whitespace-nowrap pl-1 h-full flex items-center ${textColorClass}`} 
        style={{ backgroundColor: status?.color || '#FEF7CD' }}
      >
        <span className="font-medium truncate text-[9px]">
          {displayText}
        </span>
      </div>
    </div>
  );
}
