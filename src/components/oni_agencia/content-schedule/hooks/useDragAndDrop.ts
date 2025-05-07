
import { useState, useCallback } from 'react';
import { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { CalendarEvent } from '@/types/oni-agencia';
import { useToast } from "@/hooks/use-toast";

type DragCompleteCallback = (success: boolean, eventId?: string) => void;

export function useDragAndDrop(onDragComplete?: DragCompleteCallback) {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedEvent, setDraggedEvent] = useState<CalendarEvent | null>(null);
  const { toast } = useToast();

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    console.log('Início de drag para evento:', active.id);
    
    setIsDragging(true);
    
    // Store the dragged event for later use
    const eventData = active.data?.current?.event as CalendarEvent;
    if (eventData) {
      setDraggedEvent(eventData);
      console.log('Evento sendo arrastado:', eventData.title, eventData);
    }
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    setIsDragging(false);
    
    if (!over) {
      console.log('Drag cancelado - não há destino');
      return;
    }
    
    const eventId = active.id as string;
    const eventData = active.data?.current?.event as CalendarEvent;
    const newDateString = String(over.id);
    
    // Debug logs
    console.log(`Fim do drag - Evento: ${eventId}`);
    console.log(`Destino: ${newDateString}`);
    console.log('Active data:', active.data?.current);
    console.log('Over data:', over.data?.current);
    
    // Check if we have valid data
    if (!eventData || !newDateString) {
      console.log('Dados inválidos para processamento de drag');
      return;
    }
    
    // Check if the date actually changed
    if (eventData.scheduled_date === newDateString) {
      console.log('Data não alterada, ignorando drag');
      return;
    }
    
    // Log success and call the callback
    console.log(`Drag bem sucedido: ${eventData.title} movido para ${newDateString}`);
    
    toast({
      title: 'Evento movido',
      description: `O evento está sendo atualizado para a nova data.`,
    });
    
    // Notify the onDragComplete callback
    if (onDragComplete) {
      onDragComplete(true, eventId);
    }
    
    // Reset state
    setDraggedEvent(null);
  }, [onDragComplete, toast]);

  return {
    isDragging,
    draggedEvent,
    handleDragStart,
    handleDragEnd
  };
}
