
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
  
  console.log("Setting up draggable for event:", event.id, event.title);
  
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: event.id,
    data: {
      event
    }
  });
  
  // Log when drag state changes
  useEffect(() => {
    if (isDragging) {
      console.log("Event is now being dragged:", event.id, event.title);
    }
  }, [isDragging, event.id, event.title]);
  
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: isDragging ? 999 : 'auto',
    opacity: isDragging ? 0.8 : 1,
    position: isDragging ? 'absolute' : 'relative' as any
  } : undefined;

  // Handle mouse/touch down - start a timer for long press
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    setLongPressTriggered(false);
    
    // Clear any existing timeout
    if (pressTimeoutRef.current) {
      clearTimeout(pressTimeoutRef.current);
    }
    
    // Set a timeout for long press (200ms - reduced from 300ms to make it more responsive)
    pressTimeoutRef.current = setTimeout(() => {
      setLongPressTriggered(true);
      console.log("Long press detected, enabling drag for event:", event.id);
    }, 200);
  };

  // Handle mouse/touch up - clear the timer if it exists
  const handleMouseUp = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    
    // Clear the timeout
    if (pressTimeoutRef.current) {
      clearTimeout(pressTimeoutRef.current);
      pressTimeoutRef.current = null;
    }
    
    // If it wasn't a long press, treat as a click
    if (!longPressTriggered && !isDragging) {
      if ('button' in e && e.button === 0) { // Left mouse click
        onClick(e as React.MouseEvent);
      } else {
        // For touch events
        onClick(e as unknown as React.MouseEvent);
      }
    }
  };
  
  // Handle click separately to avoid conflicts
  const handleClick = (e: React.MouseEvent) => {
    // Only trigger if not dragging and not long-pressed
    if (!isDragging && !longPressTriggered) {
      e.stopPropagation();
      onClick(e);
    }
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...listeners} 
      {...attributes}
      className="cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
      onClick={handleClick}
      data-event-id={event.id}
      data-draggable="true"
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
