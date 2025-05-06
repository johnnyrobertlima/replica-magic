
import React from 'react';
import { CalendarEvent } from "@/types/oni-agencia";
import { EventItem } from "./EventItem";
import { useDraggable } from '@dnd-kit/core';

interface DraggableEventItemProps {
  event: CalendarEvent;
  onClick: (e: React.MouseEvent) => void;
}

export function DraggableEventItem({ event, onClick }: DraggableEventItemProps) {
  // Garantimos que o ID do evento está definido
  const eventId = event.id || 'temp-' + Math.random().toString(36);
  
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: eventId,
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
  
  const handleClick = (e: React.MouseEvent) => {
    if (!isDragging) {
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
    >
      <EventItem 
        event={event} 
        onClick={handleClick} 
      />
    </div>
  );
}
