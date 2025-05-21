
import { useState } from "react";
import { CalendarEvent } from "@/types/oni-agencia";
import { Calendar } from "@/components/oni_agencia/content-schedule/calendar/Calendar";
import { CaptureEventsList } from "./CaptureEventsList";
import { ContentScheduleLoading } from "@/components/oni_agencia/content-schedule/ContentScheduleLoading";
import { useDndContext } from "@/components/oni_agencia/content-schedule/hooks/useDndContext";
import { DndContext } from "@dnd-kit/core";
import { useCustomDndSensors } from "@/components/oni_agencia/content-schedule/hooks/useCustomSensors";
import { CaptureScheduleManager } from "./CaptureScheduleManager";

interface CapturasContentProps {
  viewMode: "calendar" | "list";
  filteredSchedules: CalendarEvent[];
  clientId: string;
  month: number;
  year: number;
  selectedCollaborator: string | null;
  onMonthYearChange: (month: number, year: number) => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  showLoadingState: boolean;
  isCollapsed: boolean;
  onManualRefetch: () => void;
  onDialogStateChange?: (open: boolean) => void;
}

export function CapturasContent({
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
  onManualRefetch,
  onDialogStateChange
}: CapturasContentProps) {
  // State for capture dialog management
  const [isCaptureDialogOpen, setIsCaptureDialogOpen] = useState(false);
  const [selectedCaptureDate, setSelectedCaptureDate] = useState<Date | null>(null);
  const [selectedCapture, setSelectedCapture] = useState<CalendarEvent | null>(null);
  
  // Filter events to only those with capture_date and status "Liberado para Captura"
  const captureEvents = filteredSchedules.filter(event => 
    event.capture_date && event.status?.name === "Liberado para Captura"
  );
  
  // Configure sensors with zero delay for better responsiveness
  const sensors = useCustomDndSensors(0, 3);
  
  // Use the DndContext hook for drag-and-drop functionality
  const {
    selectedEvent,
    selectedDate,
    isDialogOpen,
    handleEventClick,
    handleDateSelect,
    handleDragStart,
    handleDragEnd
  } = useDndContext({
    clientId,
    month,
    year,
    onManualRefetch
  });
  
  // Handle calendar date selection - open capture dialog
  const handleCalendarDateSelect = (date: Date) => {
    if (!clientId) {
      console.log("Cannot open capture dialog: client ID not provided");
      return;
    }
    
    console.log("Date selected in calendar:", date);
    setSelectedCaptureDate(date);
    setSelectedCapture(null);
    setIsCaptureDialogOpen(true);
    
    // Notify parent about dialog state change
    if (onDialogStateChange) {
      onDialogStateChange(true);
    }
  };
  
  // Handle calendar event click - open capture dialog with selected event
  const handleCalendarEventClick = (event: CalendarEvent, date: Date) => {
    if (!clientId) {
      console.log("Cannot open capture dialog: client ID not provided");
      return;
    }
    
    console.log("Event clicked in calendar:", event.id, event.title);
    setSelectedCaptureDate(date);
    setSelectedCapture(event);
    setIsCaptureDialogOpen(true);
    
    // Notify parent about dialog state change
    if (onDialogStateChange) {
      onDialogStateChange(true);
    }
  };
  
  // Handle dialog close
  const handleDialogClose = () => {
    console.log("Closing capture dialog");
    setIsCaptureDialogOpen(false);
    
    // Notify parent about dialog state change
    if (onDialogStateChange) {
      onDialogStateChange(false);
    }
  };
  
  if (showLoadingState) {
    return <ContentScheduleLoading isCollapsed={isCollapsed} />;
  }
  
  return (
    <div className="w-full pt-4">
      {viewMode === "calendar" ? (
        <DndContext 
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <Calendar
            events={captureEvents}
            month={month}
            year={year}
            clientId={clientId}
            selectedCollaborator={selectedCollaborator}
            onMonthYearChange={onMonthYearChange}
            onDateSelect={handleCalendarDateSelect}
            onEventClick={handleCalendarEventClick}
            selectedDate={selectedDate}
            selectedEvent={selectedEvent}
            isDialogOpen={false} // We're using our custom dialog instead
            onDialogOpenChange={() => {}}
            onDialogClose={() => {}}
            onManualRefetch={onManualRefetch}
            useCaptureDate={true}
            prioritizeCaptureDate={true}
            defaultTab="capture"
          />
        </DndContext>
      ) : (
        <CaptureEventsList
          events={captureEvents}
          clientId={clientId}
          selectedCollaborator={selectedCollaborator}
          onManualRefetch={onManualRefetch}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          fetchNextPage={fetchNextPage}
          onDialogStateChange={onDialogStateChange}
          onEventClick={(event) => {
            setSelectedCaptureDate(null);
            setSelectedCapture(event);
            setIsCaptureDialogOpen(true);
            
            // Notify parent about dialog state change
            if (onDialogStateChange) {
              onDialogStateChange(true);
            }
          }}
        />
      )}
      
      {/* Capture Schedule Manager Dialog */}
      <CaptureScheduleManager
        isOpen={isCaptureDialogOpen}
        onClose={handleDialogClose}
        clientId={clientId}
        selectedDate={selectedCaptureDate}
        selectedCapture={selectedCapture}
        onCaptureCreated={onManualRefetch}
      />
    </div>
  );
}
