
import React from "react";
import { CalendarEvent } from "@/types/oni-agencia";
import { cn } from "@/lib/utils";

interface EventItemProps {
  event: CalendarEvent;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  showBorder?: boolean;
  isDragging?: boolean;
}

export function EventItem({
  event,
  onClick,
  className,
  showBorder = true,
  isDragging = false,
}: EventItemProps) {
  // Generate a default color if no editorial line or status color is available
  const dotColor = 
    event.editorial_line?.color || 
    event.status?.color || 
    '#9CA3AF';
  
  // Handle special styling for dragging state
  const itemStyle = isDragging
    ? { opacity: 0.5, cursor: 'grabbing' }
    : { cursor: 'pointer' };

  return (
    <div
      className={cn(
        "flex items-center p-1 rounded-sm text-xs font-medium bg-white event-item",
        showBorder && "border border-gray-200",
        isDragging ? "opacity-50" : "",
        className
      )}
      style={itemStyle}
      onClick={onClick}
    >
      {/* Editorial color dot - no icon */}
      <span 
        className="h-2 w-2 rounded-full flex-shrink-0 mr-1.5" 
        style={{ backgroundColor: dotColor }} 
      />
      
      <div className="flex-1 truncate">
        <div className="truncate">{event.title || "Sem título"}</div>
        
        {/* Client and product info in smaller size */}
        <div className="card-client-product">
          {event.client && (
            <span className="card-info-item">{event.client.name}</span>
          )}
          {event.product && event.client && <span>·</span>}
          {event.product && (
            <span className="card-info-item">{event.product.name}</span>
          )}
        </div>
      </div>
    </div>
  );
}
