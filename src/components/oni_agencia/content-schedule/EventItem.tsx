
import React from 'react';
import { CalendarEvent } from "@/types/oni-agencia";
import { cn } from "@/lib/utils";

interface EventItemProps {
  event: CalendarEvent;
  onClick: (e: React.MouseEvent) => void;
  className?: string;
}

export function EventItem({ event, onClick, className }: EventItemProps) {
  // Default status color is gray if status is missing
  const statusColor = event?.status?.color || "gray";
  
  // Determine text color based on status background color
  const isDarkColor = statusColor && (
    statusColor.includes('purple') || 
    statusColor.includes('blue') || 
    statusColor.includes('indigo') || 
    statusColor.includes('violet') ||
    statusColor.includes('slate') ||
    statusColor.includes('gray') ||
    statusColor.includes('zinc') ||
    statusColor === 'black'
  );
  
  return (
    <div 
      className={cn(
        "event-item px-1 py-[2px] mb-[2px] rounded text-xs truncate cursor-pointer hover:opacity-80",
        `bg-${statusColor}-100 border-l-2 border-${statusColor}-500`,
        isDarkColor ? "text-gray-700" : "text-gray-800",
        className
      )}
      onClick={onClick}
      title={event.title || "Sem título"}
    >
      {event.title || "Sem título"}
    </div>
  );
}
