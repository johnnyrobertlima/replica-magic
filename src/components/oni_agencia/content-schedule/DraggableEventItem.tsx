
import React, { memo, useEffect } from 'react';
import { CalendarEvent } from "@/types/oni-agencia";
import { EventItem } from "./EventItem";
import { useDraggable } from '@dnd-kit/core';

interface DraggableEventItemProps {
  event: CalendarEvent;
  onClick: (e: React.MouseEvent) => void;
}

export const DraggableEventItem = memo(function DraggableEventItem({ 
  event, 
  onClick 
}: DraggableEventItemProps) {
  // Make sure we have a valid ID for the draggable item
  if (!event.id) {
    console.error("Attempted to render draggable event with no ID:", event);
    return <EventItem event={event} onClick={onClick} />;
  }
  
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: event.id,
    data: {
      event
    }
  });
  
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: isDragging ? 999 : 'auto',
    opacity: isDragging ? 0.8 : 1,
    position: isDragging ? 'absolute' : 'relative' as any
  } : undefined;
  
  // Log dragging state for debugging
  useEffect(() => {
    if (isDragging) {
      console.log(`Dragging event: ${event.id} - ${event.title}`);
    }
  }, [isDragging, event]);
  
  const handleClick = (e: React.MouseEvent) => {
    // Prevent click handling during drag operations
    if (!isDragging) {
      console.log("DraggableEventItem click detected for event:", event.id);
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
      data-event-id={event.id}
      data-test-draggable="true"
      data-drag-item-id={event.id}
    >
      <EventItem 
        event={event} 
        onClick={handleClick} 
        isDragging={isDragging}
      />
    </div>
  );
});
