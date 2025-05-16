
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
  
  // Get appropriate initials for collaborator fallback
  const getCollaboratorInitials = () => {
    if (!collaborator?.name) return "?";
    
    const nameParts = collaborator.name.trim().split(/\s+/);
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    
    // Get first and last name initials
    return `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(0)}`.toUpperCase();
  };
  
  // Debug log for collaborator data
  console.log(`Rendering event ${id} with collaborator:`, collaborator);
  
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
            onError={(e) => {
              console.error(`Failed to load avatar image for ${collaborator.name || 'unknown'}:`, e);
              console.error(`Avatar URL that failed to load: ${collaborator.photo_url}`);
              // Let the fallback handle it
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        ) : (
          <AvatarFallback className="text-[8px] bg-gray-300 text-gray-700">
            {getCollaboratorInitials()}
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
