
import React, { useState, useRef, useEffect } from 'react';
import { CalendarEvent } from "@/types/oni-agencia";
import { EventItem } from "./EventItem";
import { useDraggable } from '@dnd-kit/core';
import { MoveIcon } from "lucide-react";

interface DraggableEventItemProps {
  event: CalendarEvent;
  onClick: (e: React.MouseEvent) => void;
  dateContext?: string; // Adicionado para garantir chaves únicas
}

export function DraggableEventItem({ event, onClick, dateContext }: DraggableEventItemProps) {
  const [longPressTriggered, setLongPressTriggered] = useState(false);
  const pressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Checagem de segurança para eventos sem ID
  if (!event?.id) {
    console.error("Attempted to render draggable event with no ID:", event);
    return <EventItem event={event} onClick={onClick} />;
  }
  
  // Criar um ID único que inclui a data de contexto para evitar colisões
  const uniqueDraggableId = dateContext 
    ? `event-${event.id}-${dateContext}` 
    : `event-${event.id}`;
  
  // Create a useDraggable hook with the event ID
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: uniqueDraggableId,
    data: {
      event,
      type: 'calendar-event',
      originalId: event.id // Mantém o ID original para operações de banco de dados
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
      data-unique-id={uniqueDraggableId}
      data-draggable="true"
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
