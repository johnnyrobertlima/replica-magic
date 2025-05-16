
import { DndContext, useSensor, useSensors, PointerSensor, MouseSensor, TouchSensor } from "@dnd-kit/core";
import { Calendar } from "@/components/ui/calendar";
import { CalendarDay } from "./CalendarDay";
import { CalendarEvent } from "@/types/oni-agencia";
import { ptBR } from "date-fns/locale";
import { useDragAndDrop } from "../hooks/useDragAndDrop";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import type { MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent } from "react";

interface CalendarContainerProps {
  events: CalendarEvent[];
  selectedDate: Date | undefined;
  currentDate: Date;
  selectedCollaborator?: string | null;
  onSelect: (date: Date) => void;
  onEventClick: (event: CalendarEvent, date: Date) => void;
}

// Custom mouse sensor that only activates on left-click
class CustomMouseSensor extends MouseSensor {
  static activators = [{
    eventName: 'onMouseDown' as const,
    handler: ({ nativeEvent: event }: ReactMouseEvent<Element, MouseEvent>, { onActivation }: { onActivation: () => void }) => {
      if (event.button !== 0) return false; // Only left clicks
      
      // Check if we're clicking on a draggable element
      const target = event.target as HTMLElement;
      const isDraggable = target.closest('[data-draggable="true"]');
      
      if (!isDraggable) return false;
      
      onActivation();
      return true;
    },
  }];
}

// Custom touch sensor with improved activation
class CustomTouchSensor extends TouchSensor {
  static activators = [{
    eventName: 'onTouchStart' as const,
    handler: ({ nativeEvent: event }: ReactTouchEvent<Element>, { onActivation }: { onActivation: () => void }) => {
      // Check if we're touching a draggable element
      const target = event.target as HTMLElement;
      const isDraggable = target.closest('[data-draggable="true"]');
      
      if (!isDraggable) return false;
      
      onActivation();
      return true;
    },
  }];
}

export function CalendarContainer({
  events,
  selectedDate,
  currentDate,
  selectedCollaborator,
  onSelect,
  onEventClick
}: CalendarContainerProps) {
  // Get username first - maintain hook order
  const userName = useCurrentUser();
  
  // Configure sensors with improved settings for better drag detection
  const sensors = useSensors(
    useSensor(CustomMouseSensor, {
      // Activation delay in milliseconds
      activationConstraint: {
        delay: 150,
        tolerance: 8,
      },
    }),
    useSensor(CustomTouchSensor, {
      // Activation delay in milliseconds
      activationConstraint: {
        delay: 150,
        tolerance: 8,
      },
    }),
  );
  
  // Get drag-and-drop handlers
  const { isDragging, handleDragStart, handleDragEnd } = useDragAndDrop();

  return (
    <DndContext 
      sensors={sensors} 
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="w-full p-0">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={onSelect}
          month={currentDate}
          className="w-full rounded-md border-none"
          locale={ptBR}
          components={{
            Day: ({ date, ...dayProps }) => (
              <CalendarDay
                date={date}
                selectedDate={selectedDate}
                events={events}
                selectedCollaborator={selectedCollaborator}
                onSelect={onSelect}
                onEventClick={onEventClick}
              />
            ),
            Caption: () => null, // Hide the default caption since we have a custom header
          }}
        />
      </div>
    </DndContext>
  );
}
