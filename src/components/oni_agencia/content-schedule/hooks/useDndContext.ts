
import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { CalendarEvent } from "@/types/oni-agencia";
import { format } from "date-fns";
import { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { useDragAndDrop } from "./useDragAndDrop";
import { parseDateString } from "./utils/dateUtils";

interface UseDndContextProps {
  clientId: string;
  month: number;
  year: number;
  onManualRefetch?: () => void;
}

export function useDndContext({ clientId, month, year, onManualRefetch }: UseDndContextProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | undefined>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Use the existing drag and drop hook that has all the necessary state and handlers
  const {
    isDragging,
    activeDragEvent,
    handleDragStart: baseDragStart,
    handleDragEnd: baseDragEnd,
    handleDrop
  } = useDragAndDrop();
  
  // Enhance the handleDragStart function for better logging
  const handleDragStart = useCallback((event: DragStartEvent) => {
    console.log("Drag start detected in useDndContext:", event);
    console.log("Active element data:", event.active?.data?.current);
    
    // Call the base implementation
    baseDragStart(event);
  }, [baseDragStart]);
  
  // Wrap the handleDragEnd from useDragAndDrop to fit the DndContext's expected format
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    console.log("Drag end event triggered in useDndContext:", event);
    console.log("Over element data:", event.over?.data?.current);
    
    // Handle the drag end event
    baseDragEnd(event);
    
    // Manually trigger a refetch after drag operations
    setTimeout(() => {
      console.log("Triggering manual refetch after drag operation");
      if (onManualRefetch) {
        onManualRefetch();
      } else {
        // If no manual refetch provided, invalidate queries
        queryClient.invalidateQueries({ queryKey: ['content-schedules'] });
        queryClient.invalidateQueries({ queryKey: ['infinite-content-schedules'] });
      }
    }, 500);
  }, [baseDragEnd, onManualRefetch, queryClient]);

  const handleDateSelect = useCallback((date: Date) => {
    console.log("Date selected in useDndContext:", format(date, 'yyyy-MM-dd'));
    setSelectedDate(date);
    setSelectedEvent(undefined);
    setIsDialogOpen(true);
  }, []);

  const handleEventClick = useCallback((event: CalendarEvent, date: Date) => {
    console.log("Event clicked in useDndContext:", event.id, event.title);
    setSelectedDate(date);
    setSelectedEvent(event);
    setIsDialogOpen(true);
  }, []);

  const handleDialogOpenChange = useCallback((open: boolean) => {
    console.log("Dialog open change:", open);
    setIsDialogOpen(open);
    if (!open) {
      // Reset state when dialog is closed
      setSelectedEvent(undefined);
      setSelectedDate(undefined);
    }
  }, []);

  const handleDialogClose = useCallback(() => {
    console.log("Dialog close called");
    setIsDialogOpen(false);
    setSelectedEvent(undefined);
    setSelectedDate(undefined);
  }, []);

  return {
    selectedDate,
    selectedEvent,
    isDialogOpen,
    isDragging,
    activeDragEvent,
    handleDateSelect,
    handleEventClick,
    handleDragStart,
    handleDragEnd,
    handleDrop,
    handleDialogOpenChange,
    handleDialogClose
  };
}
