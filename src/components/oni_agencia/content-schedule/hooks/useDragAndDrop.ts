
import { useState } from "react";
import { format } from "date-fns";
import { CalendarEvent } from "@/types/oni-agencia";
import { DragEndEvent } from "@dnd-kit/core";
import { useToast } from "@/hooks/use-toast";
import { useUpdateContentSchedule } from "@/hooks/useOniAgenciaContentSchedules";

export function useDragAndDrop(
  events: CalendarEvent[],
  userName: string
) {
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();
  const updateMutation = useUpdateContentSchedule();
  
  const handleDragStart = () => {
    setIsDragging(true);
  };
  
  const handleDragEnd = (event: DragEndEvent) => {
    setIsDragging(false);
    
    const { active, over } = event;
    
    // If not dropped on a valid day cell
    if (!over) return;
    
    const eventId = active.id as string;
    const targetDate = over.id as string;
    
    // Find the event being dragged
    const draggedEvent = events.find(event => event.id === eventId);
    if (!draggedEvent) return;
    
    // Verify target is a valid date
    if (!targetDate.match(/^\d{4}-\d{2}-\d{2}$/)) return;
    
    // Skip if date is the same
    if (draggedEvent.scheduled_date === targetDate) return;
    
    // User info for the action log
    const currentDateFormatted = format(new Date(), "dd/MM/yyyy HH:mm");
    
    // Prepare description with action log
    let updatedDescription = draggedEvent.description || '';
    const actionLog = `\n\nMovido por ${userName} em ${currentDateFormatted} de ${draggedEvent.scheduled_date} para ${targetDate}`;
    updatedDescription += actionLog;
    
    // Update the event with new date and description
    updateMutation.mutateAsync({
      id: draggedEvent.id,
      schedule: {
        scheduled_date: targetDate,
        description: updatedDescription
      }
    }).then(() => {
      toast({
        title: "Agendamento movido",
        description: `O agendamento foi movido para ${format(new Date(targetDate), "dd/MM/yyyy")}.`,
      });
    }).catch(error => {
      toast({
        title: "Erro ao mover agendamento",
        description: "Ocorreu um erro ao mover o agendamento.",
        variant: "destructive",
      });
    });
  };
  
  return {
    isDragging,
    handleDragStart,
    handleDragEnd
  };
}
