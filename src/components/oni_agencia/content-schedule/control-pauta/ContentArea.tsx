
import { useState, useEffect } from "react";
import { Calendar } from "@/components/oni_agencia/content-schedule/calendar/Calendar";
import { ContentScheduleList } from "@/components/oni_agencia/content-schedule/ContentScheduleList";
import { CalendarEvent } from "@/types/oni-agencia";
import { useDndContext } from "@/components/oni_agencia/content-schedule/hooks/useDndContext";
import { ContentScheduleLoading } from "@/components/oni_agencia/content-schedule/ContentScheduleLoading";
import { PautaStatusIndicator } from "@/components/oni_agencia/content-schedule/PautaStatusIndicator";
import { 
  DndContext, 
  DragStartEvent, 
  DragEndEvent, 
  DragOverlay, 
  useSensors 
} from "@dnd-kit/core";
import { useCustomDndSensors } from "@/components/oni_agencia/content-schedule/hooks/useCustomSensors";
import { EventItem } from "../EventItem";

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
    isDragging,
    activeDragEvent,
    handleEventClick,
    handleDateSelect,
    handleDragStart,
    handleDragEnd,
    handleDialogOpenChange,
    handleDialogClose
  } = useDndContext({
    clientId,
    month,
    year,
    onManualRefetch
  });
  
  // Configure sensors with zero delay for better responsiveness
  const sensors = useCustomDndSensors(0, 3);
  
  // Debug logs for events
  console.log(`ContentArea received ${filteredSchedules.length} events, showLoadingState=${showLoadingState}`);
  
  // Validate filteredSchedules to ensure it's always an array
  const safeSchedules = Array.isArray(filteredSchedules) ? filteredSchedules : [];
  
  // Show status indicator when we have a valid clientId and data is loaded
  const showStatusIndicator = !!clientId && clientId !== "" && clientId !== "all" && !showLoadingState;
  
  // Show loading state if needed
  if (showLoadingState) {
    return <ContentScheduleLoading isCollapsed={isCollapsed} />;
  }
  
  // Add class to body during drag for visual feedback
  const handleDragStartWithFeedback = (event: DragStartEvent) => {
    console.log("Drag start detected in ContentArea:", event);
    document.body.classList.add('dragging-active');
    
    // Make sure we have a valid event before calling the handler
    if (event.active && event.active.data && event.active.data.current) {
      handleDragStart(event);
    } else {
      console.warn("Drag start event missing active data:", event);
    }
  };

  const handleDragEndWithFeedback = (event: DragEndEvent) => {
    console.log("Drag end detected in ContentArea");
    document.body.classList.remove('dragging-active');
    
    // Make sure we have valid data before calling the handler
    if (event.over && event.over.data && event.over.data.current) {
      handleDragEnd(event);
    } else {
      console.warn("Drag end event missing over data:", event);
    }
  };

  return (
    <div className={`pt-4 ${isCollapsed ? 'mt-0' : 'mt-4'}`}>
      {showStatusIndicator && (
        <PautaStatusIndicator 
          events={safeSchedules}
          clientId={clientId}
          month={month}
          year={year}
          onManualRefetch={onManualRefetch}
        />
      )}
      
      {viewMode === "calendar" ? (
        <DndContext 
          sensors={sensors}
          onDragStart={handleDragStartWithFeedback}
          onDragEnd={handleDragEndWithFeedback}
        >
          <Calendar 
            events={safeSchedules}
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

          {/* Add drag overlay for visual feedback */}
          <DragOverlay>
            {isDragging && activeDragEvent && (
              <div className="opacity-80 pointer-events-none">
                <EventItem 
                  event={activeDragEvent} 
                  onClick={() => {}} 
                />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      ) : (
        <ContentScheduleList 
          events={safeSchedules} 
          clientId={clientId} 
          selectedCollaborator={selectedCollaborator}
          onManualRefetch={onManualRefetch}
        />
      )}
    </div>
  );
}
