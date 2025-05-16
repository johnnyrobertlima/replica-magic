
import React, { useState, useRef, useEffect } from 'react';
import { CalendarEvent } from "@/types/oni-agencia";
import { EventItem } from "./EventItem";
import { useDraggable } from '@dnd-kit/core';

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
    position: isDragging ? 'absolute' : 'relative' as any,
    cursor: isDragging ? 'grabbing' : 'grab'
  } : {
    cursor: 'grab'
  };
  
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
      className="touch-none cursor-grab active:cursor-grabbing"
    >
      <EventItem 
        event={event} 
        onClick={(e) => {
          // The click will be handled by the parent div
          e.stopPropagation();
        }} 
      />
    </div>
  );
}
