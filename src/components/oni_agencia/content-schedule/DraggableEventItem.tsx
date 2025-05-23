
import React, { useState, useRef, useEffect } from 'react';
import { CalendarEvent } from "@/types/oni-agencia";
import { EventItem } from "./EventItem";
import { useDraggable } from '@dnd-kit/core';
import { MoveIcon } from "lucide-react";

interface DraggableEventItemProps {
  event: CalendarEvent;
  onClick: (e: React.MouseEvent) => void;
  dateContext?: string; // Added to ensure unique keys
}

export function DraggableEventItem({ event, onClick, dateContext }: DraggableEventItemProps) {
  const [longPressTriggered, setLongPressTriggered] = useState(false);
  const pressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Safety check for events without ID
  if (!event?.id) {
    console.error("Attempted to render draggable event with no ID:", event);
    return <EventItem event={event} onClick={onClick} />;
  }
  
  // Create a unique draggable ID that includes date context to avoid collisions
  const uniqueDraggableId = dateContext 
    ? `event-${event.id}-${dateContext}` 
    : `event-${event.id}`;
  
  // Create a useDraggable hook with the event ID
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: uniqueDraggableId,
    data: {
      event,
      type: 'calendar-event',
      originalId: event.id // Keep original ID for database operations
    }
  });
  
  // Apply styles for dragging
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: isDragging ? 999 : 'auto',
    opacity: isDragging ? 0.8 : 1,
    boxShadow: isDragging ? '0 5px 10px rgba(0,0,0,0.15)' : 'none',
    position: isDragging ? 'absolute' : 'relative' as any,
    cursor: isDragging ? 'grabbing' : 'grab',
    userSelect: 'none' as const,  // Prevent text selection
    WebkitUserSelect: 'none' as const, // For Safari
    MozUserSelect: 'none' as const, // For Firefox
    msUserSelect: 'none' as const // For IE/Edge
  } : {
    cursor: 'grab',
    userSelect: 'none' as const,  // Prevent text selection
    WebkitUserSelect: 'none' as const,
    MozUserSelect: 'none' as const,
    msUserSelect: 'none' as const
  };
  
  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (pressTimeoutRef.current) {
        clearTimeout(pressTimeoutRef.current);
      }
    };
  }, []);
  
  // Log when dragging state changes
  useEffect(() => {
    if (isDragging) {
      console.log("Event is being dragged:", event.id, event.title, "with unique ID:", uniqueDraggableId);
      document.body.style.cursor = 'grabbing';
    } else {
      document.body.style.cursor = '';
    }
    
    return () => {
      document.body.style.cursor = '';
    };
  }, [isDragging, event.id, event.title, uniqueDraggableId]);

  // Prevent default on mouse down to avoid text selection
  const handleMouseDown = (e: React.MouseEvent) => {
    // This prevents text selection when dragging
    e.preventDefault();
  };

  // Handle click separately to avoid conflicts with drag
  const handleClick = (e: React.MouseEvent) => {
    // Only trigger if not dragging
    if (!isDragging && !longPressTriggered) {
      e.stopPropagation();
      onClick(e);
    }
    
    // Reset long press flag
    setLongPressTriggered(false);
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...listeners} 
      {...attributes}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      data-event-id={event.id}
      data-unique-id={uniqueDraggableId}
      data-draggable="true"
      className="touch-none cursor-grab active:cursor-grabbing hover:brightness-95 transition-all relative select-none"
    >
      <EventItem 
        event={event} 
        onClick={(e) => {
          // The click will be handled by the parent div
          e.stopPropagation();
        }} 
      />
      
      {/* Add drag handle indicator */}
      {!isDragging && (
        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center justify-center w-4 h-4">
          <MoveIcon className="w-3 h-3 text-gray-400" />
        </div>
      )}
      
      {/* Visual feedback when dragging */}
      {isDragging && (
        <div className="absolute inset-0 bg-primary/10 border-2 border-primary rounded pointer-events-none" />
      )}
    </div>
  );
}
