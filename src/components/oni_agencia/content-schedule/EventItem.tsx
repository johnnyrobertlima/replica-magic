
import { CalendarEvent } from "@/types/oni-agencia";

interface EventItemProps {
  event: CalendarEvent;
  onClick: (e: React.MouseEvent) => void;
}

export function EventItem({ event, onClick }: EventItemProps) {
  // Extract all the data we need from the event with proper null checks
  const { service, editorial_line, collaborator, status, product, title = "" } = event;
  
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
  
  const handleClick = (e: React.MouseEvent) => {
    // Add specific logging to track when an event is clicked
    console.log("EventItem clicked:", event.id, event.title);
    
    // Call the onClick handler, this should propagate to parent components
    onClick(e);
    
    // Ensure the event is captured and doesn't propagate further if needed
    e.stopPropagation();
  };
  
  return (
    <div
      onClick={handleClick}
      className="w-7 h-7 text-[9px] rounded-sm hover:brightness-90 transition-all cursor-pointer flex flex-col overflow-hidden event-item"
      title={`${title || "Sem título"}${product ? ` - ${product.name}` : ""}${service ? ` (${service.name})` : ''}${status ? ` [${status.name}]` : ''}`}
    >
      <div className="flex h-full">
        {/* Left column with service color and editorial line */}
        <div className="h-full flex flex-col flex-shrink-0 w-1.5">
          {/* Service color block - top half */}
          <div 
            className="h-1/2 w-full" 
            style={{ backgroundColor: serviceColor }}
          />
          
          {/* Editorial line color - bottom half */}
          <div 
            className="h-1/2 w-full"
            style={{ backgroundColor: editorial_line?.color || '#fff' }}
          />
        </div>
        
        {/* Main content area */}
        <div 
          className="flex-grow h-full overflow-hidden flex flex-col items-center justify-center p-0.5" 
          style={{ 
            backgroundColor: status?.color || '#FEF7CD',
            color: textColor
          }}
        >
          {/* Collaborator initial or photo - small and centered */}
          <div className="h-3 w-3 flex-shrink-0 rounded-full overflow-hidden mb-0.5 border border-gray-200">
            {collaborator?.photo_url ? (
              <img 
                src={collaborator.photo_url} 
                alt={collaborator.name} 
                className="h-full w-full object-cover"
              />
            ) : (
              <div 
                className="bg-gray-300 h-full w-full flex items-center justify-center text-[6px] font-medium text-gray-700"
                title={collaborator?.name || "Sem responsável"}
              >
                {collaborator?.name ? collaborator.name.charAt(0) : "?"}
              </div>
            )}
          </div>
          
          {/* Title text - very compact */}
          <span className="font-medium truncate text-[6px] leading-tight max-w-full text-center">
            {displayText}
          </span>
        </div>
      </div>
    </div>
  );
}
