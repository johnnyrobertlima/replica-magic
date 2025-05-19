
import React, { useState, useRef, useEffect } from 'react';
import { CalendarEvent } from "@/types/oni-agencia";
import { EventItem } from "./EventItem";
import { useDraggable } from '@dnd-kit/core';
import { MoveIcon } from "lucide-react";

interface DraggableEventItemProps {
  event: CalendarEvent;
  onClick: (e: React.MouseEvent) => void;
}

export function DraggableEventItem({ event, onClick }: DraggableEventItemProps) {
  const [longPressTriggered, setLongPressTriggered] = useState(false);
  const pressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Debug log to verify events have IDs
  if (!event.id) {
    console.error("Attempted to render draggable event with no ID:", event);
    return <EventItem event={event} onClick={onClick} />;
  }
  
  // Create a useDraggable hook with the event ID
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `event-${event.id}`,
    data: {
      event,
      type: 'calendar-event'
    }
  });
  
  // Apply styles for dragging
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: isDragging ? 999 : 'auto',
    opacity: isDragging ? 0.8 : 1,
    boxShadow: isDragging ? '0 5px 10px rgba(0,0,0,0.15)' : 'none',
    position: isDragging ? 'absolute' : 'relative' as any,
    cursor: isDragging ? 'grabbing' : 'grab'
  } : {
    cursor: 'grab'
  };
  
  // Add touch events for better mobile experience
  const handleTouchStart = (e: React.TouchEvent) => {
    pressTimeoutRef.current = setTimeout(() => {
      setLongPressTriggered(true);
    }, 300);
  };
  
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (pressTimeoutRef.current) {
      clearTimeout(pressTimeoutRef.current);
    }
    // Reset after a short delay to allow click handling
    setTimeout(() => {
      setLongPressTriggered(false);
    }, 100);
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
      console.log("Event is being dragged:", event.id, event.title);
      document.body.style.cursor = 'grabbing';
    } else {
      document.body.style.cursor = '';
    }
    
    return () => {
      document.body.style.cursor = '';
    };
  }, [isDragging, event.id, event.title]);

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
      data-event-id={event.id}
      data-draggable="true"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="touch-none cursor-grab active:cursor-grabbing hover:brightness-95 transition-all relative"
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
