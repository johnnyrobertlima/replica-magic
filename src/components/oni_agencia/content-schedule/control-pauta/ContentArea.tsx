
import { useState } from "react";
import { Calendar } from "@/components/oni_agencia/content-schedule/calendar/Calendar";
import { ContentScheduleList } from "@/components/oni_agencia/content-schedule/ContentScheduleList";
import { CalendarEvent } from "@/types/oni-agencia";
import { useDndContext } from "@/components/oni_agencia/content-schedule/hooks/useDndContext";
import { ContentScheduleLoading } from "@/components/oni_agencia/content-schedule/ContentScheduleLoading";
import { PautaStatusIndicator } from "@/components/oni_agencia/content-schedule/PautaStatusIndicator";
import { DndContext, DragEndEvent, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import type { MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent } from "react";
import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";

interface ContentAreaProps {
  viewMode: "calendar" | "list";
  filteredSchedules: CalendarEvent[];
  clientId: string;
  month: number;
  year: number;
  selectedCollaborator?: string | null;
  onMonthYearChange: (month: number, year: number) => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  showLoadingState: boolean;
  isCollapsed: boolean;
  onManualRefetch?: () => void;
}

// Custom mouse sensor with improved activation for event items
class CustomMouseSensor extends MouseSensor {
  static activators = [{
    eventName: 'onMouseDown' as const,
    handler: ({ nativeEvent: event }: ReactMouseEvent<Element, MouseEvent>, { onActivation }: { onActivation: () => void }) => {
      if (event.button !== 0) return false; // Only left clicks
      
      // Check if we're clicking on a draggable event item
      const target = event.target as HTMLElement;
      const isDraggableEvent = target.closest('[data-draggable="true"]');
      
      if (!isDraggableEvent) return false;
      
      event.preventDefault();
      onActivation();
      return true;
    },
  }];
}

// Custom touch sensor with improved activation for event items
class CustomTouchSensor extends TouchSensor {
  static activators = [{
    eventName: 'onTouchStart' as const,
    handler: ({ nativeEvent: event }: ReactTouchEvent<Element>, { onActivation }: { onActivation: () => void }) => {
      const target = event.target as HTMLElement;
      const isDraggableEvent = target.closest('[data-draggable="true"]');
      
      if (!isDraggableEvent) return false;
      
      onActivation();
      return true;
    },
  }];
}

export function ContentArea({ 
  viewMode,
  filteredSchedules,
  clientId,
  month,
  year,
  selectedCollaborator,
  onMonthYearChange,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  showLoadingState,
  isCollapsed,
  onManualRefetch
}: ContentAreaProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const {
    selectedEvent,
    selectedDate,
    isDialogOpen,
    handleEventClick,
    handleDateSelect,
    handleDragEnd,
    handleDialogOpenChange,
    handleDialogClose
  } = useDndContext({
    clientId,
    month,
    year,
    onManualRefetch
  });
  
  // Configure sensors for drag operations with more permissive settings
  const sensors = useSensors(
    useSensor(CustomMouseSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 5,
      }
    }),
    useSensor(CustomTouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 5,
      }
    })
  );
  
  // Debug logs to track events count
  console.log(`ContentArea received ${filteredSchedules.length} events, showLoadingState=${showLoadingState}`);
  
  // Show status indicator when we have a valid clientId and data is loaded
  const showStatusIndicator = !!clientId && clientId !== "" && clientId !== "all" && !showLoadingState;
  
  // Show loading state if needed
  if (showLoadingState) {
    return <ContentScheduleLoading isCollapsed={isCollapsed} />;
  }
  
  return (
    <div className={`pt-4 ${isCollapsed ? 'mt-0' : 'mt-4'}`}>
      {showStatusIndicator && (
        <PautaStatusIndicator 
          events={filteredSchedules}
          clientId={clientId}
          month={month}
          year={year}
          onManualRefetch={onManualRefetch}
        />
      )}
      
      {viewMode === "calendar" ? (
        <DndContext 
          onDragEnd={handleDragEnd}
          sensors={sensors}
          onDragStart={(event) => {
            console.log("DndContext drag start detected in ContentArea:", event);
          }}
        >
          <Calendar 
            events={filteredSchedules}
            month={month}
            year={year}
            clientId={clientId}
            selectedCollaborator={selectedCollaborator}
            onMonthYearChange={onMonthYearChange}
            onDateSelect={handleDateSelect}
            onEventClick={handleEventClick}
            selectedDate={selectedDate}
            selectedEvent={selectedEvent}
            isDialogOpen={isDialogOpen}
            onDialogOpenChange={handleDialogOpenChange}
            onDialogClose={handleDialogClose}
            onManualRefetch={onManualRefetch}
          />
        </DndContext>
      ) : (
        <ContentScheduleList 
          events={filteredSchedules} 
          clientId={clientId} 
          selectedCollaborator={selectedCollaborator}
          onManualRefetch={onManualRefetch}
        />
      )}
    </div>
  );
}
