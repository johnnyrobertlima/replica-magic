
import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { CalendarEvent } from "@/types/oni-agencia";
import { format } from "date-fns";
import { DndContext as DndContextComponent } from "@dnd-kit/core";
import { useDragAndDrop } from "./useDragAndDrop";

// Helper function to convert string date to Date object
const parseStringToDate = (dateString: string): Date => {
  if (dateString.includes('T')) {
    return new Date(dateString);
  }
  // Parse YYYY-MM-DD format to Date object
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

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
    handleDragStart,
    handleDragEnd,
    handleDrop
  } = useDragAndDrop();

  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(date);
    setSelectedEvent(undefined);
    setIsDialogOpen(true);
  }, []);

  const handleEventClick = useCallback((event: CalendarEvent, date: Date) => {
    setSelectedDate(date);
    setSelectedEvent(event);
    setIsDialogOpen(true);
  }, []);

  const handleDialogOpenChange = useCallback((open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      // Reset state when dialog is closed
      setSelectedEvent(undefined);
      setSelectedDate(undefined);
    }
  }, []);

  const handleDialogClose = useCallback(() => {
    setIsDialogOpen(false);
    setSelectedEvent(undefined);
    setSelectedDate(undefined);
  }, []);

  // Return the DndContext component to be used in the ContentArea
  const DndContext = DndContextComponent;

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
    handleDialogClose,
    DndContext
  };
}
